// ============================================================
// FarmNexus - Manage Equipment (js/manageEquipment.js)
// ============================================================
/// <reference path="main.js"/>

document.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) return window.location.href = 'login.html';
    await loadMyEquipment();

    document.getElementById('addEquipmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('equipError');
        errEl.textContent = '';
        const body = {
            name: document.getElementById('equipName').value.trim(),
            description: document.getElementById('equipDesc').value.trim(),
            category: document.getElementById('equipCategory').value.trim(),
            pricePerHour: Number(document.getElementById('pricePerHour').value),
        };
        try {
            await apiFetch('/equipment', { method: 'POST', body: JSON.stringify(body) });
            e.target.reset();
            await loadMyEquipment();
        } catch (err) { errEl.textContent = err.message; }
    });
});

async function loadMyEquipment() {
    const list = document.getElementById('myEquipmentList');
    try {
        const equipment = await apiFetch('/equipment/my');
        if (!equipment.length) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--text-muted);">No services listed yet.</p>';
            return;
        }
        list.innerHTML = equipment.map(eq => {
            let icon = '⚙️';
            if (eq.category === 'Tractor') icon = '🚜';
            if (eq.category === 'Irrigation') icon = '💧';
            if (eq.category === 'Drone') icon = '🛸';
            if (eq.category === 'Harvesting') icon = '🌾';
            if (eq.category === 'Lab') icon = '🧪';

            return `
                <div class="card" style="display:flex; flex-direction:column; align-items:center; text-align:center; gap: 0.5rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${icon}</div>
                    <h3 style="font-size: 1.1rem;">${eq.name}</h3>
                    <p class="price" style="color: var(--primary); font-weight:700;">₹${eq.pricePerHour}/hr</p>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${eq.category}</p>
                    <button class="btn btn-outline" style="font-size:0.8rem; margin-top: auto; padding: 0.4rem 0.8rem;" onclick="deleteEquipment('${eq._id}')">🗑 Remove</button>
                </div>`;
        }).join('');
    } catch (err) {
        list.innerHTML = '<p>Failed to load equipment.</p>';
    }
}

async function deleteEquipment(id) {
    if (!confirm('Delete this equipment?')) return;
    try {
        await apiFetch(`/equipment/${id}`, { method: 'DELETE' });
        await loadMyEquipment();
    } catch (err) { alert(err.message); }
}
