import { ArrowRight, BadgeCheck, Megaphone, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { resolveImageUrl } from '../utils/imageUrl';

const VendorUpdatesFeed = () => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    api
      .get('/vendors/updates.php?limit=6')
      .then((response) => {
        if (response.data.success) setUpdates(response.data.data || []);
      })
      .catch((error) => console.error('Vendor update feed unavailable:', error));
  }, []);

  if (updates.length === 0) return null;

  return (
    <section className="home-section seller-update-section">
      <div className="section-heading-row">
        <div>
          <p className="luxury-eyebrow">
            <span />
            Live from ABUAD stores
          </p>
          <h2>What campus sellers are sharing.</h2>
        </div>
        <Link to="/products?sort=latest" className="text-link-gold">
          Discover new arrivals
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="seller-update-grid">
        {updates.map((update) => (
          <article key={update.id} className="seller-update-card">
            {update.image_url ? (
              <img src={resolveImageUrl(update.image_url)} alt="" loading="lazy" />
            ) : (
              <div className="seller-update-art">
                <Megaphone size={30} />
              </div>
            )}
            <div className="seller-update-body">
              <div className="seller-update-vendor">
                <span>
                  <BadgeCheck size={13} />
                  {update.shop_name}
                </span>
                <span>
                  <Users size={12} />
                  {Number(update.followers_count || 0).toLocaleString()}
                </span>
              </div>
              <p>{update.body}</p>
              <span className="seller-update-time">
                {new Date(update.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VendorUpdatesFeed;
