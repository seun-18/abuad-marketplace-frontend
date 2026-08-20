import {
  ArrowUpRight,
  Banknote,
  Box,
  Eye,
  Megaphone,
  PackageCheck,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const VendorDashboard = () => {
  const [metrics, setMetrics] = useState({
    total_products: 0,
    active_products: 0,
    units_sold: 0,
    gross_sales: 0,
    followers_count: 0,
    updates_count: 0,
    average_rating: 0,
    profile: {},
    wallet: {
      available_balance: 0,
      pending_balance: 0,
      total_withdrawn: 0,
    },
    recent_orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api
      .get('/vendors/dashboard.php')
      .then((response) => {
        if (response.data.success) setMetrics(response.data.data);
      })
      .catch((error) => {
        console.error('Failed to load vendor dashboard:', error);
        setErrorMessage(error.response?.data?.message || 'Could not load your store dashboard.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-loading">Preparing your store workspace…</div>;

  const { wallet = {}, profile = {}, recent_orders: recentOrders = [] } = metrics;
  const statCards = [
    {
      label: 'Gross sales',
      value: `₦${Number(metrics.gross_sales).toLocaleString()}`,
      detail: `${Number(metrics.units_sold).toLocaleString()} units sold`,
      Icon: Banknote,
      tone: 'gold',
    },
    {
      label: 'Followers',
      value: Number(metrics.followers_count).toLocaleString(),
      detail: `${Number(metrics.updates_count).toLocaleString()} store updates`,
      Icon: Users,
      tone: 'violet',
    },
    {
      label: 'Active products',
      value: Number(metrics.active_products).toLocaleString(),
      detail: `${Number(metrics.total_products).toLocaleString()} total listings`,
      Icon: Box,
      tone: 'blue',
    },
    {
      label: 'Store rating',
      value: Number(metrics.average_rating || 0).toFixed(1),
      detail: 'From verified customers',
      Icon: Star,
      tone: 'green',
    },
  ];

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">ABUAD seller workspace</p>
          <h1>{profile.shop_name || 'Your store'}, at a glance.</h1>
          <p>Sales, audience growth, fulfilment, and the signals that matter today.</p>
        </div>
        <div className="dashboard-verification dashboard-location-note">
          <span>
            <strong>Store pickup</strong>
            {profile.pickup_location_name || 'Campus pickup point not set'}
          </span>
        </div>
      </div>

      {errorMessage && <div className="dashboard-alert dashboard-alert-error">{errorMessage}</div>}

      <div className="dashboard-stat-grid">
        {statCards.map(({ label, value, detail, Icon, tone }) => (
          <article key={label} className={`dashboard-stat-card dashboard-stat-${tone}`}>
            <div className="stat-icon">
              <Icon size={18} aria-hidden="true" />
            </div>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-two-column">
        <section className="dashboard-panel dashboard-performance">
          <div className="panel-heading">
            <div>
              <p>Store performance</p>
              <span>Sales distribution snapshot</span>
            </div>
            <Eye size={18} />
          </div>
          <div className="performance-hero">
            <div>
              <span>Lifetime gross sales</span>
              <strong>₦{Number(metrics.gross_sales).toLocaleString()}</strong>
            </div>
            <div className="performance-orbit">
              <span>{Number(metrics.units_sold).toLocaleString()}</span>
              <small>units sold</small>
            </div>
          </div>
          <div className="performance-bars" aria-label="Store performance indicators">
            {[
              ['Catalog active', metrics.active_products, Math.max(metrics.total_products, 1)],
              ['Audience reach', metrics.followers_count, Math.max(metrics.followers_count, 25)],
              ['Update activity', metrics.updates_count, Math.max(metrics.updates_count, 8)],
            ].map(([label, value, maximum]) => (
              <div key={label}>
                <p>
                  <span>{label}</span>
                  <strong>{Number(value).toLocaleString()}</strong>
                </p>
                <div className="bar-track">
                  <span
                    className="bar-fill"
                    style={{ width: `${Math.min(100, (Number(value) / Number(maximum)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel dashboard-wallet">
          <div className="panel-heading">
            <div>
              <p>Wallet</p>
              <span>Available after successful fulfilment</span>
            </div>
            <Banknote size={18} />
          </div>
          <div className="wallet-balance">
            <span>Available balance</span>
            <strong>₦{Number(wallet.available_balance || 0).toLocaleString()}</strong>
          </div>
          <div className="wallet-split">
            <p>
              <span>Pending</span>
              <strong>₦{Number(wallet.pending_balance || 0).toLocaleString()}</strong>
            </p>
            <p>
              <span>Withdrawn</span>
              <strong>₦{Number(wallet.total_withdrawn || 0).toLocaleString()}</strong>
            </p>
          </div>
          <Link to="/vendor/payouts" className="dashboard-action-link">
            Manage payouts
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      <div className="dashboard-two-column dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Recent orders</p>
              <span>Your latest campus orders</span>
            </div>
            <PackageCheck size={18} />
          </div>
          {recentOrders.length === 0 ? (
            <p className="dashboard-empty">New orders will appear here.</p>
          ) : (
            <div className="dashboard-order-list">
              {recentOrders.map((order, index) => (
                <div key={order.order_id || index}>
                  <span className="order-icon">
                    <ShoppingBag size={15} />
                  </span>
                  <div>
                    <p>{order.product_name}</p>
                    <span>
                      #{order.order_number || order.order_id} · {order.quantity} item
                      {Number(order.quantity) === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div>
                    <strong>₦{Number(order.price * order.quantity).toLocaleString()}</strong>
                    <span className={`order-status order-status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel dashboard-community-card">
          <div className="panel-heading">
            <div>
              <p>Community</p>
              <span>Keep followers close to your store</span>
            </div>
            <Megaphone size={18} />
          </div>
          <div className="community-number">
            <Users size={22} />
            <strong>{Number(metrics.followers_count).toLocaleString()}</strong>
            <span>people follow your store</span>
          </div>
          <p>
            Share restocks, new arrivals, and pickup information. Your posts appear in the live
            campus seller feed.
          </p>
          <Link to="/vendor/updates" className="dashboard-action-link">
            Publish an update
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default VendorDashboard;
