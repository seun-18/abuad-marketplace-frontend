import React, { useState } from 'react';
import api from '../../api/axios';

const VendorPayouts = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      } else {
        setError(res.data.message || 'Failed to submit payout request.');
      }
    } catch (err) {
      console.error('Payout request error:', err);
      setError(err.response?.data?.message || 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-sm text-gray-500">Request a withdrawal from your available balance.</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Withdrawal Amount (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Withdrawal amount"
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-3 rounded-lg text-xs">
          <strong>Note:</strong> A platform commission will be deducted from your withdrawal amount
          based on your commission rate. The remaining balance will be transferred to your account
          after admin approval.
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'Submitting...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
};

export default VendorPayouts;
