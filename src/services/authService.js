import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const AUTH_URL = `${API_BASE_URL}/auth`;

// Register a new user
export const register = async (userData) => {
    const response = await axios.post(`${AUTH_URL}/register`, userData);
    return response.data;
};

// Login user and save token + role to localStorage
export const login = async (credentials) => {
    const response = await axios.post(`${AUTH_URL}/login`, credentials);
    const { token, role } = response.data;
    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
    }
    return response.data;
};

// Logout: clear token from localStorage
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

// Get current logged-in user profile
export const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${AUTH_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
