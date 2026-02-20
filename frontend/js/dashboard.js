// ============================================================
// FarmNexus - Farmer Dashboard (js/dashboard.js)
// ============================================================
/// <reference path="main.js"/>

document.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) return window.location.href = 'login.html';

    try {
        const appointments = await apiFetch('/appointments/my');

        // Update stats
        document.getElementById('totalBookings').textContent = appointments.length;
        document.getElementById('pendingCount').textContent = appointments.filter(a => a.status === 'pending').length;
        document.getElementById('confirmedCount').textContent = appointments.filter(a => a.status === 'confirmed').length;

        // Update Recent Activity Table
        const tableBody = document.getElementById('recentBookingsTable');
        const recent = appointments.slice(0, 5); // Latest 5

        if (recent.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">No bookings found. <a href="bookAppointment.html">Rent some equipment!</a></td></tr>';
        } else {
            tableBody.innerHTML = recent.map(appt => `
                <tr>
                    <td><strong>${appt.equipment?.name || 'Equipment'}</strong></td>
                    <td>${new Date(appt.slot?.date).toLocaleDateString()}</td>
                    <td>${appt.slot?.startTime} - ${appt.slot?.endTime}</td>
                    <td><span class="badge ${getStatusBadgeClass(appt.status)}">${appt.status.toUpperCase()}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
        const tableBody = document.getElementById('recentBookingsTable');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--danger);">Failed to load recent activity.</td></tr>';
    }
});

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        default: return '';
    }
}
