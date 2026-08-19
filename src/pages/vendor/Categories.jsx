import { Image, Layers3, Plus, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { resolveImageUrl } from '../../utils/imageUrl';

// The API returns only top-level categories, each with a `subcategories` array
// nested inside it. Flatten that tree so subcategories are selectable and
// visible too, instead of silently disappearing from every list on this page.
const flattenCategories = (tree) =>
  tree.flatMap((parent) => [
    { ...parent, depth: 0 },
    ...(parent.subcategories || []).map((sub) => ({ ...sub, depth: 1 })),
  ]);

const VendorCategories = () => {
  const [categoryTree, setCategoryTree] = useState([]);
  const categories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const [form, setForm] = useState({
    name: '',
    parent_id: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ''), [imageFile]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/index.php');
      if (response.data.success) setCategoryTree(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const selectCategoryImage = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP category image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Category images must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setError('');
    setImageFile(file);
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
        imageUrl = uploadResponse.data.data?.url || '';
      }

      const response = await api.post('/categories/index.php', {
        ...form,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        image_url: imageUrl,
      });
      if (response.data.success) {
        setForm({ name: '', parent_id: '', description: '' });
        setImageFile(null);
        setFeedback('Category created and ready for product listings.');
        await fetchCategories();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create this category.');
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
          <h1>Add a product category.</h1>
          <p>Approved vendors can create a category and upload its cover from their device.</p>
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
              <span>Use a clear name and a real cover photo</span>
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
              {categories
                .filter((category) => category.depth === 0)
                .map((category) => (
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
              placeholder="What products belong in this category?"
            />
          </label>

          <label className="local-image-upload">
            <span>Cover image from your device</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectCategoryImage}
            />
            <div>
              {previewUrl ? (
                <img src={previewUrl} alt="Category cover preview" />
              ) : (
                <span className="local-upload-empty">
                  <Upload size={20} />
                  Choose JPG, PNG, or WebP
                  <small>Landscape images work best · maximum 5 MB</small>
                </span>
              )}
            </div>
            {imageFile && <small className="local-upload-file">{imageFile.name}</small>}
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Uploading and creating…' : 'Create category'}
          </button>
        </form>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>Available categories</p>
              <span>Select these when publishing your products</span>
            </div>
            <Image size={18} />
          </div>
          <div className="admin-category-list">
            {categories.map((category) => (
              <article key={category.id} style={category.depth ? { paddingLeft: '1.5rem' } : undefined}>
                <img src={resolveImageUrl(category.category_image)} alt="" />
                <div>
                  <p>
                    {category.depth ? '↳ ' : ''}
                    {category.name}
                  </p>
                  <span>
                    {Number(category.product_count || 0).toLocaleString()} products ·{' '}
                    {Number(category.units_sold || 0).toLocaleString()} sales
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorCategories;
