import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import CampusHeader from '../components/layout/CampusHeader';
import BottomNav from '../components/layout/BottomNav';

const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-phone',
];

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isAuth = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (isAuth) {
    return (
      <div className="min-h-screen min-h-[100dvh]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout">
      <CampusHeader />
      <main
        className={`${isHome ? 'w-full flex-grow' : 'page-shell flex-grow'} main-with-bottom-nav`}
      >
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
