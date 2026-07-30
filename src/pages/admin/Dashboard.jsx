import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    total_vendors: 0,
    approved_vendors: 0,
    pending_vendors: 0,
    suspended_vendors: 0,
    total_customers: 0,
    total_products: 0,
    total_orders: 0,
    gross_revenue: 0,
    net_platform_commission: 0,
    pending_payouts_total: 0,
    total_follows: 0,
    total_updates: 0,
    updates_last_24h: 0,
    active_locations: 0,
    recent_orders: [],
  });
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [metricsResponse, vendorsResponse] = await Promise.all([
        api.get('/admin/dashboard.php'),
        api.get('/admin/vendors.php'),
      ]);
      if (metricsResponse.data.success) setMetrics(metricsResponse.data.data);
      if (vendorsResponse.data.success) {
        setPendingVendors(
          (vendorsResponse.data.data || []).filter((vendor) => vendor.status === 'pending')
        );
      }
    } catch (error) {
      console.error('Failed to load admin overview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const approveVendor = async (vendorId) => {
    setApprovingId(vendorId);
    try {
      const response = await api.put('/admin/vendors.php', {
        vendor_id: vendorId,
        status: 'approved',
      });
      if (response.data.success) await fetchAdminData();
    } catch (error) {
      console.error('Vendor approval failed:', error);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading platform intelligence…</div>;

  const statCards = [
    {
      label: 'Marketplace revenue',
      value: `₦${Number(metrics.gross_revenue).toLocaleString()}`,
      detail: `${Number(metrics.total_orders).toLocaleString()} paid orders`,
      Icon: Banknote,
      tone: 'gold',
    },
    {
      label: 'Approved vendors',
      value: Number(metrics.approved_vendors).toLocaleString(),
      detail: `${Number(metrics.pending_vendors).toLocaleString()} awaiting review`,
      Icon: UserCheck,
      tone: 'green',
    },
    {
      label: 'Customers',
      value: Number(metrics.total_customers).toLocaleString(),
      detail: `${Number(metrics.total_follows).toLocaleString()} vendor follows`,
      Icon: Users,
      tone: 'violet',
    },
    {
      label: 'Active products',
      value: Number(metrics.total_products).toLocaleString(),
      detail: `${Number(metrics.active_locations).toLocaleString()} ABUAD fulfilment points`,
      Icon: Store,
      tone: 'blue',
    },
  ];

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Platform control centre</p>
          <h1>ABUAD Market Place intelligence.</h1>
          <p>Vendor trust, orders, revenue, community activity, and fulfilment health.</p>
        </div>
        <div className="dashboard-verification">
          <ShieldCheck size={17} />
          <span>
            <strong>Super admin</strong>
            Protected management session
          </span>
        </div>
      </div>

      <div className="dashboard-stat-grid">
        {statCards.map(({ label, value, detail, Icon, tone }) => (
          <article key={label} className={`dashboard-stat-card dashboard-stat-${tone}`}>
            <div>
              <p>{label}</p>
              <Icon size={18} />
            </div>
            <strong>{value}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-admin-grid">
        <section className="dashboard-panel admin-revenue-panel">
          <div className="panel-heading">
            <div>
              <p>Financial overview</p>
              <span>Verified successful payments only</span>
            </div>
            <Banknote size={18} />
          </div>
          <div className="admin-revenue-hero">
            <span>Gross marketplace revenue</span>
            <strong>₦{Number(metrics.gross_revenue).toLocaleString()}</strong>
          </div>
          <div className="admin-finance-grid">
            <p>
              <span>Platform commission</span>
              <strong>₦{Number(metrics.net_platform_commission).toLocaleString()}</strong>
            </p>
            <p>
              <span>Pending payouts</span>
              <strong>₦{Number(metrics.pending_payouts_total).toLocaleString()}</strong>
            </p>
            <p>
              <span>Published updates</span>
              <strong>{Number(metrics.total_updates).toLocaleString()}</strong>
            </p>
            <p>
              <span>Updates today</span>
              <strong>{Number(metrics.updates_last_24h).toLocaleString()}</strong>
            </p>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Vendor approvals</p>
              <span>Review before stores can publish</span>
            </div>
            <BadgeCheck size={18} />
          </div>
          {pendingVendors.length === 0 ? (
            <p className="dashboard-empty">No vendor applications are waiting.</p>
          ) : (
            <div className="approval-list">
              {pendingVendors.slice(0, 5).map((vendor) => (
                <div key={vendor.vendor_id}>
                  <span className="approval-avatar">{vendor.shop_name?.charAt(0) || 'V'}</span>
                  <div>
                    <p>{vendor.shop_name}</p>
                    <span>
                      {vendor.first_name} {vendor.last_name} · {vendor.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => approveVendor(vendor.vendor_id)}
                    disabled={approvingId === vendor.vendor_id}
                  >
                    {approvingId === vendor.vendor_id ? 'Approving…' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/vendors" className="dashboard-action-link">
            Manage all vendors
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      <div className="dashboard-two-column dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Recent marketplace orders</p>
              <span>Latest activity across ABUAD</span>
            </div>
            <PackageCheck size={18} />
          </div>
          {(metrics.recent_orders || []).length === 0 ? (
            <p className="dashboard-empty">Orders will appear here.</p>
          ) : (
            <div className="dashboard-order-list">
              {metrics.recent_orders.map((order) => (
                <div key={order.order_number}>
                  <span className="order-icon">
                    <PackageCheck size={15} />
                  </span>
                  <div>
                    <p>
                      {order.first_name} {order.last_name}
                    </p>
                    <span>
                      #{order.order_number} · {order.delivery_method.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <strong>₦{Number(order.total_amount).toLocaleString()}</strong>
                    <span className={`order-status order-status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel admin-campus-panel">
          <div className="panel-heading">
            <div>
              <p>ABUAD fulfilment</p>
              <span>Campus pickup and delivery coverage</span>
            </div>
            <MapPin size={18} />
          </div>
          <div>
            <MapPin size={26} />
            <strong>{Number(metrics.active_locations).toLocaleString()}</strong>
            <span>active campus points</span>
          </div>
          <p>
            Pickup hubs, colleges, hostel reception, and campus landmarks are centrally configured
            for consistent delivery fees.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
