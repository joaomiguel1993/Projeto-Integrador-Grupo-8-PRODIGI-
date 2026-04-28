import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import Home from '../pages/public/Home';
import LoginPage from '../pages/public/LoginPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
]);

export default router;