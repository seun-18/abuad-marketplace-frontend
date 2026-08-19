import { Grid2X2, Home, MessageCircle, Package, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const customer = user?.role === 'customer';

  const items = [
    { to: '/', label: 'Home', Icon: Home },
    { to: '/products', label: 'Categories', Icon: Grid2X2 },
    { to: customer ? '/customer/chat' : '/login', label: 'Chat', Icon: MessageCircle },
    { to: customer ? '/customer/orders' : '/login', label: 'Orders', Icon: Package },
    { to: customer ? '/customer/orders' : '/login', label: 'Profile', Icon: UserRound },
  ];

  return (
    <nav className="market-bottom-nav" aria-label="Mobile navigation">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={label} to={to} className={({ isActive }) => `market-bottom-item ${isActive ? 'is-active' : ''}`}>
          <span className="market-bottom-icon"><Icon size={19} strokeWidth={2.2} /></span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
