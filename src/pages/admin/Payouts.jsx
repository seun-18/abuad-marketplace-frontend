import { useCallback, useEffect, useState } from 'react';
import { Banknote, Check, RefreshCw, X } from 'lucide-react';
import api from '../../api/axios';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [summary, setSummary] = useState({
    pending_total: 0,
    paid_total: 0,
    failed_total: 0,
    pending_count: 0,
    paid_count: 0,
    total_count: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/payouts.php?status=${encodeURIComponent(filter)}`);
      const data = res.data?.data || {};
      const list = data.payouts || (Array.isArray(res.data?.data) ? res.data.data : []);
      setPayouts(Array.isArray(list) ? list : []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load payout requests.');
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (payoutId, action) => {
    setBusyId(payoutId);
    setError('');
    try {
      await api.put('/admin/payouts.php', { payout_id: payoutId, action });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${action} payout.`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="premium-dashboard-page space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Finance</p>
          <h1>Vendor payouts</h1>
          <p className="text-sm opacity-60">Approve or reject withdrawal requests from vendors.</p>
        </div>
        <button type="button" className="dashboard-header-button" onClick={load} aria-label="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="dashboard-panel">
          <span className="text-xs opacity-50">Pending</span>
          <p className="font-semibold">₦{Number(summary.pending_total || 0).toLocaleString()} <span className="text-xs opacity-50">({summary.pending_count || 0})</span></p>
        </div>
        <div className="dashboard-panel">
          <span className="text-xs opacity-50">Paid</span>
          <p className="font-semibold">₦{Number(summary.paid_total || 0).toLocaleString()} <span className="text-xs opacity-50">({summary.paid_count || 0})</span></p>
        </div>
        <div className="dashboard-panel">
          <span className="text-xs opacity-50">Failed / rejected</span>
          <p className="font-semibold">₦{Number(summary.failed_total || 0).toLocaleString()}</p>
        </div>
        <div className="dashboard-panel">
          <span className="text-xs opacity-50">All requests</span>
          <p className="font-semibold">{summary.total_count || 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['pending', 'paid', 'failed', 'all'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`chat-tab-btn ${filter === s ? 'active' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="dashboard-alert">{error}</div>}

      {loading ? (
        <p className="dashboard-empty">Loading payout requests…</p>
      ) : payouts.length === 0 ? (
        <div className="dashboard-panel dashboard-empty">
          <Banknote size={28} />
          <p>No {filter === 'all' ? '' : filter} payout requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => {
            const name =
              p.shop_name ||
              [p.first_name, p.last_name].filter(Boolean).join(' ') ||
              `Vendor #${p.vendor_id}`;
            return (
              <article key={p.payout_id} className="dashboard-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-xs opacity-50">
                    {[p.first_name, p.last_name].filter(Boolean).join(' ')} · {p.email}
                    {p.vendor_phone ? ` · ${p.vendor_phone}` : ''}
                  </p>
                  <p className="mt-1 text-sm">
                    <strong>₦{Number(p.amount || 0).toLocaleString()}</strong>
                    <span className="opacity-50">
                      {' '}
                      · commission ₦{Number(p.commission_deducted || 0).toLocaleString()}
                      {' '}
                      · wallet ₦{Number(p.wallet_balance || 0).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs opacity-40">
                    Requested {p.created_at ? new Date(p.created_at).toLocaleString() : '—'} · status{' '}
                    <span className="uppercase">{p.status}</span>
                  </p>
                </div>
                {p.status === 'pending' && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busyId === p.payout_id}
                      onClick={() => act(p.payout_id, 'approve')}
                      className="chat-start-btn chat-tab-start inline-flex items-center gap-1"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.payout_id}
                      onClick={() => act(p.payout_id, 'reject')}
                      className="auth-secondary-btn inline-flex items-center gap-1 !w-auto !mt-0 px-3"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
