import {
  Bell,
  ChevronDown,
  MapPin,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSavedHall, saveHall } from '../../config/campus';
import CampusSelector from './CampusSelector';

const CampusHeader = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const [search, setSearch] = useState('');
  const [hall, setHall] = useState(getSavedHall);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [unread] = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
  }, [location.search]);

  const runSearch = useCallback(
    (query) => {
      const q = query.trim();
      navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    },
    [navigate]
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim().length >= 1 || value === '') {
        // Only navigate on products page for live filter feel; always allow submit
      }
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(search);
  };

  const handleSelectHall = (h) => {
    setHall(h);
    saveHall(h);
  };

  return (
    <>
      <header className="campus-header">
        <div className="campus-header-row1">
          <Link to="/" className="brand-mark" aria-label="ABUAD Market Place home">
            <span className="brand-gem">A</span>
            <span className="brand-name">
              ABUAD <span>MARKET</span>
            </span>
          </Link>

          {/* Desktop drop-off badge */}
          <button
            type="button"
            className="dropoff-pill dropoff-pill-desktop"
            onClick={() => setSelectorOpen(true)}
            aria-label={`Drop-off: ${hall.short}. Change location`}
          >
            <MapPin size={14} aria-hidden="true" />
            {hall.short}
            <ChevronDown size={14} aria-hidden="true" />
          </button>

          <form onSubmit={handleSubmit} className="header-search" role="search">
            <Search size={16} aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search textbooks, gadgets, food..."
              aria-label="Search products"
            />
            {search.length > 0 && (
              <button
                type="button"
                className="header-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearch('');
                  runSearch('');
                }}
              >
                <X size={12} />
              </button>
            )}
          </form>

          <div className="header-desktop-nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Discover
            </Link>
            <Link
              to="/products"
              className={location.pathname.startsWith('/products') ? 'active' : ''}
            >
              Shop
            </Link>
            {user?.role === 'vendor' && (
              <Link to="/vendor/dashboard">Seller</Link>
            )}
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon"
              aria-label={unread ? `${unread} notifications` : 'Notifications'}
            >
              <Bell size={18} aria-hidden="true" />
              {unread > 0 && (
                <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </button>

            <Link
              to="/cart"
              className="header-icon"
              aria-label={`Bag with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              {itemCount > 0 && (
                <span className="notif-badge">{itemCount > 9 ? '9+' : itemCount}</span>
              )}
            </Link>

            {user ? (
              <button
                type="button"
                className="header-icon"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
              >
                <UserRound size={18} aria-hidden="true" />
              </button>
            ) : (
              <Link to="/login" className="header-icon" aria-label="Sign in">
                <UserRound size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile second row */}
        <div className="campus-header-row2">
          <button
            type="button"
            className="dropoff-pill dropoff-pill-mobile"
            onClick={() => setSelectorOpen(true)}
            aria-label={`Drop-off: ${hall.short}. Change location`}
          >
            <MapPin size={14} aria-hidden="true" />
            Drop-off: {hall.short}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="filter-chip"
            onClick={() => navigate('/products')}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filter
          </button>
          <button
            type="button"
            className="sort-chip"
            onClick={() => navigate('/products?sort=latest')}
          >
            Sort
          </button>
        </div>
      </header>

      <CampusSelector
        open={selectorOpen}
        selected={hall}
        onSelect={handleSelectHall}
        onClose={() => setSelectorOpen(false)}
      />
    </>
  );
};

export default CampusHeader;
