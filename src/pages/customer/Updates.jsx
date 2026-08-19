import { ArrowRight, BadgeCheck, Megaphone, Store, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { resolveImageUrl } from '../../utils/imageUrl';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const CustomerUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/vendors/updates.php?following=1&limit=30')
      .then((response) => {
        if (response.data.success) setUpdates(response.data.data || []);
      })
      .catch((requestError) => {
        setError(getErrorMessage(requestError, 'Could not load seller updates.'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="customer-community-page">
      <div className="customer-community-heading">
        <div>
          <p className="eyebrow">Following feed</p>
          <h1 className="page-heading">Updates from your stores.</h1>
          <p>New arrivals, restocks, and pickup information from vendors you follow.</p>
        </div>
        <Link to="/customer/following">
          Manage following
          <ArrowRight size={16} />
        </Link>
      </div>

      {error ? <ErrorAlert title="Could not load updates" message={error} onDismiss={() => setError('')} /> : null}

      {loading ? (
        <div className="customer-update-list" aria-label="Loading updates">
          {[0, 1, 2].map((item) => (
            <div key={item} className="customer-update-skeleton" />
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="community-empty">
          <Megaphone size={30} />
          <h2>Your following feed is quiet.</h2>
          <p>Follow verified vendors to see their latest store updates here.</p>
          <Link to="/customer/following">View followed stores</Link>
        </div>
      ) : (
        <div className="customer-update-list">
          {updates.map((update) => (
            <article key={update.id} className="customer-update-card">
              <div className="customer-update-media">
                {update.media_type === 'video' && update.image_url ? (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    src={resolveImageUrl(update.image_url)}
                  />
                ) : (
                  <img
                    src={resolveImageUrl(update.image_url || update.shop_logo)}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0.35';
                    }}
                  />
                )}
              </div>
              <div className="customer-update-content">
                <div className="customer-update-vendor">
                  <span>
                    <BadgeCheck size={14} />
                    {update.shop_name}
                  </span>
                  <span>
                    <Users size={13} />
                    {Number(update.followers_count || 0).toLocaleString()}
                  </span>
                </div>
                <p>{update.body}</p>
                <div>
                  <span>{new Date(update.created_at).toLocaleString()}</span>
                  <Link to={`/products?vendor=${update.vendor_id}`}>
                    <Store size={14} />
                    Visit store
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerUpdates;
