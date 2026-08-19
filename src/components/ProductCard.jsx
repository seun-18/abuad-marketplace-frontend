import { Heart, MapPin, Plus, ShieldCheck, Star } from 'lucide-react';
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
  const verified = Boolean(
    product.vendor_verified || product.is_verified || product.verified_seller || product.vendor_is_verified
  );
  const location = product.campus_location_name || product.location_name || product.pickup_location || 'Campus pickup';
  const walkingTime = product.distance_minutes ? `${product.distance_minutes} min away` : '';

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
    <article className="market-product-card">
      <div className="market-product-media">
        <Link to={slug ? `/product/${slug}` : '/products'} aria-label={`View ${product.name}`}>
          <img
            src={resolveImageUrl(product.primary_image || product.image_url)}
            alt={product.name || 'Product'}
            loading="lazy"
            onError={(event) => { event.currentTarget.style.opacity = '0.35'; }}
          />
        </Link>

        {verified && (
          <span className="market-verified-badge">
            <ShieldCheck size={12} aria-hidden="true" />
            Verified seller
          </span>
        )}

        <button
          type="button"
          className={`market-wishlist ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Save'} ${product.name} ${saved ? 'from' : 'to'} wishlist`}
          aria-pressed={saved}
          disabled={saving}
          onClick={handleWishlist}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="market-product-body">
        <div className="market-product-meta">
          <span>{product.brand || product.shop_name || 'ABUAD seller'}</span>
          {product.average_rating ? (
            <span className="market-rating">
              <Star size={11} fill="currentColor" />
              {product.average_rating}
            </span>
          ) : null}
        </div>

        <Link to={slug ? `/product/${slug}` : '/products'} className="market-product-title">
          {product.name}
        </Link>

        {actionError ? <p className="market-product-error" role="alert">{actionError}</p> : null}

        <div className="market-price-row">
          <div>
            <span className="market-price">₦{price.toLocaleString()}</span>
            {product.compare_at_price && Number(product.compare_at_price) > price ? (
              <span className="market-old-price">₦{Number(product.compare_at_price).toLocaleString()}</span>
            ) : null}
          </div>
          <button type="button" onClick={handleAdd} className="market-quick-add" aria-label={`Add ${product.name} to bag`}>
            <Plus size={20} />
          </button>
        </div>

        <div className="market-product-location">
          <MapPin size={13} />
          <span>{location}</span>
          {walkingTime && <span>• {walkingTime}</span>}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
