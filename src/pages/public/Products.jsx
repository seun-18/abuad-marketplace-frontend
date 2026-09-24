import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    setFiltersOpen(false);
  };

  const handleCategorySelect = (slug) => {
    setCategory(slug);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || category || minPrice || maxPrice || sortBy !== 'latest'
  );

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Catalog</p>
        <h1 className="page-heading">Campus finds</h1>
      </header>

      <div className="catalog-category-wrap">
        <CategoryBar activeSlug={category} onSelect={handleCategorySelect} />
      </div>

      <div className="catalog-toolbar">
        <form
          className="catalog-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <div className="catalog-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search products"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search textbooks, gadgets, food..."
              enterKeyHint="search"
            />
            {search ? (
              <button
                type="button"
                className="catalog-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </form>

        <div className="catalog-toolbar-actions">
          <button
            type="button"
            className={`catalog-filter-toggle ${filtersOpen || hasActiveFilters ? 'active' : ''}`}
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>Filters</span>
          </button>
          <select
            className="catalog-sort"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            aria-label="Sort by"
          >
            <option value="latest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="popular">Popular</option>
          </select>
          {hasActiveFilters ? (
            <button
              type="button"
              className="catalog-clear-btn"
              onClick={handleResetFilters}
              aria-label="Clear all filters"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <div
          id="catalog-filters"
          className={`catalog-filters-panel ${filtersOpen ? 'open' : ''}`}
        >
          <label className="catalog-filter-field">
            <span>Min ₦</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="catalog-filter-field">
            <span>Max ₦</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Any"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
      </div>

      <div className="catalog-meta">
        <span>
          {loading
            ? 'Loading…'
            : `${products.length} result${products.length === 1 ? '' : 's'}`}
        </span>
        {category ? (
          <button type="button" className="catalog-chip" onClick={() => handleCategorySelect('')}>
            Category · clear
            <X size={12} />
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="catalog-error">
          <ErrorAlert
            title="Could not load products"
            message={error}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="product-grid" aria-label="Loading">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="product-skeleton">
              <span />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="catalog-empty">
          <div className="empty-icon">
            <Search size={28} aria-hidden="true" />
          </div>
          <p>No items found</p>
          <span>Try adjusting your filters or search terms</span>
          <button type="button" onClick={handleResetFilters} className="btn btn-primary">
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

      {totalPages > 1 ? (
        <nav className="pagination" aria-label="Pagination">
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
        </nav>
      ) : null}
    </div>
  );
};

export default Products;
