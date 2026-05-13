import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      const rawRole = sessionStorage.getItem(STORAGE_KEYS.USER_ROLE);
      const authFlag = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (authFlag && rawUser) {
        setUser(JSON.parse(rawUser));
        setRole(rawRole || '');
      } else {
        setUser(null);
        setRole('');
      }
    } catch {
      setUser(null);
      setRole('');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
    setUser(null);
    setRole('');
  };

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      isAuthenticated: sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) === 'true' && !!user,
      setUser,
      setRole,
      logout,
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}