import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Store,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { resolveImageUrl } from '../../utils/imageUrl';

const Following = () => {
  const [vendors, setVendors] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const loadFollowing = async () => {
    try {
      const [followingResponse, directoryResponse] = await Promise.all([
        api.get('/vendors/follow.php'),
        api.get('/vendors/follow.php?discover=1'),
      ]);
      if (followingResponse.data.success) setVendors(followingResponse.data.data || []);
      if (directoryResponse.data.success) setDirectory(directoryResponse.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load approved vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowing();
  }, []);

  const toggleFollow = async (vendorId) => {
    setBusyId(vendorId);
    setError('');
    try {
      const response = await api.post('/vendors/follow.php', { vendor_id: vendorId });
      if (!response.data.success) return;

      const isFollowing = Boolean(response.data.data?.is_following);
      setDirectory((current) =>
        current.map((vendor) =>
          Number(vendor.vendor_id) === Number(vendorId)
            ? {
                ...vendor,
                is_following: isFollowing ? 1 : 0,
                followers_count: response.data.data?.followers_count,
              }
            : vendor
        )
      );

      if (isFollowing) {
        await loadFollowing();
      } else {
        setVendors((current) =>
          current.filter((vendor) => Number(vendor.vendor_id) !== Number(vendorId))
        );
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this vendor.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="customer-community-page">
      <div className="customer-community-heading">
        <div>
          <p className="eyebrow">Your campus community</p>
          <h1 className="page-heading">Stores you follow.</h1>
          <p>Keep up with trusted ABUAD vendors, restocks, and new arrivals.</p>
        </div>
        <Link to="/customer/updates">
          View seller updates
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && <div className="wishlist-error">{error}</div>}

      {loading ? (
        <div className="following-grid" aria-label="Loading followed vendors">
          {[0, 1, 2].map((item) => (
            <div key={item} className="following-skeleton" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="community-empty">
          <Store size={30} />
          <h2>You are not following any stores yet.</h2>
          <p>Choose from the approved ABUAD shops listed below.</p>
          <a href="#vendor-directory">Find ABUAD vendors</a>
        </div>
      ) : (
        <div className="following-grid">
          {vendors.map((vendor) => (
            <article key={vendor.vendor_id} className="following-card">
              <Link to={`/products?vendor=${vendor.vendor_id}`} className="following-card-cover">
                <img
                  src={resolveImageUrl(vendor.cover_image || vendor.shop_logo)}
                  alt={`${vendor.shop_name} storefront`}
                />
                <span>
                  <BadgeCheck size={14} />
                  Admin approved
                </span>
              </Link>
              <div className="following-card-body">
                <div>
                  <h2>{vendor.shop_name}</h2>
                  <p>
                    <Users size={13} />
                    {Number(vendor.active_products || 0).toLocaleString()} active products
                  </p>
                </div>
                {vendor.latest_update && (
                  <blockquote>
                    “{vendor.latest_update}”
                    <span>
                      {vendor.latest_update_at
                        ? new Date(vendor.latest_update_at).toLocaleDateString()
                        : ''}
                    </span>
                  </blockquote>
                )}
                <div className="following-card-actions">
                  <Link to={`/products?vendor=${vendor.vendor_id}`}>
                    Visit store
                    <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFollow(vendor.vendor_id)}
                    disabled={busyId === vendor.vendor_id}
                  >
                    <UserMinus size={14} />
                    Unfollow
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && (
        <section id="vendor-directory" className="vendor-directory">
          <div className="vendor-directory-heading">
            <div>
              <p className="eyebrow">Verified store directory</p>
              <h2>Find approved ABUAD vendors.</h2>
            </div>
            <span>{directory.length} approved stores</span>
          </div>

          {directory.length === 0 ? (
            <div className="community-empty">
              <Store size={28} />
              <h2>No approved vendors are available yet.</h2>
              <p>New shops will appear here immediately after administrator approval.</p>
            </div>
          ) : (
            <div className="following-grid">
              {directory.map((vendor) => (
                <article key={vendor.vendor_id} className="following-card vendor-directory-card">
                  <Link
                    to={`/products?vendor=${vendor.vendor_id}`}
                    className="following-card-cover"
                  >
                    <img
                      src={resolveImageUrl(vendor.cover_image || vendor.shop_logo)}
                      alt={`${vendor.shop_name} storefront`}
                    />
                    <span>
                      <BadgeCheck size={14} />
                      Admin approved
                    </span>
                  </Link>
                  <div className="following-card-body">
                    <div>
                      <h2>{vendor.shop_name}</h2>
                      <p>
                        <Users size={13} />
                        {Number(vendor.followers_count || 0).toLocaleString()} followers ·{' '}
                        {Number(vendor.active_products || 0).toLocaleString()} products
                      </p>
                    </div>
                    <div className="following-card-actions">
                      <Link to={`/customer/chat?vendor_id=${vendor.vendor_id}`}>
                        <MessageCircle size={14} />
                        Message shop
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFollow(vendor.vendor_id)}
                        disabled={busyId === vendor.vendor_id}
                      >
                        {Number(vendor.is_following) === 1 ? (
                          <>
                            <UserMinus size={14} />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} />
                            Follow
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Following;
