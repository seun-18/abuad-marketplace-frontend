import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Heart, UserPlus, Users } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { resolveImageUrl } from '../../utils/imageUrl';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [vendorAudience, setVendorAudience] = useState({
    followers_count: 0,
    is_following: false,
  });

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/detail.php?slug=${slug}`);
      if (response.data.success) {
        const {
          product: productData,
          images,
          variants: variantsData,
          reviews: reviewsData,
        } = response.data.data;

        setProduct(productData);
        setImages(images || []);
        setVariants(variantsData || []);
        setReviews(reviewsData || []);

        if (productData?.vendor_id) {
          try {
            const followResponse = await api.get(
              `/vendors/follow.php?vendor_id=${productData.vendor_id}`
            );
            if (followResponse.data.success) {
              setVendorAudience(followResponse.data.data);
            }
          } catch (followError) {
            console.error('Failed to load vendor followers:', followError);
          }
        }

        // Set primary image from the gallery
        const primaryImg = images?.find((img) => img.is_primary) || images?.[0];
        setSelectedImage(primaryImg?.image_url || null);

        // Auto-select first available variant if variants exist
        setSelectedVariant(variantsData && variantsData.length > 0 ? variantsData[0] : null);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleWishlist = async () => {
    if (user?.role !== 'customer') {
      navigate('/login', { state: { notice: 'Sign in as a customer to save products.' } });
      return;
    }
    setWishlistBusy(true);
    try {
      await toggleWishlist(product.id);
    } catch (requestError) {
      console.error('Wishlist update failed:', requestError);
    } finally {
      setWishlistBusy(false);
    }
  };

  const handleFollowVendor = async () => {
    if (user?.role !== 'customer') {
      navigate('/login', { state: { notice: 'Sign in as a customer to follow vendors.' } });
      return;
    }
    setFollowBusy(true);
    try {
      const response = await api.post('/vendors/follow.php', { vendor_id: product.vendor_id });
      if (response.data.success) {
        setVendorAudience((current) => ({ ...current, ...response.data.data }));
      }
    } catch (requestError) {
      console.error('Vendor follow failed:', requestError);
    } finally {
      setFollowBusy(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewFeedback({ type: '', msg: '' });
    setSubmittingReview(true);

    try {
      const res = await api.post('/reviews/index.php', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data.success) {
        setReviewFeedback({
          type: 'success',
          msg: res.data.message || 'Review submitted successfully!',
        });
        setReviewComment('');
        setReviewRating(5);
        fetchProductDetails();
      } else {
        setReviewFeedback({ type: 'error', msg: res.data.message || 'Failed to submit review.' });
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewFeedback({
        type: 'error',
        msg:
          err.response?.data?.message ||
          'You may need to purchase this product before reviewing it.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">Loading product details...</div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700">Product Not Found</h2>
        <Link to="/products" className="text-indigo-600 hover:underline mt-4 inline-block">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  // Calculate current dynamic price and stock based on variant selection
  const currentPrice = selectedVariant?.price_override || product.base_price;
  const currentStock = selectedVariant?.stock ?? product.base_stock;

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* SUCCESS BANNER */}
      {addedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>
            Added <strong>{product.name}</strong> to your shopping cart!
          </span>
          <Link to="/cart" className="text-emerald-900 font-bold underline hover:text-emerald-700">
            View Cart
          </Link>
        </div>
      )}

      {/* MAIN PRODUCT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {/* IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="h-96 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
            <img
              src={resolveImageUrl(selectedImage)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === img.image_url ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={resolveImageUrl(img.image_url)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT METADATA & ACTIONS */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Category / Vendor Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {product.category_name || 'Category'}
              </span>
              {product.shop_name && (
                <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-full">
                  Sold by: {product.shop_name}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

            {/* Price Display */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">
                ₦{Number(currentPrice).toLocaleString()}
              </span>
              {currentStock > 0 ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  In Stock ({currentStock})
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* VARIANTS SELECTOR */}
            {variants.length > 0 && (
              <div className="mt-6">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                  Select Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-1.5 rounded-md text-sm border font-medium transition ${
                        selectedVariant?.id === variant.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {variant.variant_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY PICKER */}
            <div className="mt-6">
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  className="w-8 h-8 rounded border text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-semibold text-gray-800">{quantity}</span>
                <button
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded border text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ADD TO CART ACTION */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
            >
              {currentStock > 0 ? 'Add to Shopping Cart' : 'Currently Out of Stock'}
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistBusy}
              className={`product-detail-save ${
                isWishlisted(product.id) ? 'product-detail-save-active' : ''
              }`}
              aria-label={`${isWishlisted(product.id) ? 'Remove from' : 'Add to'} wishlist`}
              aria-pressed={isWishlisted(product.id)}
            >
              <Heart size={20} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="vendor-follow-card">
            <div className="vendor-follow-copy">
              <span className="vendor-follow-badge">
                <BadgeCheck size={14} />
                ABUAD verified vendor
              </span>
              <h3>{product.shop_name || 'Campus vendor'}</h3>
              <p>
                <Users size={14} />
                {Number(vendorAudience.followers_count || 0).toLocaleString()} followers
                {product.pickup_location_name ? ` · Pickup at ${product.pickup_location_name}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFollowVendor}
              disabled={followBusy}
              className={vendorAudience.is_following ? 'is-following' : ''}
            >
              <UserPlus size={15} />
              {vendorAudience.is_following ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* MESSAGE VENDOR */}
          {product.vendor_id && (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate('/login', {
                    state: { notice: 'Log in as a customer to message the vendor.' },
                  });
                  return;
                }
                if (user.role !== 'customer') {
                  alert('Only customers can message vendors from the shop.');
                  return;
                }
                navigate(`/customer/chat?vendor_id=${product.vendor_id}`);
              }}
              className="w-full py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition"
            >
              Message Vendor{product.shop_name ? ` — ${product.shop_name}` : ''}
            </button>
          )}
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Verified Customer Reviews</h3>

        {user ? (
          <form
            onSubmit={handleSubmitReview}
            className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100"
          >
            <p className="text-sm font-semibold text-gray-700">Leave a review</p>

            {reviewFeedback.msg && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  reviewFeedback.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {reviewFeedback.msg}
              </div>
            )}

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl leading-none ${star <= reviewRating ? 'text-amber-500' : 'text-gray-300'}`}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows="3"
              aria-label="Review comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
            <p className="text-xs text-gray-400">
              You can only review products from a paid or delivered order.
            </p>
          </form>
        ) : (
          <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in
            </Link>{' '}
            to leave a review for this product.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews submitted for this product yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 space-y-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">
                    {rev.first_name ? `${rev.first_name} ${rev.last_name}` : 'Verified Buyer'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-amber-500 text-xs my-1">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
                <p className="text-gray-600 text-sm">{rev.comment}</p>
                {rev.vendor_reply && (
                  <div className="mt-2 ml-4 pl-3 border-l-2 border-indigo-200 text-sm">
                    <span className="font-semibold text-indigo-600 text-xs uppercase">
                      Vendor reply
                    </span>
                    <p className="text-gray-600">{rev.vendor_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
