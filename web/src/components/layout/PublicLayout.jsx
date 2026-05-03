import { Outlet } from 'react-router-dom';
import HeaderPublic from './HeaderPublic';
import FooterLayout from './FooterLayout';

export default function PublicLayout() {
  return (
    <div className="site-shell">
      <HeaderPublic />
      <main>
        <Outlet />
      </main>
      <FooterLayout />
    </div>
  );
}