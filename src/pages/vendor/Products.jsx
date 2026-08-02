import { Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import LocalImagePicker from '../../components/LocalImagePicker';
import { resolveImageUrl } from '../../utils/imageUrl';

const emptyForm = {
  category_id: '',
  name: '',
  brand: '',
  description: '',
  base_price: '',
  base_stock: '',
};

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/vendors/products.php');
      if (res.data.success) {
        setProducts(res.data.data || []);
      } else {
        setError(res.data.message || 'Failed to load products.');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/index.php');
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const categoryOptions = [];
  categories.forEach((cat) => {
    categoryOptions.push({ id: cat.id, label: cat.name, depth: 0 });
    (cat.subcategories || []).forEach((sub) => {
      categoryOptions.push({ id: sub.id, label: `${cat.name} → ${sub.name}`, depth: 1 });
    });
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const resetForm = () => {
    setFormData(emptyForm);
    handleImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!formData.category_id) {
        setError('Please select a category.');
        setSubmitting(false);
        return;
      }

      const payload = {
        category_id: Number(formData.category_id),
        name: formData.name.trim(),
        brand: formData.brand.trim() || null,
        description: formData.description.trim() || '',
        base_price: Number(formData.base_price),
        base_stock: Number(formData.base_stock),
      };

      const res = await api.post('/vendors/products.php', payload);
      if (!res.data.success) {
        setError(res.data.message || 'Failed to create the product.');
        setSubmitting(false);
        return;
      }

      const productId = res.data.data?.product_id;

      if (imageFile && productId) {
        const fd = new FormData();
        fd.append('product_id', String(productId));
        fd.append('image', imageFile);
        fd.append('is_primary', '1');
        try {
          await api.post('/products/upload_image.php', fd);
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
          setError(
            uploadErr.response?.data?.message ||
              'Product created, but image upload failed. You can try again later.'
          );
          setShowForm(false);
          resetForm();
          fetchProducts();
          setSubmitting(false);
          return;
        }
      }

      setSuccess('Product listed.');
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Create product error:', err);
      setError(err.response?.data?.message || 'Could not create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const product = products.find((p) => p.id === productId);
      const res = await api.put('/vendors/products.php', {
        product_id: productId,
        name: product?.name,
        base_price: product?.base_price,
        base_stock: product?.base_stock,
        description: product?.description || '',
        status: newStatus,
      });
      if (res.data.success) {
        fetchProducts();
      } else {
        setError(res.data.message || 'Failed to update status.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update product.');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading products…</div>;
  }

  return (
    <div className="premium-dashboard-page space-y-6">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Your catalog</p>
          <h1>Products</h1>
          <p>List items with a photo from your device. No image URLs required.</p>
        </div>
        <button
          type="button"
          className="dashboard-action-button"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
            if (showForm) resetForm();
          }}
        >
          <Plus size={16} />
          {showForm ? 'Close' : 'Add product'}
        </button>
      </div>

      {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}
      {success && <div className="dashboard-alert">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="dashboard-panel vendor-product-form">
          <div className="panel-heading">
            <div>
              <p>New product</p>
              <span>Photo · price · stock</span>
            </div>
            <Package size={18} />
          </div>

          <div className="vendor-product-form-grid">
            <label>
              <span>Category *</span>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select category</option>
                {categoryOptions.length === 0 ? (
                  <option value="" disabled>
                    No categories yet — add some under Categories.
                  </option>
                ) : (
                  categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              <span>Product name *</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                minLength={2}
              />
            </label>

            <label>
              <span>Brand</span>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </label>

            <label>
              <span>Price (₦) *</span>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </label>

            <label>
              <span>Stock *</span>
              <input
                type="number"
                name="base_stock"
                value={formData.base_stock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </label>
          </div>

          <LocalImagePicker
            label="Product photo"
            hint="Shoot or pick from gallery · max 5 MB"
            file={imageFile}
            previewUrl={imagePreview}
            onChange={handleImage}
            tall
          />

          <label>
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Condition, size, pickup notes…"
            />
          </label>

          <div className="vendor-product-form-actions">
            <button type="submit" disabled={submitting} className="dashboard-action-button">
              {submitting ? 'Creating…' : 'List product'}
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="dashboard-panel">
          <p className="dashboard-empty">No products yet. Add your first listing.</p>
        </div>
      ) : (
        <div className="dashboard-panel vendor-product-table-wrap">
          <div className="overflow-x-auto">
            <table className="vendor-product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="vendor-product-cell">
                        <img
                          src={resolveImageUrl(product.primary_image)}
                          alt={product.name}
                        />
                        <div>
                          <p>{product.name}</p>
                          {product.brand ? <span>{product.brand}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>{product.category_name || '—'}</td>
                    <td className="font-semibold">
                      ₦{Number(product.base_price).toLocaleString()}
                    </td>
                    <td>{product.base_stock}</td>
                    <td>
                      <span
                        className={`status-pill status-pill-${
                          product.status === 'active' ? 'ok' : 'muted'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="table-text-btn"
                        onClick={() => handleToggleStatus(product.id, product.status)}
                      >
                        {product.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
