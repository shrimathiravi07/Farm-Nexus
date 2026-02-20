// ============================================================
// FarmNexus - Provider Dashboard (js/providerDashboard.js)
// ============================================================
/// <reference path="main.js"/>

document.addEventListener('DOMContentLoaded', async () => {
    const user = getUser();
    if (!getToken() || user?.role !== 'provider') return window.location.href = 'login.html';

    await loadStats();
    await loadProviderBookings();
});

async function loadStats() {
    try {
        const [equipment, slots] = await Promise.all([
            apiFetch('/equipment/my'),
            apiFetch('/slots/my'),
        ]);

        document.getElementById('equipCount').textContent = equipment.length;
        document.getElementById('slotCount').textContent = slots.filter(s => !s.isBooked).length;
        document.getElementById('bookingCount').textContent = slots.filter(s => s.isBooked).length;
    } catch (err) {
        console.error('Stats load error:', err);
    }
}

async function loadProviderBookings() {
    const tableBody = document.getElementById('providerBookingsTable');
    try {
        const bookings = await apiFetch('/appointments/provider');

        if (bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">No bookings for your equipment yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = bookings.map(b => `
            <tr>
                <td>
                    <strong>${b.farmer?.name || 'Farmer'}</strong><br/>
                    <small>${b.farmer?.phone || ''}</small>
                </td>
                <td>${b.equipment?.name || 'Equipment'}</td>
                <td>
                    ${new Date(b.slot?.date).toLocaleDateString()}<br/>
                    <small>${b.slot?.startTime} - ${b.slot?.endTime}</small>
                </td>
                <td><span class="badge ${getStatusBadgeClass(b.status)}">${b.status.toUpperCase()}</span></td>
                <td>
                    ${b.status === 'pending' ? `
                        <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="updateBookingStatus('${b._id}', 'confirmed')">Confirm</button>
                    ` : ''}
                    ${b.status !== 'cancelled' && b.status !== 'completed' ? `
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.8rem; margin-top:0.25rem;" onclick="updateBookingStatus('${b._id}', 'cancelled')">Cancel</button>
                    ` : '—'}
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Bookings load error:', err);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--danger);">Failed to load bookings.</td></tr>';
    }
}

async function updateBookingStatus(id, status) {
    if (!confirm(`Are you sure you want to set this booking to ${status}?`)) return;
    try {
        await apiFetch(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        await loadProviderBookings();
        await loadStats();
    } catch (err) {
        alert(err.message);
    }
}
