import { apiFetch } from './api';

export const getEquipment = () => apiFetch('/equipment');
export const getEquipmentById = (id) => apiFetch(`/equipment/${id}`);
export const getMyEquipment = () => apiFetch('/equipment/my');
export const createEquipment = (equipment) => apiFetch('/equipment', {
  method: 'POST',
  body: JSON.stringify(equipment),
});
export const deleteEquipment = (id) => apiFetch(`/equipment/${id}`, { method: 'DELETE' });
