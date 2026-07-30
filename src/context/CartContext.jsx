import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

function cartStorageKey(userId) {
  return userId ? `marketplace_cart_user_${userId}` : 'marketplace_cart_guest';
}

function loadCart(userId) {
  try {
    let raw = localStorage.getItem(cartStorageKey(userId));
    // One-time migration from the old shared cart key → guest cart
    if (!raw && !userId) {
      const legacy = localStorage.getItem('marketplace_cart');
      if (legacy) {
        localStorage.setItem(cartStorageKey(null), legacy);
        localStorage.removeItem('marketplace_cart');
        raw = legacy;
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(userId, cart) {
  localStorage.setItem(cartStorageKey(userId), JSON.stringify(cart));
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const prevUserIdRef = useRef(userId);

  const [cart, setCart] = useState(() => loadCart(null));

  // When login/logout/switch account: swap cart for that user id
  useEffect(() => {
    const prev = prevUserIdRef.current;
    if (prev !== userId) {
      // Persist previous user's cart was already saved by the cart effect;
      // load the new identity's cart
      setCart(loadCart(userId));
      prevUserIdRef.current = userId;
    }
  }, [userId]);

  // Persist current cart under the active identity
  useEffect(() => {
    saveCart(userId, cart);
  }, [cart, userId]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product_id === product.id && item.variant_id === (variant?.id || null)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
          price: variant?.price_override || product.base_price,
          image: product.primary_image || null,
          vendor_id: product.vendor_id,
          variant_id: variant?.id || null,
          variant_name: variant?.variant_name || null,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product_id === productId && item.variant_id === variantId))
    );
  };

  const updateQuantity = (productId, variantId = null, delta = 1) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product_id === productId && item.variant_id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const getSubtotal = () =>
    cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  const getItemCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
