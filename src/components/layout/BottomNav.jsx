import { Home, LayoutGrid, MessageCircle, Package, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const items = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/products', icon: LayoutGrid, label: 'Categories' },
    {
      to: user?.role === 'customer' ? '/customer/chat' : '/login',
      icon: MessageCircle,
      label: 'Chat',
      badge: 0,
    },
    {
      to: user?.role === 'customer' ? '/customer/orders' : '/login',
      icon: Package,
      label: 'Orders',
    },
    {
      to: user ? (user.role === 'vendor' ? '/vendor/dashboard' : user.role === 'super_admin' ? '/admin/dashboard' : '/customer/wishlist') : '/login',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(({ to, icon: Icon, label, end, badge }) => {
        const isActive =
          end
            ? location.pathname === to
            : location.pathname === to || location.pathname.startsWith(to + '/');

        return (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
            <span>{label}</span>
            {badge > 0 && (
              <span className="bottom-nav-badge">{badge > 9 ? '9+' : badge}</span>
            )}
            {isActive && <span className="nav-dot" aria-hidden="true" />}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
