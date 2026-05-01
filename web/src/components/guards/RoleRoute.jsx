import { Navigate } from 'react-router-dom';

const normalizarRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const mapearRole = (rawRole) => {
  const role = normalizarRole(rawRole);

  if (['admin', 'administrador'].includes(role)) return 'admin';
  if (['rececionista', 'recepcionista', 'rececao', 'receção'].includes(role)) return 'rececionista';
  if (['enfermeiro', 'enfermagem'].includes(role)) return 'enfermeiro';
  if (['medico', 'médico'].includes(role)) return 'medico';

  return role;
};

export default function RoleRoute({ allowedRoles = [], children }) {
  const role = mapearRole(sessionStorage.getItem('user_role'));
  const allowed = allowedRoles.map(mapearRole);

  if (!allowed.includes(role)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
}