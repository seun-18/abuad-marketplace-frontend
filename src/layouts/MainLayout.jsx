import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout market-light">
      <Navbar />
      <main
        className={
          isHome
            ? 'w-full flex-grow'
            : 'mx-auto w-full max-w-[1180px] flex-grow px-3 py-4 sm:px-4 sm:py-6'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
