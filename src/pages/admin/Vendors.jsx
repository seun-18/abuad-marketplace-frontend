import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected: 'bg-gray-100 text-gray-700 border-gray-200',
};

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/admin/vendors.php');
      if (res.data.success) {
        setVendors(res.data.data || []);
      } else {
        setError(res.data.message || 'Failed to load vendors.');
      }
    } catch (err) {
      console.error('Fetch vendors error:', err);
      setError(err.response?.data?.message || 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (vendorId, status) => {
    setUpdatingId(vendorId);
    try {
      const res = await api.put('/admin/vendors.php', { vendor_id: vendorId, status });
      if (res.data.success) {
        setVendors((prev) => prev.map((v) => (v.vendor_id === vendorId ? { ...v, status } : v)));
      }
    } catch (err) {
      console.error('Update vendor status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVendors = filter === 'all' ? vendors : vendors.filter((v) => v.status === filter);

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Loading vendors...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Verification &amp; Management</h1>
        <p className="text-sm text-gray-500">
          Approve or suspend vendor accounts across the platform.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'suspended', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${
              filter === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredVendors.length === 0 ? (
          <p className="p-12 text-center text-gray-400 text-sm">No vendors match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Shop</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {filteredVendors.map((v) => (
                  <tr key={v.vendor_id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{v.shop_name}</p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(v.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-gray-800">
                        {v.first_name} {v.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </td>
                    <td className="py-3.5 px-4">{Number(v.commission_rate).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      ₦{Number(v.balance || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${STATUS_STYLES[v.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {v.status !== 'approved' && (
                        <button
                          onClick={() => updateStatus(v.vendor_id, 'approved')}
                          disabled={updatingId === v.vendor_id}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {v.status !== 'suspended' && (
                        <button
                          onClick={() => updateStatus(v.vendor_id, 'suspended')}
                          disabled={updatingId === v.vendor_id}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {v.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(v.vendor_id, 'rejected')}
                          disabled={updatingId === v.vendor_id}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
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

export default AdminVendors;
