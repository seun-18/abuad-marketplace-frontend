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

const CHAT_PATHS = ['/customer/chat'];
const FULL_BLEED_PATHS = ['/products', '/customer/chat', '/customer/profile'];

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isChat = CHAT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isFullBleed =
    isHome || FULL_BLEED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isAuth) {
    return (
      <div className="min-h-screen min-h-[100dvh] overflow-x-hidden">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col home-layout overflow-x-hidden">
      <CampusHeader />
      <main
        className={`${isFullBleed ? 'w-full flex-grow' : 'page-shell flex-grow'} main-with-bottom-nav ${
          isChat ? 'main-chat-mode' : ''
        }`}
      >
        <Outlet />
      </main>
      {!isChat ? <Footer /> : null}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
