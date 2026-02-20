// ============================================================
// FarmNexus - Manage Slots (js/manageSlots.js)
// ============================================================
/// <reference path="main.js"/>

document.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) return window.location.href = 'login.html';

    // Populate equipment dropdown
    const select = document.getElementById('slotEquipment');
    try {
        const equipment = await apiFetch('/equipment/my');
        select.innerHTML = equipment.map(eq => `<option value="${eq._id}">${eq.name}</option>`).join('');
    } catch (err) { select.innerHTML = '<option>Failed to load</option>'; }

    await loadMySlots();

    document.getElementById('addSlotForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('slotError');
        errEl.textContent = '';
        const body = {
            equipment: document.getElementById('slotEquipment').value,
            date: document.getElementById('slotDate').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
        };
        try {
            await apiFetch('/slots', { method: 'POST', body: JSON.stringify(body) });
            e.target.reset();
            await loadMySlots();
        } catch (err) { errEl.textContent = err.message; }
    });
});

async function loadMySlots() {
    const list = document.getElementById('mySlotList');
    try {
        const slots = await apiFetch('/slots/my');
        if (!slots.length) { list.innerHTML = '<p>No slots added yet.</p>'; return; }
        list.innerHTML = slots.map(s => `
      <div class="slot-card">
        <div>
          <strong>${s.equipment?.name || 'Equipment'}</strong><br/>
          📅 ${new Date(s.date).toLocaleDateString()} &nbsp;|&nbsp; ${s.startTime} – ${s.endTime}
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span class="badge ${s.isBooked ? 'badge-success' : 'badge-warning'}">${s.isBooked ? 'Booked' : 'Available'}</span>
          ${!s.isBooked ? `<button class="btn btn-outline" style="font-size:0.8rem; padding: 0.25rem 0.5rem;" onclick="deleteSlot('${s._id}')">🗑</button>` : ''}
        </div>
      </div>`).join('');
    } catch (err) { list.innerHTML = '<p>Failed to load slots.</p>'; }
}

async function deleteSlot(id) {
    if (!confirm('Delete this slot?')) return;
    try {
        await apiFetch(`/slots/${id}`, { method: 'DELETE' });
        await loadMySlots();
    } catch (err) { alert(err.message); }
}
