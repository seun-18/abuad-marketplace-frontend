import { resolveImageUrl } from '../../utils/imageUrl';
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

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

  // Flat list: parents + children so both are selectable
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF, or WebP).');
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

  const resetForm = () => {
    setFormData(emptyForm);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
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

      // Upload device photo if selected
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

      setSuccess('Product created successfully.');
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
    return <div className="text-center py-20 text-gray-500 font-medium">Loading products…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-800">New Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
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
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Base Price (₦) *
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Base Stock *</label>
              <input
                type="number"
                name="base_stock"
                value={formData.base_stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Product Photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WebP · max 5MB</p>
            </div>
          </div>

          {imagePreview && (
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview('');
                }}
                className="text-xs text-rose-600 font-semibold"
              >
                Remove photo
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400">You haven&apos;t added any products yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={resolveImageUrl(product.primary_image)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{product.category_name || '—'}</td>
                    <td className="py-3.5 px-4 font-semibold">
                      ₦{Number(product.base_price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">{product.base_stock}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${
                          product.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
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
