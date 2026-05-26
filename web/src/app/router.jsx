import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import RoleRoute from '../components/guards/RoleRoute';
import Perfil from '../pages/private/Perfil';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import About from '../pages/public/About';
import Accessibility from '../pages/public/Accessibility';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import Faqs from '../pages/public/FAQ';
import HospitalDetalhe from '../pages/public/HospitalDetalhe';
import DashboardAdmin from '../pages/private/AdminDashboard';
import DashboardRececionista from '../pages/private/ReceptionistDashboard';
import DashboardEnfermeiro from '../pages/private/NurseDashboard';
import DashboardMedico from "../pages/private/doctor/DoctorDashboard";
import SemPermissao from '../pages/auth/SemPermissao';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/',                      element: <Home /> },
      { path: '/hospital/:id',          element: <HospitalDetalhe /> },
      { path: '/login',                 element: <Login /> },
      { path: '/sobre-nos',             element: <About /> },
      { path: '/politica-privacidade',  element: <PrivacyPolicy /> },
      { path: '/acessibilidade',        element: <Accessibility /> },
      { path: '/faqs',                  element: <Faqs /> },
      { path: '/sobre-nos',             element: <About /> },
      { path: '/politica-privacidade',  element: <PrivacyPolicy /> },
      { path: '/FAQS',                   element: <Faqs /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: (
          <RoleRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </RoleRoute>
        ),
      },
      {
        path: '/rececionista',
        element: (
          <RoleRoute allowedRoles={['rececionista', 'rececao', 'receção', 'recepcionista']}>
            <DashboardRececionista />
          </RoleRoute>
        ),
      },
      {
        path: '/enfermeiro',
        element: (
          <RoleRoute allowedRoles={['enfermeiro', 'enfermagem']}>
            <DashboardEnfermeiro />
          </RoleRoute>
        ),
      },
      {
        path: '/medico',
        element: (
          <RoleRoute allowedRoles={['medico', 'médico']}>
            <DashboardMedico />
          </RoleRoute>
        ),
      },
      {
        path: '/perfil',
        element: <Perfil />,
      },
      { path: '/sem-permissao', element: <SemPermissao /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
