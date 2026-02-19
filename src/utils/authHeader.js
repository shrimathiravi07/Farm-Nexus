// Retrieve JWT token from localStorage
export const getToken = () => localStorage.getItem('token');

// Build Authorization header for API calls
export const authHeader = () => {
    const token = getToken();
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

// Get user role from localStorage
export const getUserRole = () => localStorage.getItem('role');
