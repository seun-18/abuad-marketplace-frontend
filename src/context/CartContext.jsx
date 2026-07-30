import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const CartContext = createContext();

function cartStorageKey(userId) {
  return userId ? `marketplace_cart_user_${userId}` : 'marketplace_cart_guest';
}

function loadCart(userId) {
  try {
    let raw = localStorage.getItem(cartStorageKey(userId));
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

function mergeCarts(primary, secondary) {
  const map = new Map();
  for (const item of [...secondary, ...primary]) {
    const key = `${item.product_id}:${item.variant_id ?? 'base'}`;
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        ...item,
        quantity: Math.max(Number(existing.quantity) || 0, Number(item.quantity) || 0),
      });
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const prevUserIdRef = useRef(userId);
  const [cart, setCart] = useState(() => loadCart(null));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const prev = prevUserIdRef.current;
    if (prev === userId) return;

    if (userId && !prev) {
      const guestCart = loadCart(null);
      const userCart = loadCart(userId);
      const merged = mergeCarts(userCart, guestCart);
      setCart(merged);
      saveCart(userId, merged);
      if (guestCart.length) {
        localStorage.removeItem(cartStorageKey(null));
      }
    } else {
      setCart(loadCart(userId));
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    saveCart(userId, cart);
  }, [cart, userId]);

  const syncCartToServer = useCallback(async () => {
    if (!userId || cart.length === 0) return { ok: true, count: 0 };

    setSyncing(true);
    try {
      try {
        const existing = await api.get('/cart/index.php');
        const items = existing.data?.data?.items || [];
        await Promise.all(
          items.map((item) =>
            api.delete(`/cart/index.php?cart_item_id=${item.cart_item_id}`).catch(() => null)
          )
        );
      } catch {
        /* continue */
      }

      for (const item of cart) {
        await api.post('/cart/index.php', {
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          override: true,
        });
      }
      return { ok: true, count: cart.length };
    } catch (err) {
      console.error('Cart sync failed:', err);
      throw err;
    } finally {
      setSyncing(false);
    }
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

    if (user?.role === 'customer' && product?.id) {
      api
        .post('/cart/index.php', {
          product_id: product.id,
          variant_id: variant?.id || null,
          quantity,
        })
        .catch(() => {});
    }
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
        syncCartToServer,
        syncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
