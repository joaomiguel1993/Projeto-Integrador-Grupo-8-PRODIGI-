import { apiFetch } from './api';

export const listarProfissionais = () => apiFetch('/api/v1/profissionais/');

export const obterProfissional = (id) => apiFetch(`/api/v1/profissionais/${id}/`);

export const criarProfissional = (payload) =>
  apiFetch('/api/v1/profissionais/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarProfissional = (id, payload) =>
  apiFetch(`/api/v1/profissionais/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const removerProfissional = (id) =>
  apiFetch(`/api/v1/profissionais/${id}/`, {
    method: 'DELETE',
  });