import {
  Bell,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const campusLocations = [
  'Salami Hall',
  'Motion Ground',
  'Main Gate',
  'Female Hostels',
  'Teaching Hospital',
  'PG Hostel',
  'Engineering Complex',
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const isHome = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem('abuad_dropoff_location') || 'Salami Hall'
  );
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setLocationOpen(false);
  }, [location.pathname]);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  const navClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;

  const goToSearch = (value) => {
    const query = value.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    window.clearTimeout(searchTimer.current);
    goToSearch(search);
    setMenuOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    window.clearTimeout(searchTimer.current);
    const query = value.trim();
    if (!query) return;
    if (query.length >= 2) {
      searchTimer.current = window.setTimeout(() => goToSearch(query), 300);
    }
  };

  const chooseLocation = (hall) => {
    setSelectedLocation(hall);
    localStorage.setItem('abuad_dropoff_location', hall);
    setLocationOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`premium-nav market-header ${isHome ? 'premium-nav-home' : ''} ${
          scrolled || !isHome ? 'premium-nav-scrolled' : ''
        }`}
      >
        <div className="nav-inner market-header-inner">
          <Link to="/" className="brand-mark" aria-label="ABUAD Market Place home">
            <span className="brand-gem">A</span>
            <span className="brand-name">
              ABUAD <span>MARKET PLACE</span>
            </span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" className={navClass}>Discover</NavLink>
            <NavLink to="/products" className={navClass}>Shop</NavLink>
            <NavLink to="/products" className={navClass}>Categories</NavLink>
            {user?.role === 'customer' && (
              <>
                <NavLink to="/customer/orders" className={navClass}>Orders</NavLink>
                <NavLink to="/customer/chat" className={navClass}>Messages</NavLink>
              </>
            )}
            {user?.role === 'vendor' && <NavLink to="/vendor/dashboard" className={navClass}>Seller portal</NavLink>}
            {user?.role === 'super_admin' && <NavLink to="/admin/dashboard" className={navClass}>Admin</NavLink>}
          </div>

          <div className="nav-actions">
            <form onSubmit={handleSearch} className="nav-search" role="search">
              <Search size={16} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />
              {search && (
                <button type="button" className="market-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </form>

            {user?.role === 'customer' && (
              <Link to="/customer/wishlist" className="nav-icon" aria-label="Wishlist">
                <Heart size={18} aria-hidden="true" />
              </Link>
            )}

            <Link to="/cart" className="nav-icon" aria-label={`Shopping bag with ${itemCount} items`}>
              <ShoppingBag size={18} aria-hidden="true" />
              {itemCount > 0 && <span className="cart-count">{itemCount > 9 ? '9+' : itemCount}</span>}
            </Link>

            <Link to={user ? '/customer/orders' : '/login'} className="nav-icon market-notification" aria-label="Notifications">
              <Bell size={18} aria-hidden="true" />
              <span className="market-notification-badge">1</span>
            </Link>

            {user ? (
              <button type="button" onClick={handleLogout} className="nav-account" title="Sign out">
                <UserRound size={16} aria-hidden="true" />
                <span>{user.first_name || 'Account'}</span>
              </button>
            ) : (
              <Link to="/login" className="nav-account">
                <UserRound size={16} aria-hidden="true" />
                <span>Sign in</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="mobile-menu-button"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        <div className="market-campus-row">
          <button type="button" className="market-campus-pill" onClick={() => setLocationOpen(true)}>
            <span className="market-campus-home">⌂</span>
            <span><strong>Drop-off:</strong> {selectedLocation}</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu market-mobile-menu">
            <form onSubmit={handleSearch} className="mobile-search" role="search">
              <Search size={17} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search textbooks, gadgets, food..."
                aria-label="Search products"
              />
              {search && (
                <button type="button" className="market-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </form>
            <NavLink to="/" className={navClass}>Discover</NavLink>
            <NavLink to="/products" className={navClass}>Shop all</NavLink>
            {user?.role === 'customer' && (
              <>
                <NavLink to="/customer/orders" className={navClass}>Orders</NavLink>
                <NavLink to="/customer/wishlist" className={navClass}>Wishlist</NavLink>
                <NavLink to="/customer/chat" className={navClass}>Messages</NavLink>
              </>
            )}
            {user?.role === 'vendor' && <NavLink to="/vendor/dashboard" className={navClass}>Seller portal</NavLink>}
            {user?.role === 'super_admin' && <NavLink to="/admin/dashboard" className={navClass}>Admin console</NavLink>}
            {user ? (
              <button type="button" onClick={handleLogout} className="mobile-account">Sign out</button>
            ) : (
              <Link to="/login" className="mobile-account">Sign in to your account</Link>
            )}
          </div>
        )}
      </nav>

      {locationOpen && (
        <div className="market-location-overlay" role="dialog" aria-modal="true" aria-label="Select drop-off location" onClick={() => setLocationOpen(false)}>
          <div className="market-location-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="market-sheet-handle" />
            <div className="market-sheet-heading">
              <div>
                <span className="market-mini-eyebrow">Campus delivery</span>
                <h2>Select drop-off location</h2>
              </div>
              <button type="button" onClick={() => setLocationOpen(false)} aria-label="Close location selector"><X size={20} /></button>
            </div>
            <div className="market-location-list">
              {campusLocations.map((hall) => (
                <button key={hall} type="button" className="market-location-option" onClick={() => chooseLocation(hall)}>
                  <span className="market-location-icon">⌖</span>
                  <span>{hall}</span>
                  {selectedLocation === hall && <Check size={18} className="market-location-check" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
