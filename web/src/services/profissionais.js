import { apiFetch } from './api';

export const listarProfissionais = () => apiFetch('/api/profissionais/');
export const criarProfissional = (payload) =>
  apiFetch('/api/profissionais/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });