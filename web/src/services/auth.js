const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
  }
  if (typeof data.detail === 'object') return JSON.stringify(data.detail);
  return fallback;
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Credenciais inválidas'));
  }

  return data;
}

export async function me() {
  const token = sessionStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Sessão inválida'));
  }

  return data;
}

export async function logout() {
  return Promise.resolve();
}