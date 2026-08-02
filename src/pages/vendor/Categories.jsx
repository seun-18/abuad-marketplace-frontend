import { Image, Layers3, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import LocalImagePicker from '../../components/LocalImagePicker';
import { resolveImageUrl } from '../../utils/imageUrl';

const VendorCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    parent_id: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/index.php');
      if (response.data.success) setCategories(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImage = (file) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setFeedback('');
    try {
      let imageUrl = '';
      if (imageFile) {
        const upload = new FormData();
        upload.append('image', imageFile);
        const uploadResponse = await api.post('/categories/upload_image.php', upload);
        if (!uploadResponse.data?.success) {
          throw new Error(uploadResponse.data?.message || 'Image upload failed.');
        }
        imageUrl = uploadResponse.data.data?.url || '';
      }

      const response = await api.post('/categories/index.php', {
        ...form,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        image_url: imageUrl || undefined,
      });
      if (response.data.success) {
        setForm({ name: '', parent_id: '', description: '' });
        handleImage(null);
        setFeedback('Category created and ready for product listings.');
        await fetchCategories();
      } else {
        setError(response.data.message || 'Could not create this category.');
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Could not create this category.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading product categories…</div>;

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Catalog organization</p>
          <h1>Product categories</h1>
          <p>Create a category and attach a cover photo from your phone or computer.</p>
        </div>
        <div className="dashboard-title-icon">
          <Layers3 size={22} />
        </div>
      </div>

      {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}
      {feedback && <div className="dashboard-alert">{feedback}</div>}

      <div className="dashboard-admin-grid category-admin-layout">
        <form onSubmit={submitCategory} className="dashboard-panel category-admin-form">
          <div className="panel-heading">
            <div>
              <p>New category</p>
              <span>Clear name · real cover photo</span>
            </div>
            <Plus size={18} />
          </div>

          <label>
            <span>Category name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              minLength={2}
              required
            />
          </label>
          <label>
            <span>Parent category</span>
            <select
              value={form.parent_id}
              onChange={(event) =>
                setForm((current) => ({ ...current, parent_id: event.target.value }))
              }
            >
              <option value="">Top-level category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows={3}
              maxLength={255}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What products belong here?"
            />
          </label>

          <LocalImagePicker
            label="Cover image"
            hint="Landscape preferred · JPG, PNG or WebP · max 5 MB"
            accept="image/jpeg,image/png,image/webp"
            file={imageFile}
            previewUrl={imagePreview}
            onChange={handleImage}
            tall
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Uploading and creating…' : 'Create category'}
          </button>
        </form>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Available categories</p>
              <span>Use these when you publish products</span>
            </div>
            <Image size={18} />
          </div>
          <div className="admin-category-list">
            {categories.length === 0 ? (
              <p className="dashboard-empty">No categories yet.</p>
            ) : (
              categories.map((category) => (
                <article key={category.id}>
                  <img src={resolveImageUrl(category.category_image)} alt="" />
                  <div>
                    <p>{category.name}</p>
                    <span>
                      {Number(category.product_count || 0).toLocaleString()} products ·{' '}
                      {Number(category.units_sold || 0).toLocaleString()} sales
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorCategories;
