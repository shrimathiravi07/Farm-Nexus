import { apiFetch } from './api';

const USER_KEY = 'fn_user';
const TOKEN_KEY = 'fn_token';

function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({
    name: data.name,
    role: data.role,
    _id: data._id,
  }));
  return getUser();
}

export async function login(credentials) {
  return saveSession(await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }));
}

export async function register(details) {
  return saveSession(await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  }));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
