import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

const CheckoutVerify = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | failed
  const [message, setMessage] = useState('Confirming your payment…');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference was provided.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(
          `/checkout/verify.php?reference=${encodeURIComponent(reference)}`
        );
        if (cancelled) return;
        if (res.data?.success) {
          setStatus('success');
          setMessage(res.data.message || 'Payment confirmed.');
          setOrderNumber(res.data.data?.order_number || '');
          try {
            clearCart?.();
          } catch {
            /* ignore */
          }
        } else {
          setStatus('failed');
          setMessage(res.data?.message || 'Payment could not be confirmed.');
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('failed');
        setMessage(
          err.response?.data?.message || 'Could not verify payment. Please check your orders.'
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, reference, navigate, clearCart]);

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">Verifying payment</h1>
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto">
              ✓
            </div>
            <h1 className="text-xl font-bold text-gray-900">Payment successful</h1>
            <p className="text-sm text-gray-500">{message}</p>
            {orderNumber && (
              <p className="text-sm font-semibold text-gray-800">Order #{orderNumber}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Link
                to="/customer/orders"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                View orders
              </Link>
              <Link
                to="/products"
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold mx-auto">
              !
            </div>
            <h1 className="text-xl font-bold text-gray-900">Payment not confirmed</h1>
            <p className="text-sm text-gray-500">{message}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Link
                to="/customer/orders"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Check orders
              </Link>
              <Link
                to="/cart"
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutVerify;
