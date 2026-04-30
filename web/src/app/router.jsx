import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import RoleRoute from '../components/guards/RoleRoute';

import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import DashboardAdmin from '../pages/dashboards/DashboardAdmin';
import DashboardRececionista from '../pages/dashboards/DashboardRececionista';
import DashboardEnfermeiro from '../pages/dashboards/DashboardEnfermeiro';
import DashboardMedico from '../pages/dashboards/DashboardMedico';
import SemPermissao from '../pages/auth/SemPermissao';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/admin', element: <RoleRoute allowedRoles={['admin']}><DashboardAdmin /></RoleRoute> },
          { path: '/rececionista', element: <RoleRoute allowedRoles={['rececionista']}><DashboardRececionista /></RoleRoute> },
          { path: '/enfermeiro', element: <RoleRoute allowedRoles={['enfermeiro']}><DashboardEnfermeiro /></RoleRoute> },
          { path: '/medico', element: <RoleRoute allowedRoles={['medico']}><DashboardMedico /></RoleRoute> },
          { path: '/sem-permissao', element: <SemPermissao /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

export default router;