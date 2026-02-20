// ============================================================
// FarmNexus - Book Appointment (js/bookAppointment.js)
// ============================================================
/// <reference path="main.js"/>

let selectedSlotId = null;
let selectedEquipId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) return window.location.href = 'login.html';

  await loadEquipment();

  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('bookingModal').classList.add('hidden');
  });

  document.getElementById('confirmBooking').addEventListener('click', async (e) => {
    const btn = e.target;
    const errEl = document.getElementById('bookingError');
    errEl.textContent = '';

    if (!selectedSlotId) {
      errEl.textContent = 'Please select a time slot first.';
      return;
    }

    if (!selectedEquipId) {
      errEl.textContent = 'Equipment error. Please reload the page.';
      return;
    }

    const notes = document.getElementById('bookingNotes').value;

    try {
      btn.disabled = true;
      btn.textContent = 'Booking...';

      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          equipment: selectedEquipId,
          slot: selectedSlotId,
          notes
        })
      });

      alert('Booking confirmed! Redirecting to your bookings...');
      window.location.href = 'myAppointments.html';
    } catch (err) {
      errEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Confirm Booking';
    }
  });
});

async function loadEquipment() {
  const list = document.getElementById('equipmentList');
  const urlParams = new URLSearchParams(window.location.search);
  const filterCat = urlParams.get('category');

  if (filterCat) {
    document.querySelector('header h1').textContent = `Book ${filterCat} Service`;
  }

  try {
    let equipment = await apiFetch('/equipment');

    // Client-side filtering for simplicity, or could pass to API
    if (filterCat) {
      equipment = equipment.filter(eq => eq.category.toLowerCase() === filterCat.toLowerCase());
    }

    if (!equipment.length) {
      list.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem;">
        <p style="color: var(--text-muted); font-size: 1.2rem;">No ${filterCat || ''} services available at the moment.</p>
        <a href="bookAppointment.html" class="btn btn-outline" style="margin-top: 1rem;">View All Services</a>
      </div>`;
      return;
    }

    list.innerHTML = equipment.map(eq => {
      let icon = '🚜';
      if (eq.category === 'Irrigation') icon = '💧';
      if (eq.category === 'Drone') icon = '🛸';
      if (eq.category === 'Harvesting') icon = '🌾';
      if (eq.category === 'Lab') icon = '🧪';

      return `
        <div class="equip-card card">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">${icon}</div>
          <h3>${eq.name}</h3>
          <p style="margin-bottom: 1rem; color: var(--text-muted); min-height: 3rem;">${eq.description || 'No description'}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border); pt: 1rem; margin-top: auto;">
            <p class="price" style="font-weight:700; color: var(--primary);">₹${eq.pricePerHour}/hr</p>
            <button class="btn btn-primary" onclick="openBooking('${eq._id}', '${eq.name}')">Book Now</button>
          </div>
          <p style="margin-top: 0.5rem;"><small>By: ${eq.provider?.name || 'Authorized Provider'}</small></p>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = '<p>Failed to load equipment. Please try again later.</p>';
  }
}

async function openBooking(equipId, equipName) {
  selectedEquipId = equipId;
  selectedSlotId = null; // Reset slot selection when opening new equipment
  document.getElementById('modalEquipmentName').textContent = `🚜 ${equipName}`;
  document.getElementById('bookingError').textContent = '';
  document.getElementById('bookingModal').classList.remove('hidden');

  const slotList = document.getElementById('slotList');
  slotList.innerHTML = '<p>Loading slots...</p>';
  try {
    const slots = await apiFetch(`/slots/equipment/${equipId}`);
    if (!slots.length) { slotList.innerHTML = '<p>No available slots.</p>'; return; }
    slotList.innerHTML = slots.map(s => `
      <div class="slot-card" style="cursor:pointer" onclick="selectSlot('${s._id}', this)">
        📅 ${new Date(s.date).toLocaleDateString()} &nbsp;|&nbsp; ${s.startTime} – ${s.endTime}
      </div>`).join('');
  } catch (err) { slotList.innerHTML = '<p>Failed to load slots.</p>'; }
}

function selectSlot(slotId, el) {
  selectedSlotId = slotId;
  document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}
