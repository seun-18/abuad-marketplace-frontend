import { Layers3, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import LocalImagePicker from '../../components/LocalImagePicker';
import { resolveImageUrl } from '../../utils/imageUrl';

const emptyForm = {
  name: '',
  parent_id: '',
  description: '',
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

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
  };

  const createCategory = async (event) => {
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
        setForm(emptyForm);
        handleImage(null);
        setFeedback('Category created and available to approved vendors.');
        await fetchCategories();
      } else {
        setError(response.data.message || 'Could not create category.');
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Could not create category.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete “${category.name}”? Categories in use cannot be removed.`)) return;
    setError('');
    try {
      await api.delete('/categories/index.php', { data: { id: category.id } });
      await fetchCategories();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'This category may still contain products or subcategories.'
      );
    }
  };

  if (loading) return <div className="dashboard-loading">Loading categories…</div>;

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Marketplace taxonomy</p>
          <h1>Categories &amp; cover art</h1>
          <p>Only administrators change the global product structure.</p>
        </div>
        <div className="dashboard-title-icon">
          <Layers3 size={22} />
        </div>
      </div>

      {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}
      {feedback && <div className="dashboard-alert">{feedback}</div>}

      <div className="dashboard-admin-grid category-admin-layout">
        <form onSubmit={createCategory} className="dashboard-panel category-admin-form">
          <div className="panel-heading">
            <div>
              <p>Add a category</p>
              <span>Pick a cover photo from your device</span>
            </div>
            <Plus size={18} />
          </div>
          <label>
            <span>Category name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
              minLength={2}
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
              value={form.description}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>

          <LocalImagePicker
            label="Cover image"
            hint="Landscape works best · JPG, PNG or WebP · max 5 MB"
            accept="image/jpeg,image/png,image/webp"
            file={imageFile}
            previewUrl={imagePreview}
            onChange={handleImage}
            tall
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create category'}
          </button>
        </form>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Category catalog</p>
              <span>Ranked by active products and sales</span>
            </div>
            <Layers3 size={18} />
          </div>
          {categories.length === 0 ? (
            <p className="dashboard-empty">Create the first marketplace category.</p>
          ) : (
            <div className="admin-category-list">
              {categories.map((category) => (
                <article key={category.id}>
                  <img src={resolveImageUrl(category.category_image)} alt="" />
                  <div>
                    <p>{category.name}</p>
                    <span>
                      {Number(category.product_count || 0).toLocaleString()} products ·{' '}
                      {Number(category.units_sold || 0).toLocaleString()} sales
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category)}
                    aria-label={`Delete ${category.name}`}
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

export default AdminCategories;
