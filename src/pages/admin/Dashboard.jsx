import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
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

const money = (n) => `₦${Number(n || 0).toLocaleString()}`;

const vendorLabel = (row) =>
  row.shop_name ||
  [row.first_name, row.last_name].filter(Boolean).join(' ') ||
  `Vendor #${row.vendor_id}`;

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
    pending_payouts_count: 0,
    paid_payouts_total: 0,
    paid_payouts_count: 0,
    requested_today_total: 0,
    requested_today_count: 0,
    paid_today_total: 0,
    paid_today_count: 0,
    paid_today: [],
    requested_today: [],
    pending_queue: [],
    total_follows: 0,
    total_updates: 0,
    updates_last_24h: 0,
    active_locations: 0,
    recent_orders: [],
  });
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      setErrorMessage('');
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
      setErrorMessage(error.response?.data?.message || 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const approveVendor = async (vendorId) => {
    setApprovingId(vendorId);
    setErrorMessage('');
    try {
      const response = await api.put('/admin/vendors.php', {
        vendor_id: vendorId,
        status: 'approved',
      });
      if (response.data.success) await fetchAdminData();
    } catch (error) {
      console.error('Vendor approval failed:', error);
      setErrorMessage(error.response?.data?.message || 'Could not approve this vendor.');
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading platform overview…</div>;

  const statCards = [
    {
      label: 'Marketplace revenue',
      value: money(metrics.gross_revenue),
      detail: `${Number(metrics.total_orders).toLocaleString()} paid orders`,
      icon: Banknote,
    },
    {
      label: 'Approved vendors',
      value: Number(metrics.approved_vendors).toLocaleString(),
      detail: `${Number(metrics.pending_vendors).toLocaleString()} awaiting review`,
      icon: Store,
    },
    {
      label: 'Customers',
      value: Number(metrics.total_customers).toLocaleString(),
      detail: `${Number(metrics.total_follows).toLocaleString()} vendor follows`,
      icon: Users,
    },
    {
      label: 'Live products',
      value: Number(metrics.total_products).toLocaleString(),
      detail: `${Number(metrics.active_locations).toLocaleString()} ABUAD fulfilment points`,
      icon: PackageCheck,
    },
  ];

  return (
    <div className="premium-dashboard-page admin-monitor-page space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Super admin</p>
          <h1>Platform monitor</h1>
          <p className="dashboard-lead">
            Revenue, vendor payouts, and who was paid — live overview for today.
          </p>
        </div>
        <Link
          to="/admin/payouts"
          className="chat-start-btn chat-tab-start inline-flex items-center gap-1"
        >
          Open payouts <ArrowUpRight size={14} />
        </Link>
      </div>

      {errorMessage && <div className="dashboard-alert dashboard-alert-error">{errorMessage}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="dashboard-stat-card dashboard-panel">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold opacity-55">{card.label}</span>
                <Icon size={16} className="opacity-40" />
              </div>
              <strong className="block text-xl mt-1">{card.value}</strong>
              <p className="text-xs opacity-50 mt-1">{card.detail}</p>
            </article>
          );
        })}
      </div>

      {/* Payout monitor */}
      <section className="dashboard-panel space-y-4 payout-monitor">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="dashboard-kicker">Payouts today</p>
            <h2 className="text-lg font-semibold">Who got paid & who requested</h2>
          </div>
          <Link
            to="/admin/payouts"
            className="text-sm font-semibold text-amber-600 hover:underline"
          >
            Manage all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="monitor-metric">
            <span>Requested today</span>
            <strong>{money(metrics.requested_today_total)}</strong>
            <em>{Number(metrics.requested_today_count || 0)} requests</em>
          </div>
          <div className="monitor-metric monitor-metric-ok">
            <span>Paid today</span>
            <strong>{money(metrics.paid_today_total)}</strong>
            <em>{Number(metrics.paid_today_count || 0)} vendors paid</em>
          </div>
          <div className="monitor-metric monitor-metric-warn">
            <span>Still pending</span>
            <strong>{money(metrics.pending_payouts_total)}</strong>
            <em>{Number(metrics.pending_payouts_count || 0)} in queue</em>
          </div>
          <div className="monitor-metric">
            <span>All-time paid</span>
            <strong>{money(metrics.paid_payouts_total)}</strong>
            <em>{Number(metrics.paid_payouts_count || 0)} completed</em>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="monitor-list">
            <h3 className="monitor-list-title">
              <CheckCircle2 size={14} /> Paid today
            </h3>
            {(metrics.paid_today || []).length === 0 ? (
              <p className="dashboard-empty text-sm">No vendors paid yet today.</p>
            ) : (
              <ul>
                {(metrics.paid_today || []).map((row) => (
                  <li key={row.payout_id}>
                    <div>
                      <strong>{vendorLabel(row)}</strong>
                      <span>
                        {[row.first_name, row.last_name].filter(Boolean).join(' ')}
                        {row.email ? ` · ${row.email}` : ''}
                      </span>
                    </div>
                    <div className="monitor-amount">
                      <strong>{money(row.amount)}</strong>
                      <span>net {money(row.net_amount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="monitor-list">
            <h3 className="monitor-list-title">
              <Clock3 size={14} /> Requested today
            </h3>
            {(metrics.requested_today || []).length === 0 ? (
              <p className="dashboard-empty text-sm">No payout requests created today.</p>
            ) : (
              <ul>
                {(metrics.requested_today || []).map((row) => (
                  <li key={row.payout_id}>
                    <div>
                      <strong>{vendorLabel(row)}</strong>
                      <span className="capitalize">
                        {row.status}
                        {row.created_at
                          ? ` · ${new Date(row.created_at).toLocaleTimeString()}`
                          : ''}
                      </span>
                    </div>
                    <div className="monitor-amount">
                      <strong>{money(row.amount)}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="monitor-list">
            <h3 className="monitor-list-title">
              <Banknote size={14} /> Pending queue
            </h3>
            {(metrics.pending_queue || []).length === 0 ? (
              <p className="dashboard-empty text-sm">Queue is clear.</p>
            ) : (
              <ul>
                {(metrics.pending_queue || []).map((row) => (
                  <li key={row.payout_id}>
                    <div>
                      <strong>{vendorLabel(row)}</strong>
                      <span>{[row.first_name, row.last_name].filter(Boolean).join(' ')}</span>
                    </div>
                    <div className="monitor-amount">
                      <strong>{money(row.amount)}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="dashboard-panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Finance snapshot</h2>
            <ShieldCheck size={16} className="opacity-40" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="opacity-55">Gross revenue</span>
              <strong>{money(metrics.gross_revenue)}</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="opacity-55">Platform commission</span>
              <strong>{money(metrics.net_platform_commission)}</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="opacity-55">Pending payouts</span>
              <strong>{money(metrics.pending_payouts_total)}</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="opacity-55">Vendor updates (24h)</span>
              <strong>{Number(metrics.updates_last_24h).toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending vendor approvals</h2>
            <UserCheck size={16} className="opacity-40" />
          </div>
          {pendingVendors.length === 0 ? (
            <p className="dashboard-empty text-sm">No vendors waiting for approval.</p>
          ) : (
            <ul className="space-y-2">
              {pendingVendors.slice(0, 6).map((v) => (
                <li
                  key={v.vendor_id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2"
                >
                  <div>
                    <strong>{v.shop_name || `Vendor #${v.vendor_id}`}</strong>
                    <p className="text-xs opacity-50">
                      {[v.first_name, v.last_name].filter(Boolean).join(' ')} · {v.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="chat-start-btn chat-tab-start"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                    disabled={approvingId === v.vendor_id}
                    onClick={() => approveVendor(v.vendor_id)}
                  >
                    {approvingId === v.vendor_id ? '…' : 'Approve'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/vendors"
            className="text-sm font-semibold text-amber-600 hover:underline"
          >
            All vendors →
          </Link>
        </section>
      </div>

      <section className="dashboard-panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <PackageCheck size={16} className="opacity-40" />
        </div>
        {(metrics.recent_orders || []).length === 0 ? (
          <p className="dashboard-empty text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left opacity-50">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent_orders.map((order) => (
                  <tr
                    key={order.order_number}
                    className="border-t border-black/5 dark:border-white/10"
                  >
                    <td className="py-2 pr-3 font-medium">{order.order_number}</td>
                    <td className="py-2 pr-3">
                      {[order.first_name, order.last_name].filter(Boolean).join(' ')}
                    </td>
                    <td className="py-2 pr-3 capitalize">{order.status}</td>
                    <td className="py-2 pr-3">{money(order.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-panel flex flex-wrap items-center gap-3 text-sm">
        <MapPin size={16} className="opacity-40" />
        <span className="opacity-55">Active campus locations</span>
        <strong>{Number(metrics.active_locations).toLocaleString()}</strong>
      </section>
    </div>
  );
};

export default AdminDashboard;
