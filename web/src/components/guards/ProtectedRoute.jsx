import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = sessionStorage.getItem('is_authenticated');

  if (isAuthenticated !== 'true') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}