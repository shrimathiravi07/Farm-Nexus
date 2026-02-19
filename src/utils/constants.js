// Base URL for the backend API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User roles
export const ROLES = {
    ADMIN: 'admin',
    USER: 'user',
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
};

// Slot statuses
export const SLOT_STATUS = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
};
