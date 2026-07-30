import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedProductIds, setSavedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (user?.role !== 'customer') {
      setSavedProductIds(new Set());
      return [];
    }

    setLoading(true);
    try {
      const response = await api.get('/wishlist/index.php');
      const items = response.data.success ? response.data.data || [] : [];
      setSavedProductIds(new Set(items.map((item) => Number(item.product_id))));
      return items;
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    refreshWishlist().catch((error) => {
      console.error('Wishlist sync failed:', error);
    });
  }, [refreshWishlist]);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (user?.role !== 'customer') {
        throw new Error('CUSTOMER_LOGIN_REQUIRED');
      }

      const numericId = Number(productId);
      const response = await api.post('/wishlist/index.php', { product_id: numericId });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Could not update wishlist.');
      }

      setSavedProductIds((current) => {
        const next = new Set(current);
        if (response.data.data?.wishlisted) next.add(numericId);
        else next.delete(numericId);
        return next;
      });

      return Boolean(response.data.data?.wishlisted);
    },
    [user?.role]
  );

  const value = useMemo(
    () => ({
      savedProductIds,
      isWishlisted: (productId) => savedProductIds.has(Number(productId)),
      toggleWishlist,
      refreshWishlist,
      loading,
    }),
    [savedProductIds, toggleWishlist, refreshWishlist, loading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }
  return context;
};
