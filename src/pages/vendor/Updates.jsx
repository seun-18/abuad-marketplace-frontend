import { Image, Megaphone, Send, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const VendorUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadUpdates = async () => {
    try {
      const dashboard = await api.get('/vendors/dashboard.php');
      const vendorId = dashboard.data.data?.profile ? dashboard.data.data?.profile.vendor_id : null;
      const query = vendorId ? `?vendor_id=${vendorId}&limit=30` : '?limit=30';
      const response = await api.get(`/vendors/updates.php${query}`);
      if (response.data.success) setUpdates(response.data.data || []);
    } catch (error) {
      console.error('Failed to load store updates:', error);
      setFeedback(error.response?.data?.message || 'Could not load updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const publishUpdate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      const response = await api.post('/vendors/updates.php', {
        body,
        image_url: imageUrl,
      });
      if (response.data.success) {
        setBody('');
        setImageUrl('');
        setFeedback('Your update is now live for your followers.');
        await loadUpdates();
      }
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not publish this update.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeUpdate = async (id) => {
    try {
      await api.delete(`/vendors/updates.php?id=${id}`);
      setUpdates((current) => current.filter((update) => Number(update.id) !== Number(id)));
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not remove this update.');
    }
  };

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Store community</p>
          <h1>Updates for your followers.</h1>
          <p>Share new arrivals, restocks, pickup times, and short store announcements.</p>
        </div>
        <div className="dashboard-title-icon">
          <Megaphone size={22} />
        </div>
      </div>

      <div className="updates-layout">
        <form onSubmit={publishUpdate} className="dashboard-panel update-composer">
          <div className="panel-heading">
            <div>
              <p>Publish an update</p>
              <span>Approved vendors only · 1,000 characters maximum</span>
            </div>
            <Send size={18} />
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            minLength={3}
            required
            rows={7}
            placeholder="Tell your followers what is new..."
          />
          <label className="update-image-field">
            <Image size={16} />
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="Optional image URL"
            />
          </label>
          <div className="update-composer-footer">
            <span>{body.length}/1,000</span>
            <button type="submit" disabled={submitting || body.trim().length < 3}>
              {submitting ? 'Publishing…' : 'Publish update'}
            </button>
          </div>
          {feedback && <p className="dashboard-feedback">{feedback}</p>}
        </form>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Recent updates</p>
              <span>Visible to marketplace shoppers and your followers</span>
            </div>
            <Users size={18} />
          </div>
          {loading ? (
            <p className="dashboard-empty">Loading updates…</p>
          ) : updates.length === 0 ? (
            <p className="dashboard-empty">Your first store update will appear here.</p>
          ) : (
            <div className="vendor-update-list">
              {updates.map((update) => (
                <article key={update.id}>
                  {update.image_url && <img src={update.image_url} alt="" />}
                  <div>
                    <p>{update.body}</p>
                    <span>{new Date(update.created_at).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUpdate(update.id)}
                    aria-label="Remove update"
                  >
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VendorUpdates;
