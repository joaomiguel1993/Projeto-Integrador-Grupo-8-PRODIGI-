import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/roles';

const AuthContext = createContext(null);

function getInitialAuthState() {
  try {
    const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    const rawRole = sessionStorage.getItem(STORAGE_KEYS.USER_ROLE);
    const authFlag = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (authFlag === 'true' && rawUser) {
      return {
        user: JSON.parse(rawUser),
        role: rawRole || '',
      };
    }
  } catch {
    // ignore
  }

  return {
    user: null,
    role: '',
  };
}

export function AuthProvider({ children }) {
  const initialAuth = getInitialAuthState();
  const [user, setUser] = useState(initialAuth.user);
  const [role, setRole] = useState(initialAuth.role);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
    setUser(null);
    setRole('');
  }, []);

  const isAuthenticated = useMemo(() => !!user && role !== '', [user, role]);

  const value = useMemo(
    () => ({ user, role, loading, isAuthenticated, setUser, setRole, logout }),
    [user, role, loading, isAuthenticated, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}