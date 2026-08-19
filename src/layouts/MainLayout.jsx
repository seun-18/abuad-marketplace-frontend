import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import CampusHeader from '../components/layout/CampusHeader';
import BottomNav from '../components/layout/BottomNav';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  // Hide bottom nav on auth-heavy paths if desired — keep for main app
  const showBottomNav = !pathname.startsWith('/login') && !pathname.startsWith('/register');

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout">
      <CampusHeader />
      <main
        className={`${isHome ? 'w-full flex-grow' : 'page-shell flex-grow'} ${
          showBottomNav ? 'main-with-bottom-nav' : ''
        }`}
      >
        <Outlet />
      </main>
      <Footer />
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
