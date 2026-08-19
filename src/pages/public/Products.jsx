import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import CategoryBar from '../../components/filters/CategoryBar';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [vendor] = useState(searchParams.get('vendor') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setSortBy(searchParams.get('sort') || 'latest');
  }, [searchParams]);

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

  const handleCategorySelect = (slug) => {
    setCategory(slug);
    setPage(1);
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || sortBy !== 'latest';

  return (
    <div>
      <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
        <p className="eyebrow">Catalog</p>
        <h1 className="page-heading" style={{ marginTop: '0.2rem' }}>
          Campus finds
        </h1>
      </div>

      <CategoryBar activeSlug={category} onSelect={handleCategorySelect} />

      <div className="products-toolbar" style={{ padding: '0 0.75rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
              }}
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
              placeholder="Search textbooks, gadgets, food..."
              className="field"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-outline"
              style={{ minWidth: '2.75rem', padding: '0 0.75rem' }}
              aria-label="Clear filters"
            >
              <X size={18} />
            </button>
          )}
        </form>

        <div className="products-filters">
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
        </div>
      </div>

      <div className="products-meta" style={{ padding: '0 0.75rem' }}>
        <span>
          {loading
            ? 'Loading…'
            : `${products.length} result${products.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {error && (
        <div style={{ padding: '0 0.75rem' }}>
          <ErrorAlert
            title="Could not load products"
            message={error}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
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
        <div className="product-grid">
          <div className="catalog-message">
            <div className="empty-icon">
              <Search size={28} aria-hidden="true" />
            </div>
            <p>No items found</p>
            <span>Try adjusting your filters or search terms</span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
            >
              Clear filters
            </button>
          </div>
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
