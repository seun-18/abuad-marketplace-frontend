import { Heart, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { resolveImageUrl } from '../utils/imageUrl';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const price = Number(product.base_price || product.price || 0);
  const saved = isWishlisted(product.id || product.product_id);

  const handleWishlist = async () => {
    if (user?.role !== 'customer') {
      navigate('/login', { state: { notice: 'Sign in as a customer to save products.' } });
      return;
    }
    setSaving(true);
    try {
      await toggleWishlist(product.id || product.product_id);
    } catch (error) {
      console.error('Wishlist update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="luxury-product-card">
      <div className="luxury-product-media">
        <span className="product-badge">New</span>
        <button
          type="button"
          className={`product-wishlist ${saved ? 'product-wishlist-active' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Save'} ${product.name} ${
            saved ? 'from' : 'to'
          } wishlist`}
          aria-pressed={saved}
          disabled={saving}
          onClick={handleWishlist}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <span className="product-aura" />
          <img
            src={resolveImageUrl(product.primary_image || product.image_url)}
            alt={product.name}
            loading="lazy"
          />
        </Link>
        <span className="product-reflection" />
      </div>

      <div className="luxury-product-body">
        <div className="product-meta">
          <span>{product.brand || product.shop_name || 'Campus select'}</span>
          <span className="product-rating">
            <Star size={11} fill="currentColor" aria-hidden="true" />
            {product.average_rating || '4.9'}
          </span>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card-footer">
          <div>
            <span className="price-label">From</span>
            <span className="product-price">₦{price.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="product-add"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus size={18} aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
