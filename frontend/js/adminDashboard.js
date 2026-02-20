// ============================================================
// FarmNexus - Admin Dashboard (js/adminDashboard.js)
// ============================================================
/// <reference path="main.js"/>

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('fn_user'));
    if (!getToken() || (user && user.role !== 'admin')) {
        window.location.href = 'login.html';
        return;
    }

    await loadAdminStats();
    await loadAllUsers();
    await loadAllAppointments();
});

async function loadAdminStats() {
    try {
        const stats = await apiFetch('/admin/stats');
        document.getElementById('totalUsersCount').textContent = stats.users || 0;
        document.getElementById('totalBookingsCount').textContent = stats.bookings || 0;
        document.getElementById('totalSlotsCount').textContent = stats.slots || 0;
    } catch (err) {
        console.error('Stats error:', err);
    }
}

async function loadAllUsers() {
    const tableBody = document.getElementById('usersTableBody');
    try {
        const users = await apiFetch('/admin/users');
        if (!users.length) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No users registered yet.</td></tr>';
            return;
        }
        tableBody.innerHTML = users.map(u => `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-warning' : 'badge-success'}">${u.role.toUpperCase()}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--danger);">Error loading users.</td></tr>';
    }
}

async function loadAllAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    try {
        const data = await apiFetch('/admin/appointments');
        if (!data.length) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No bookings in the system.</td></tr>';
            return;
        }
        tableBody.innerHTML = data.map(appt => `
            <tr>
                <td>
                    <strong>${appt.farmer?.name || 'Unknown'}</strong><br/>
                    <small style="color:var(--text-muted)">${appt.farmer?.email || ''}</small>
                </td>
                <td>${appt.equipment?.name || 'Service'}</td>
                <td>
                    📅 ${new Date(appt.slot?.date).toLocaleDateString()}<br/>
                    ⏰ ${appt.slot?.startTime} - ${appt.slot?.endTime}
                </td>
                <td><span class="badge ${getStatusBadgeClass(appt.status)}">${appt.status.toUpperCase()}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--danger);">Error loading appointments.</td></tr>';
    }
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        default: return '';
    }
}
