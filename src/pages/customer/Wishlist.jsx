import { ArrowRight, Heart, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const Wishlist = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, refreshWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchWishlist = async () => {
    setError('');
    try {
      const response = await api.get('/wishlist/index.php');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load your wishlist.');
      }
      setItems(response.data.data || []);
    } catch (requestError) {
      console.error('Fetch wishlist error:', requestError);
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Could not load your saved products.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await toggleWishlist(productId);
      setItems((current) =>
        current.filter((item) => Number(item.product_id) !== Number(productId))
      );
      await refreshWishlist();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not remove this product.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-heading">
        <div>
          <p className="eyebrow">Your private collection</p>
          <h1 className="page-heading">Saved for later.</h1>
          <p>Keep the ABUAD campus finds you love in one place.</p>
        </div>
        <Link to="/products" className="wishlist-browse-link">
          Continue shopping
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && <div className="wishlist-error">{error}</div>}

      {loading ? (
        <div className="wishlist-grid" aria-label="Loading wishlist">
          {[0, 1, 2].map((item) => (
            <div key={item} className="wishlist-loading" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <Heart size={28} />
            <Sparkles size={14} />
          </div>
          <h2>Your wishlist is ready for something special.</h2>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/products">
            Explore popular products
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <article key={item.wishlist_id} className="wishlist-card">
              <Link to={`/product/${item.slug}`} className="wishlist-card-media">
                <img src={resolveImageUrl(item.primary_image)} alt={item.name} />
                <span>{item.base_stock > 0 ? 'Available now' : 'Out of stock'}</span>
              </Link>
              <div className="wishlist-card-body">
                <p>{item.brand || item.shop_name}</p>
                <Link to={`/product/${item.slug}`}>
                  <h2>{item.name}</h2>
                </Link>
                <strong>₦{Number(item.base_price).toLocaleString()}</strong>
                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    disabled={Number(item.base_stock) < 1}
                    onClick={() =>
                      addToCart(
                        {
                          ...item,
                          id: item.product_id,
                          primary_image: item.primary_image,
                        },
                        1
                      )
                    }
                  >
                    <ShoppingBag size={15} />
                    Add to bag
                  </button>
                  <button
                    type="button"
                    className="wishlist-remove"
                    onClick={() => handleRemove(item.product_id)}
                    disabled={busyId === item.product_id}
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
