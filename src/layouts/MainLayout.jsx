import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout market-light bg-white">
      <Navbar />
      <main
        className={
          isHome
            ? 'w-full flex-grow'
            : 'mx-auto w-full max-w-7xl flex-grow px-3 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:px-8'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
