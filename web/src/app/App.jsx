import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home';
import LoginPage from '../pages/public/LoginPage';
import AdminDashboard from '../pages/private/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}