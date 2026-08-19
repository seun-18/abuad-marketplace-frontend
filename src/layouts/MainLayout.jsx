import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout market-light market-app">
      <Navbar />
      <main
        className={
          isHome
            ? 'w-full flex-grow'
            : 'mx-auto w-full max-w-[1180px] flex-grow px-3 py-3 sm:px-4 sm:py-5'
        }
      >
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
