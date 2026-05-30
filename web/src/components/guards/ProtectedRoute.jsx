import { Navigate, Outlet } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants/roles';

export default function ProtectedRoute() {
  const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}