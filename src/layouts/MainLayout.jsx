import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout">
      <Navbar />
      <main className={isHome ? 'w-full flex-grow' : 'page-shell flex-grow'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
