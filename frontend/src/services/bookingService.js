import { apiFetch } from './api';

export const getMyAppointments = () => apiFetch('/appointments/my');
export const getProviderBookings = () => apiFetch('/appointments/provider');
export const getAdminAppointments = () => apiFetch('/admin/appointments');
export const getAvailableSlots = (equipmentId) => apiFetch(`/slots/equipment/${equipmentId}`);
export const getMySlots = () => apiFetch('/slots/my');
export const createSlot = (slot) => apiFetch('/slots', {
  method: 'POST',
  body: JSON.stringify(slot),
});
export const deleteSlot = (id) => apiFetch(`/slots/${id}`, { method: 'DELETE' });
export const createBooking = (booking) => apiFetch('/appointments', {
  method: 'POST',
  body: JSON.stringify(booking),
});
export const updateBookingStatus = (id, status) => apiFetch(`/appointments/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
});
export const cancelBooking = (id) => apiFetch(`/appointments/${id}`, { method: 'DELETE' });
