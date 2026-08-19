import { Check, Heart, MapPin, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { resolveImageUrl } from '../utils/imageUrl';
import { getErrorMessage } from '../utils/errors';
import { getSavedHall } from '../config/campus';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const price = Number(product.base_price || product.price || 0);
  const compareAt = Number(product.compare_at_price || product.old_price || 0);
  const productId = product.id || product.product_id;
  const saved = isWishlisted(productId);
  const slug = product.slug;
  const hall = getSavedHall();
  const locationLabel =
    product.dropoff_location || product.location || `${hall.short} · nearby`;

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
        <div className="verified-badge">
          <Check size={10} strokeWidth={3} aria-hidden="true" />
          Verified ABUAD Student
        </div>
        <button
          type="button"
          className={`product-wishlist ${saved ? 'product-wishlist-active' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Save'} ${product.name}`}
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
        <Link to={slug ? `/product/${slug}` : '/products'}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-price-row">
          <span className="product-price">₦{price.toLocaleString()}</span>
          {compareAt > price && (
            <span className="product-price-old">₦{compareAt.toLocaleString()}</span>
          )}
        </div>
        <div className="product-location">
          <MapPin size={11} aria-hidden="true" />
          <span>{locationLabel}</span>
        </div>
        {actionError ? (
          <p className="text-xs text-rose-600 mt-1" role="alert">
            {actionError}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        className="product-quick-add"
        onClick={handleAdd}
        aria-label={`Add ${product.name} to bag`}
      >
        <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </article>
  );
};

export default ProductCard;
