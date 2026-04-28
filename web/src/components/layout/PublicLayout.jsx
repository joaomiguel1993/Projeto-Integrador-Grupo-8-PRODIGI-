import { Outlet } from 'react-router-dom';
import HeaderPublic from './HeaderPublic';

export default function PublicLayout() {
  return (
    <div className="site-shell">
      <HeaderPublic />
      <main>
        <Outlet />
      </main>
    </div>
  );
}