import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col home-layout market-dark">
      <Navbar />
      <main
        className={
          isHome
            ? 'w-full flex-grow'
            : 'mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 sm:py-12 lg:px-8'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
