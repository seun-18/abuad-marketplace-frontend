import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const VendorWallet = () => {
  const [wallet, setWallet] = useState({
    balance: 0,
    pending: 0,
    bank_name: '',
    account_number: '',
    account_name: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal Form State
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const res = await api.get('/payouts/index.php');
      if (res.data.success) {
        setWallet(res.data.data.wallet || {});
        setTransactions(res.data.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', msg: '' });

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setFeedback({ type: 'error', msg: 'Please enter a valid withdrawal amount.' });
      return;
    }

    if (withdrawAmount > wallet.balance) {
      setFeedback({ type: 'error', msg: 'Requested amount exceeds available balance.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/payouts/request.php', { amount: withdrawAmount });
      if (res.data.success) {
        setFeedback({ type: 'success', msg: 'Payout request submitted successfully!' });
        setAmount('');
        fetchWalletDetails();
      } else {
        setFeedback({ type: 'error', msg: res.data.message || 'Payout request failed.' });
      }
    } catch (err) {
      console.error('Payout request error:', err);
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Server error. Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">Loading wallet details...</div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet & Earnings</h1>
        <p className="text-sm text-gray-500">
          Track payouts, request withdrawals, and view earnings ledger.
        </p>
      </div>

      {/* BALANCE & WITHDRAWAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-indigo-200">
              Withdrawable Balance
            </span>
            <h2 className="text-3xl font-extrabold mt-1">
              ₦{Number(wallet.balance || 0).toLocaleString()}
            </h2>
          </div>
          <p className="text-xs text-indigo-100">Ready for instant bank transfer</p>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-gray-400">Pending Earnings</span>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-1">
              ₦{Number(wallet.pending || 0).toLocaleString()}
            </h2>
          </div>
          <p className="text-xs text-gray-400">Funds cleared upon delivery confirmation</p>
        </div>

        {/* Bank Account Overview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2 flex flex-col justify-between text-sm">
          <div>
            <span className="text-xs uppercase font-semibold text-gray-400">
              Settlement Account
            </span>
            <p className="font-bold text-gray-800 mt-1">{wallet.bank_name || 'No Bank Linked'}</p>
            <p className="text-xs text-gray-500">{wallet.account_number || '—'}</p>
            <p className="text-xs text-gray-500 uppercase">{wallet.account_name || ''}</p>
          </div>
          <button className="text-xs font-semibold text-indigo-600 hover:underline self-start">
            Edit Bank Info &rarr;
          </button>
        </div>
      </div>

      {/* WITHDRAWAL FORM */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800">Request Payout</h3>

        {feedback.msg && (
          <div
            className={`p-3 rounded-lg text-sm ${
              feedback.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 font-medium">₦</span>
            <input
              type="number"
              step="100"
              required
              aria-label="Withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || wallet.balance <= 0}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 shadow-sm"
          >
            {submitting ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </form>
      </div>

      {/* PAYOUT HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Payout & Settlement Ledger</h3>
        </div>

        {transactions.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No transaction history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">
                      #{tx.reference || tx.id}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium">{tx.type || 'payout'}</td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        tx.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          tx.status === 'completed' || tx.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorWallet;
