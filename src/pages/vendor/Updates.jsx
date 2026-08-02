import { Megaphone, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import LocalImagePicker from '../../components/LocalImagePicker';
import { resolveImageUrl } from '../../utils/imageUrl';

const VendorUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadUpdates = async () => {
    try {
      const dashboard = await api.get('/vendors/dashboard.php');
      const vendorId = dashboard.data.data?.profile?.vendor_id || null;
      const query = vendorId ? `?vendor_id=${vendorId}&limit=30` : '?limit=30';
      const response = await api.get(`/vendors/updates.php${query}`);
      if (response.data.success) setUpdates(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImage = (file) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const publishUpdate = async (event) => {
    event.preventDefault();
    if (!body.trim()) {
      setError('Write a short update first.');
      return;
    }
    setSubmitting(true);
    setFeedback('');
    setError('');
    try {
      let imageUrl = '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const upload = await api.post('/vendors/upload_update_image.php', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!upload.data?.success) {
          throw new Error(upload.data?.message || 'Image upload failed.');
        }
        imageUrl = upload.data?.data?.url || '';
      }
      const response = await api.post('/vendors/updates.php', {
        body: body.trim(),
        image_url: imageUrl || undefined,
      });
      if (response.data.success) {
        setBody('');
        handleImage(null);
        setFeedback('Update is live for your followers.');
        await loadUpdates();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not publish this update.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeUpdate = async (id) => {
    try {
      await api.delete(`/vendors/updates.php?id=${id}`);
      setUpdates((current) => current.filter((update) => Number(update.id) !== Number(id)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove this update.');
    }
  };

  return (
    <div className="premium-dashboard-page space-y-6">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Store community</p>
          <h1>Updates for your followers</h1>
          <p className="dashboard-lead">
            Share arrivals, restocks, and pickup times. Attach a photo from your device.
          </p>
        </div>
        <div className="dashboard-title-icon">
          <Megaphone size={22} />
        </div>
      </div>

      {feedback && <div className="dashboard-alert">{feedback}</div>}
      {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}

      <form onSubmit={publishUpdate} className="dashboard-panel space-y-4">
        <label>
          <span>Update</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            required
            maxLength={1000}
            placeholder="e.g. Fresh stock of notebooks available for hostel pickup today…"
          />
        </label>

        <LocalImagePicker
          label="Photo (optional)"
          hint="From camera or gallery · max 5 MB"
          file={imageFile}
          previewUrl={imagePreview}
          onChange={handleImage}
        />

        <button type="submit" disabled={submitting} className="dashboard-action-button">
          <Send size={16} />
          {submitting ? 'Publishing…' : 'Publish update'}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent updates</h2>
        {loading ? (
          <p className="dashboard-empty">Loading…</p>
        ) : updates.length === 0 ? (
          <p className="dashboard-empty">No updates published yet.</p>
        ) : (
          updates.map((update) => (
            <article key={update.id} className="dashboard-panel space-y-2">
              <p>{update.body}</p>
              {update.image_url && (
                <img
                  src={resolveImageUrl(update.image_url)}
                  alt=""
                  className="max-h-56 w-full rounded-xl object-cover"
                />
              )}
              <div className="flex items-center justify-between gap-2 text-xs opacity-50">
                <span>{update.created_at ? new Date(update.created_at).toLocaleString() : ''}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-rose-500"
                  onClick={() => removeUpdate(update.id)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default VendorUpdates;
