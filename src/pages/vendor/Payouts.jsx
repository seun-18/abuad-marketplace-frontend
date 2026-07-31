import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const statusClass = {
  pending: 'chat-pill chat-pill-wait',
  paid: 'chat-pill chat-pill-live',
  failed: 'chat-pill',
};

const VendorPayouts = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState({ balance: 0, pending_balance: 0 });
  const [summary, setSummary] = useState({
    pending_total: 0,
    paid_total: 0,
    failed_total: 0,
    request_count: 0,
  });
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/vendors/payout.php?status=${encodeURIComponent(filter)}`);
      const data = res.data?.data || {};
      setWallet(data.wallet || { balance: 0, pending_balance: 0 });
      setSummary(data.summary || {});
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load payout history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const payoutAmount = parseFloat(amount);
    if (!payoutAmount || payoutAmount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/vendors/payout.php', { amount: payoutAmount });
      if (res.data.success) {
        setMessage(res.data.message || 'Payout request submitted successfully!');
        setAmount('');
        await loadHistory();
      } else {
        setError(res.data.message || 'Failed to submit payout request.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-dashboard-page max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Wallet</p>
          <h1>Payouts</h1>
          <p className="text-sm opacity-60">Request withdrawals and track every payout request.</p>
        </div>
        <button type="button" className="dashboard-header-button" onClick={loadHistory} aria-label="Refresh history">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="dashboard-stat-card dashboard-panel">
          <span className="text-xs opacity-50">Available</span>
          <strong>₦{Number(wallet.balance || 0).toLocaleString()}</strong>
        </div>
        <div className="dashboard-stat-card dashboard-panel">
          <span className="text-xs opacity-50">Pending requests</span>
          <strong>₦{Number(summary.pending_total || 0).toLocaleString()}</strong>
        </div>
        <div className="dashboard-stat-card dashboard-panel">
          <span className="text-xs opacity-50">Paid out</span>
          <strong>₦{Number(summary.paid_total || 0).toLocaleString()}</strong>
        </div>
        <div className="dashboard-stat-card dashboard-panel">
          <span className="text-xs opacity-50">All requests</span>
          <strong>{Number(summary.request_count || 0)}</strong>
        </div>
      </div>

      {message && <div className="auth-alert auth-alert-success">{message}</div>}
      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="dashboard-panel space-y-4">
        <div className="panel-heading">
          <div>
            <p>New withdrawal</p>
            <span>Commission is deducted from the amount you request</span>
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-semibold opacity-60">Amount (₦)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            className="mt-1 w-full"
            aria-label="Withdrawal amount"
          />
        </label>
        <p className="text-xs opacity-50">
          Platform commission applies per your rate. Admin must approve before funds are marked paid.
        </p>
        <button type="submit" disabled={loading} className="chat-start-btn">
          {loading ? 'Submitting…' : 'Request payout'}
        </button>
      </form>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Payout history</h2>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'failed'].map((s) => (
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
        </div>

        {historyLoading ? (
          <p className="dashboard-empty">Loading history…</p>
        ) : history.length === 0 ? (
          <p className="dashboard-empty">No payout requests yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((row) => (
              <article key={row.payout_id} className="dashboard-panel flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    ₦{Number(row.amount || 0).toLocaleString()}
                    <span className="ml-2 text-xs font-normal opacity-50">
                      net ₦{Number(row.net_amount ?? row.amount - row.commission_deducted).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs opacity-50">
                    Commission ₦{Number(row.commission_deducted || 0).toLocaleString()}
                    {' · '}
                    Requested {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                    {row.processed_at
                      ? ` · Processed ${new Date(row.processed_at).toLocaleString()}`
                      : ''}
                  </p>
                  {row.processed_by_first_name && (
                    <p className="text-xs opacity-40">
                      By {row.processed_by_first_name} {row.processed_by_last_name || ''}
                    </p>
                  )}
                </div>
                <span className={statusClass[row.status] || 'chat-pill'}>{row.status}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorPayouts;
