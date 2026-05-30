const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let isRefreshing = false;

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('token');
  const rawUser = sessionStorage.getItem('user');

  let username = null;
  if (rawUser) {
    const userObj = JSON.parse(rawUser);
    username = userObj.username || userObj.nome || userObj.idfunc || null;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // necessário para enviar o cookie refresh_token
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(username ? { 'X-Username': String(username) } : {}),
      ...(options.headers || {}),
    },
  });

  // Token expirado — tentar refresh
  if (response.status === 401 && !isRefreshing && path !== '/api/v1/auth/refresh') {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        sessionStorage.setItem('token', refreshData.access_token);
        isRefreshing = false;

        // Repetir o pedido original com o novo token
        return apiFetch(path, options);
      }
    } catch {
      // refresh falhou
    }

    isRefreshing = false;
    // Redirecionar para login
    sessionStorage.clear();
    window.location.href = '/login';
    throw new Error('Sessão expirada.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || 'Erro no pedido.');
  }

  return data;
}