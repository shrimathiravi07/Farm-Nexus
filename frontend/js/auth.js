// ============================================================
// FarmNexus - Auth: Login & Register (js/auth.js)
// ============================================================

const API_BASE = 'http://localhost:5000/api';

async function authRequest(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return { data: await res.json(), ok: res.ok };
}

// --- Login ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errEl = document.getElementById('loginError');
        errEl.textContent = '';

        const { data, ok } = await authRequest('/auth/login', { email, password });
        if (!ok) { errEl.textContent = data.message; return; }

        localStorage.setItem('fn_token', data.token);
        localStorage.setItem('fn_user', JSON.stringify({ name: data.name, role: data.role, _id: data._id }));

        if (data.role === 'admin') window.location.href = 'adminDashboard.html';
        else if (data.role === 'provider') window.location.href = 'providerDashboard.html';
        else window.location.href = 'dashboard.html';
    });
}

// --- Register ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const phone = document.getElementById('phone')?.value.trim();
        const errEl = document.getElementById('registerError');
        errEl.textContent = '';

        const { data, ok } = await authRequest('/auth/register', { name, email, password, role, phone });
        if (!ok) { errEl.textContent = data.message; return; }

        localStorage.setItem('fn_token', data.token);
        localStorage.setItem('fn_user', JSON.stringify({ name: data.name, role: data.role, _id: data._id }));

        if (data.role === 'provider') window.location.href = 'providerDashboard.html';
        else window.location.href = 'dashboard.html';
    });
}
