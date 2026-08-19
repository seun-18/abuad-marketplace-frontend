import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

// The API nests subcategories inside each top-level category's
// `subcategories` array — flatten so shoppers can actually filter by them.
const flattenCategories = (tree) =>
  tree.flatMap((parent) => [
    { ...parent, depth: 0 },
    ...(parent.subcategories || []).map((sub) => ({ ...sub, depth: 1 })),
  ]);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for API response
  const [products, setProducts] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const categories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  // Filter States initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [vendor] = useState(searchParams.get('vendor') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load Categories List for Filter Sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/index.php');
        if (res.data.success) {
          setCategoryTree(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        // non-blocking — filters still work without category list
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products whenever filters/page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (vendor) params.append('vendor', vendor);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);
        if (sortBy) params.append('sort', sortBy);
        params.append('page', page);
        params.append('limit', 12);

        // Sync URL with state
        setSearchParams(params);

        const res = await api.get(`/products/index.php?${params.toString()}`);
        if (res.data.success) {
          setError('');
          setProducts(res.data.data?.products || []);
          if (res.data.data?.pagination) {
            setTotalPages(res.data.data.pagination.total_pages || 1);
          }
        }
      } catch (err) {
        console.error('Failed to fetch filtered products', err);
        setError(getErrorMessage(err, 'Could not load products. Please try again.'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, vendor, minPrice, maxPrice, sortBy, page, reloadToken]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* FILTER SIDEBAR */}
      <aside className="w-full md:w-64 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0 h-fit space-y-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-3">Filters</h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Reset All Filters
          </button>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Search</label>
          <input
            type="text"
            aria-label="Search products"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.depth ? `\u00A0\u00A0↳ ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
            Price Range (₦)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </aside>

      {/* PRODUCT LISTINGS AREA */}
      <main className="flex-1">
        {/* Top Header & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
          <p className="text-sm text-gray-600">Showing catalog results</p>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="latest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mb-6">
            <ErrorAlert
              title="Could not load products"
              message={error}
              onRetry={() => setReloadToken((n) => n + 1)}
            />
          </div>
        ) : null}

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">No products match your search/filter criteria.</p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
