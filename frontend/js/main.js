// ============================================================
// FarmNexus - Shared API & Auth Utilities (js/main.js)
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// --- Token helpers ---
const getToken = () => localStorage.getItem('fn_token');
const getUser = () => JSON.parse(localStorage.getItem('fn_user') || 'null');
const logout = () => { localStorage.removeItem('fn_token'); localStorage.removeItem('fn_user'); window.location.href = 'login.html'; };

// --- Authenticated fetch wrapper ---
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Error');
    return data;
}

// --- Logout button wiring ---
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    const welcomeSpan = document.getElementById('welcomeUser');
    if (welcomeSpan) {
        const user = getUser();
        if (user) welcomeSpan.textContent = `👤 ${user.name}`;
    }
});

function getStatusBadgeClass(status) {
    if (!status) return 'badge-warning';
    switch (status.toLowerCase()) {
        case 'confirmed': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'cancelled':
        case 'deleted': return 'badge-danger';
        default: return 'badge-warning';
    }
}
