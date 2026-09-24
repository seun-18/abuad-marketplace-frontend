import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Store,
  UserRound,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSavedHall } from '../../config/campus';

const Profile = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const hall = getSavedHall();
  const itemCount = getItemCount();

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Student';
  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((p) => p.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AM';

  const links = [
    {
      to: '/customer/orders',
      icon: Package,
      label: 'My orders',
      desc: 'Track deliveries & history',
      tone: 'orange',
    },
    {
      to: '/customer/wishlist',
      icon: Heart,
      label: 'Saved items',
      desc: 'Products you bookmarked',
      tone: 'rose',
    },
    {
      to: '/customer/chat',
      icon: MessageCircle,
      label: 'Messages',
      desc: 'Chat with campus sellers',
      tone: 'blue',
    },
    {
      to: '/customer/following',
      icon: Users,
      label: 'Following',
      desc: 'Stores you follow',
      tone: 'teal',
    },
    {
      to: '/customer/updates',
      icon: Store,
      label: 'Seller updates',
      desc: 'News from your stores',
      tone: 'violet',
    },
    {
      to: '/cart',
      icon: ShoppingBag,
      label: 'Shopping bag',
      desc: itemCount ? `${itemCount} item${itemCount === 1 ? '' : 's'} in bag` : 'Empty bag',
      tone: 'orange',
    },
  ];

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-guest">
          <div className="profile-guest-icon">
            <UserRound size={32} aria-hidden="true" />
          </div>
          <h1>Your account</h1>
          <p>Sign in to manage orders, saved items, and campus chats.</p>
          <div className="profile-guest-actions">
            <Link to="/login" className="btn btn-primary">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-outline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="profile-hero-copy">
          <p className="profile-kicker">My account</p>
          <h1>{displayName}</h1>
          <p className="profile-email">{user.email}</p>
          {user.phone ? <p className="profile-meta">{user.phone}</p> : null}
          <div className="profile-dropoff">
            <MapPin size={14} aria-hidden="true" />
            <span>Drop-off · {hall.short}</span>
          </div>
        </div>
      </section>

      <section className="profile-stats">
        <Link to="/customer/orders" className="profile-stat">
          <strong>—</strong>
          <span>Orders</span>
        </Link>
        <Link to="/customer/wishlist" className="profile-stat">
          <strong>—</strong>
          <span>Saved</span>
        </Link>
        <Link to="/cart" className="profile-stat">
          <strong>{itemCount}</strong>
          <span>In bag</span>
        </Link>
      </section>

      <section className="profile-section">
        <h2>Quick links</h2>
        <div className="profile-link-list">
          {links.map(({ to, icon: Icon, label, desc, tone }) => (
            <Link key={to} to={to} className={`profile-link profile-link-${tone}`}>
              <span className="profile-link-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="profile-link-copy">
                <strong>{label}</strong>
                <small>{desc}</small>
              </span>
              <ChevronRight size={18} className="profile-link-chevron" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2>Settings</h2>
        <div className="profile-link-list">
          <button type="button" className="profile-link profile-link-muted" disabled>
            <span className="profile-link-icon">
              <Settings size={18} aria-hidden="true" />
            </span>
            <span className="profile-link-copy">
              <strong>Account settings</strong>
              <small>Coming soon</small>
            </span>
          </button>
          <button
            type="button"
            className="profile-link profile-link-danger"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <span className="profile-link-icon">
              <LogOut size={18} aria-hidden="true" />
            </span>
            <span className="profile-link-copy">
              <strong>Sign out</strong>
              <small>End this session</small>
            </span>
            <ChevronRight size={18} className="profile-link-chevron" aria-hidden="true" />
          </button>
        </div>
      </section>

      <p className="profile-footer-note">ABUAD Market Place · Student-to-student commerce</p>
    </div>
  );
};

export default Profile;
