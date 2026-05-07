const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('token');
  const rawUser = sessionStorage.getItem('user');

  // GARANTIR QUE APANHA O NOME OU USERNAME
  let username = null;
  if (rawUser) {
    const userObj = JSON.parse(rawUser);
    username = userObj.username || userObj.nome || userObj.idfunc || null;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(username ? { 'X-Username': String(username) } : {}), // Forçar String
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || 'Erro no pedido.');
  }

  return data;
}