import { apiFetch } from './api';

export const listarHospitais = () => apiFetch('/api/v1/hospitais/');

export const criarHospital = (payload) =>
  apiFetch('/api/hospitais/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarHospital = (id, payload) =>
  apiFetch(`/api/hospitais/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });