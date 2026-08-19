import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const isHome = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <nav
      className={`premium-nav ${isHome ? 'premium-nav-home' : ''} ${
        scrolled || !isHome ? 'premium-nav-scrolled' : ''
      }`}
    >
      <div className="nav-inner">
        <Link to="/" className="brand-mark" aria-label="ABUAD Market Place home">
          <span className="brand-gem">A</span>
          <span className="brand-name">
            ABUAD <span>MARKET</span>
          </span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={navClass} end>
            Discover
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Shop
          </NavLink>
          <div className="category-menu">
            <Link to="/products" className="nav-link">
              Categories
            </Link>
            <div className="category-popover">
              <p>Explore</p>
              <Link to="/products?category=electronics">
                Electronics <span>→</span>
              </Link>
              <Link to="/products?category=fashion">
                Fashion <span>→</span>
              </Link>
              <Link to="/products?category=books">
                Books & study <span>→</span>
              </Link>
              <Link to="/products?category=home">
                Home & living <span>→</span>
              </Link>
            </div>
          </div>
          {user?.role === 'customer' && (
            <>
              <NavLink to="/customer/orders" className={navClass}>
                Orders
              </NavLink>
              <NavLink to="/customer/chat" className={navClass}>
                Messages
              </NavLink>
            </>
          )}
          {user?.role === 'vendor' && (
            <NavLink to="/vendor/dashboard" className={navClass}>
              Seller
            </NavLink>
          )}
          {user?.role === 'super_admin' && (
            <NavLink to="/admin/dashboard" className={navClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          <form onSubmit={handleSearch} className="nav-search" role="search">
            <Search size={15} aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              aria-label="Search products"
            />
          </form>

          {user?.role === 'customer' && (
            <Link to="/customer/wishlist" className="nav-icon" aria-label="Wishlist">
              <Heart size={18} aria-hidden="true" />
            </Link>
          )}

          <Link
            to="/cart"
            className="nav-icon"
            aria-label={`Shopping bag with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {itemCount > 0 && (
              <span className="cart-count">{itemCount > 9 ? '9+' : itemCount}</span>
            )}
          </Link>

          {user ? (
            <button type="button" onClick={handleLogout} className="nav-account" title="Sign out">
              <UserRound size={15} aria-hidden="true" />
              <span>{user.first_name || 'Account'}</span>
            </button>
          ) : (
            <Link to="/login" className="nav-account">
              <UserRound size={15} aria-hidden="true" />
              <span>Sign in</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="mobile-menu-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search" role="search">
            <Search size={17} aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search products"
              autoFocus
            />
          </form>
          <NavLink to="/" className={navClass} end>
            Discover
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Shop all
          </NavLink>
          {user?.role === 'customer' && (
            <>
              <NavLink to="/customer/orders" className={navClass}>
                Orders
              </NavLink>
              <NavLink to="/customer/wishlist" className={navClass}>
                Wishlist
              </NavLink>
              <NavLink to="/customer/following" className={navClass}>
                Following
              </NavLink>
              <NavLink to="/customer/updates" className={navClass}>
                Seller updates
              </NavLink>
              <NavLink to="/customer/chat" className={navClass}>
                Messages
              </NavLink>
            </>
          )}
          {user?.role === 'vendor' && (
            <NavLink to="/vendor/dashboard" className={navClass}>
              Seller portal
            </NavLink>
          )}
          {user?.role === 'super_admin' && (
            <NavLink to="/admin/dashboard" className={navClass}>
              Admin console
            </NavLink>
          )}
          {user ? (
            <button type="button" onClick={handleLogout} className="mobile-account">
              Sign out
            </button>
          ) : (
            <Link to="/login" className="mobile-account">
              Sign in to your account
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
