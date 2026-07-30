import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { resolveImageUrl } from '../../utils/imageUrl';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/index.php');
      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        setError(res.data.message || 'Failed to load orders.');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'processing':
      case 'shipped':
      case 'delivered':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            {status}
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            {status}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Loading orders…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">Orders that include your products.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">
                    Order Reference
                  </span>
                  <h3 className="text-base font-bold text-gray-800">
                    #{order.reference || order.id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(order.status)}
                  <span className="text-lg font-bold text-gray-900">
                    ₦{Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-50">
                {order.items &&
                  order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <img
                            src={resolveImageUrl(item.image_url)}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.product_name}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × ₦{Number(item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Delivery info */}
              {order.delivery_address && (
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                  <span>
                    <strong>Delivery Address:</strong> {order.delivery_address}
                  </span>
                  {order.phone && (
                    <span className="ml-4">
                      <strong>Phone:</strong> {order.phone}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
