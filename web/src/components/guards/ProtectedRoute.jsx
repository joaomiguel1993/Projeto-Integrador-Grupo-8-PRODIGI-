import { Navigate, Outlet } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants/roles';

export default function ProtectedRoute() {
  const isAuthenticated = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  if (isAuthenticated !== 'true') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}