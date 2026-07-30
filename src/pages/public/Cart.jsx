import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getSubtotal();

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ITEM LISTING */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.product_id}-${item.variant_id || 'base'}`}
              className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4"
            >
              <img
                src={resolveImageUrl(item.image)}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg bg-gray-50 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                {item.variant_name && (
                  <p className="text-xs text-indigo-600 mt-0.5">Option: {item.variant_name}</p>
                )}
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ₦{Number(item.price).toLocaleString()}
                </p>
              </div>

              {/* Quantity Adjuster */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.product_id, item.variant_id, -1)}
                  className="w-7 h-7 rounded border text-gray-600 font-bold hover:bg-gray-100 text-sm"
                >
                  -
                </button>
                <span className="text-sm font-semibold text-gray-800 w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product_id, item.variant_id, 1)}
                  className="w-7 h-7 rounded border text-gray-600 font-bold hover:bg-gray-100 text-sm"
                >
                  +
                </button>
              </div>

              {/* Remove Action */}
              <button
                onClick={() => removeFromCart(item.product_id, item.variant_id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium underline pt-2"
          >
            Clear Entire Cart
          </button>
        </div>

        {/* ORDER SUMMARY & DELIVERY DETAILS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Order Summary</h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₦{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400">
              Delivery fees and coupon discounts are calculated on the next step.
            </p>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md border-t-0"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
