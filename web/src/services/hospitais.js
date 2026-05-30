import { apiFetch } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const listarHospitais = () =>
  fetch(`${API_URL}/api/v1/hospitais/`)
    .then((res) => res.json());

export const criarHospital = (payload) =>
  apiFetch('/api/v1/hospitais/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarHospital = (id, payload) =>
  apiFetch(`/api/v1/hospitais/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });