import { apiFetch } from './api';

export const listarProfissionais = () => apiFetch('/api/v1/profissionais/');
export const criarProfissional = (payload) =>
  apiFetch('/api/v1/profissionais/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });