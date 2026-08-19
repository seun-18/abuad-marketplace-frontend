import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [vendor] = useState(searchParams.get('vendor') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    api
      .get('/categories/index.php')
      .then((res) => {
        if (res.data.success) setCategories(res.data.data || []);
      })
      .catch(() => {});
  }, []);

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

        setSearchParams(params);

        const res = await api.get(`/products/index.php?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data?.products || []);
          if (res.data.data?.pagination) {
            setTotalPages(res.data.data.pagination.total_pages || 1);
          }
        }
      } catch (err) {
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

  const hasActiveFilters = search || category || minPrice || maxPrice || sortBy !== 'latest';

  return (
    <div className="products-layout">
      <div>
        <p className="eyebrow">Catalog</p>
        <h1 className="page-heading" style={{ marginTop: '0.25rem' }}>
          Shop campus finds
        </h1>
      </div>

      {/* Search + filter toggle */}
      <div className="products-toolbar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
              aria-hidden
            />
            <input
              type="search"
              aria-label="Search products"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products, brands…"
              className="field pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="btn btn-outline"
            aria-expanded={filtersOpen}
            style={{ minWidth: '2.75rem', padding: '0 0.85rem' }}
          >
            {filtersOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
          </button>
        </form>

        {filtersOpen && (
          <div className="products-filters surface-card" style={{ padding: '1rem' }}>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min ₦"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
            />
            <input
              type="number"
              placeholder="Max ₦"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
            >
              <option value="latest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="popular">Popular</option>
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm font-semibold"
                style={{ color: 'var(--gold-strong)', whiteSpace: 'nowrap' }}
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div className="products-meta">
        <span>
          {loading
            ? 'Loading…'
            : `${products.length} result${products.length === 1 ? '' : 's'}`}
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort by"
          className="hidden sm:block"
          style={{
            minHeight: '2.2rem',
            padding: '0.35rem 0.6rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            fontSize: '0.82rem',
          }}
        >
          <option value="latest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {error && (
        <ErrorAlert
          title="Could not load products"
          message={error}
          onRetry={() => setReloadToken((n) => n + 1)}
        />
      )}

      {loading ? (
        <div className="product-grid" aria-label="Loading">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="product-skeleton">
              <span />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="catalog-message">
          <p>No products match your filters</p>
          <span>Try adjusting search or clearing filters.</span>
          <button type="button" onClick={handleResetFilters} className="btn btn-primary mt-2">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                type="button"
                className={page === p ? 'active' : ''}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
