import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const normalizarRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  const role = normalizarRole(user?.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.map(normalizarRole).includes(role)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
}