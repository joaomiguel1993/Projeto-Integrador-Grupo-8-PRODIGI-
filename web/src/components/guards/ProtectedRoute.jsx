import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants/roles';

export default function ProtectedRoute() {
  const location = useLocation();
  const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const role = sessionStorage.getItem(STORAGE_KEYS.USER_ROLE);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}