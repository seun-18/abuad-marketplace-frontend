import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Populate the "Categories" popover with real categories instead of
  // guessed slugs, so the links actually resolve to filtered results.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/categories/index.php')
      .then((res) => {
        if (!cancelled && res.data.success) {
          setTopCategories((res.data.data || []).slice(0, 4));
        }
      })
      .catch(() => {
        /* non-blocking — the "Shop" link still covers browsing all categories */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

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
            ABUAD <span>MARKET PLACE</span>
          </span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={navClass}>
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
              <p>Explore collections</p>
              {topCategories.length > 0 ? (
                topCategories.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.slug)}`}>
                    {cat.name} <span>→</span>
                  </Link>
                ))
              ) : (
                <Link to="/products">
                  Browse all <span>→</span>
                </Link>
              )}
            </div>
          </div>
          {user?.role === 'customer' && (
            <>
              <NavLink to="/customer/following" className={navClass}>
                Following
              </NavLink>
              <NavLink to="/customer/updates" className={navClass}>
                Updates
              </NavLink>
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
              Seller portal
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
            <Search size={16} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search anything"
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

      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search" role="search">
            <Search size={17} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search products"
            />
          </form>
          <NavLink to="/" className={navClass}>
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
