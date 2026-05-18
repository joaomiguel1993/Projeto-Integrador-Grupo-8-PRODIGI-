import { STORAGE_KEYS } from '../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);

  let username = null;
  if (rawUser) {
    try {
      const userObj = JSON.parse(rawUser);
      username = userObj.username || userObj.nome || userObj.idfunc || null;
    } catch {
      username = null;
    }
  }

  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(username ? { 'X-Username': String(username) } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Erro no pedido.');
  }

  return data;
}