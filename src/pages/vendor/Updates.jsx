import { Image, Megaphone, Send, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

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

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
        imageUrl = upload.data?.data?.url || '';
      }
      const response = await api.post('/vendors/updates.php', {
        body: body.trim(),
        image_url: imageUrl,
      });
      if (response.data.success) {
        setBody('');
        setImageFile(null);
        setImagePreview('');
        setFeedback('Your update is live for your followers.');
        await loadUpdates();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish this update.');
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
            Share new arrivals, restocks, and pickup times. Attach a photo from your device.
          </p>
        </div>
        <div className="dashboard-title-icon">
          <Megaphone size={22} />
        </div>
      </div>

      {feedback && <div className="auth-alert auth-alert-success">{feedback}</div>}
      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form onSubmit={publishUpdate} className="dashboard-panel space-y-4">
        <label className="block">
          <span className="text-xs font-semibold opacity-60">Update text</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            required
            maxLength={1000}
            placeholder="e.g. Fresh stock of notebooks available for hostel pickup today…"
            className="mt-1 w-full"
          />
        </label>

        <label className="local-image-upload">
          <span className="text-xs font-semibold opacity-60">Photo from your device (optional)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onPickImage}
          />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="local-upload-preview" />
          ) : (
            <span className="local-upload-empty">
              <Upload size={18} /> Tap to choose image from gallery / files
            </span>
          )}
          {imageFile && <small className="local-upload-file">{imageFile.name}</small>}
        </label>

        <button type="submit" disabled={submitting} className="chat-start-btn inline-flex items-center gap-2">
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
                  src={update.image_url}
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
