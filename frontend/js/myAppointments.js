// ============================================================
// FarmNexus - My Appointments (js/myAppointments.js)
// ============================================================
/// <reference path="main.js"/>

document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) return window.location.href = 'login.html';
  const list = document.getElementById('appointmentList');
  try {
    const appts = await apiFetch('/appointments/my');
    if (!appts.length) { list.innerHTML = '<p>No appointments yet.</p>'; return; }
    list.innerHTML = appts.map(a => `
      <div class="appt-card">
        <div>
          <strong>${a.equipment?.name || 'Equipment'}</strong><br/>
          <small>📅 ${a.slot ? new Date(a.slot.date).toLocaleDateString() : '—'} | ${a.slot?.startTime || ''} – ${a.slot?.endTime || ''}</small><br/>
          <small>💰 ₹${a.totalCost?.toFixed(2) || '—'}</small>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span class="badge ${getStatusBadgeClass(a.status)}">${a.status.toUpperCase()}</span>
          ${a.status !== 'cancelled' ? `<button class="btn btn-outline" style="font-size:0.8rem; padding: 0.25rem 0.5rem;" onclick="cancelAppt('${a._id}')">Cancel</button>` : ''}
        </div>
      </div>`).join('');
  } catch (err) { list.innerHTML = '<p>Failed to load appointments.</p>'; }
});

async function cancelAppt(id) {
  if (!confirm('Cancel this appointment?')) return;
  try {
    await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
    location.reload();
  } catch (err) { alert(err.message); }
}
