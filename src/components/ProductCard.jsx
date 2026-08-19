import { Heart, Plus, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { resolveImageUrl } from '../utils/imageUrl';
import { getErrorMessage } from '../utils/errors';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const price = Number(product.base_price || product.price || 0);
  const productId = product.id || product.product_id;
  const saved = isWishlisted(productId);
  const slug = product.slug;

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActionError('');
    if (user?.role !== 'customer') {
      navigate('/login', { state: { notice: 'Sign in as a customer to save products.' } });
      return;
    }
    setSaving(true);
    try {
      await toggleWishlist(productId);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Could not update wishlist.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActionError('');
    try {
      addToCart(product, 1);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Could not add to bag.'));
    }
  };

  return (
    <article className="product-card">
      <div className="product-card-media">
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
          <Heart size={15} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <Link to={slug ? `/product/${slug}` : '/products'} aria-label={`View ${product.name}`}>
          <img
            src={resolveImageUrl(product.primary_image || product.image_url)}
            alt={product.name || 'Product'}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.opacity = '0.4';
            }}
          />
        </Link>
      </div>

      <div className="product-card-body">
        <div className="product-meta">
          <span>{product.brand || product.shop_name || 'Campus'}</span>
          {product.average_rating ? (
            <span className="product-rating">
              <Star size={11} fill="currentColor" aria-hidden="true" />
              {product.average_rating}
            </span>
          ) : null}
        </div>
        <Link to={slug ? `/product/${slug}` : '/products'}>
          <h3>{product.name}</h3>
        </Link>
        {actionError ? (
          <p className="text-xs text-rose-600 mt-1" role="alert">
            {actionError}
          </p>
        ) : null}
        <div className="product-card-footer">
          <div>
            <span className="price-label">From</span>
            <span className="product-price">₦{price.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="product-add"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
