import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, me as meRequest, logout as logoutRequest } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    meRequest()
      .then((data) => setUser(data))
      .catch(() => {
        sessionStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await loginRequest({ username, password });
    if (data?.access_token) sessionStorage.setItem('token', data.access_token);
    setUser(data?.user || data);
    return data;
  };

  const logout = async () => {
    try { await logoutRequest(); } catch {}
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
