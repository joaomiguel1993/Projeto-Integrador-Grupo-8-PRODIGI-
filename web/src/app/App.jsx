import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './constants/roles';

import Login from './pages/auth/Login';
import AdminDashboard from './pages/private/AdminDashboard';
import NurseDashboard from './pages/private/NurseDashboard';
import DoctorDashboard from './pages/private/DoctorDashboard';
import RececionistDashboard from './pages/private/RececionistDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ENFERMEIRO]} />}>
          <Route path="/enfermeiro" element={<NurseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.MEDICO]} />}>
          <Route path="/medico" element={<DoctorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.RECECIONISTA]} />}>
          <Route path="/rececionista" element={<RececionistDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}