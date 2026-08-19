import { ArrowDownUp, Filter, Search, SlidersHorizontal, X, ShieldCheck, MessageCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const FALLBACK_CATEGORIES = [
  { id: 'all', slug: '', name: 'All' },
  { id: 'tech', slug: 'electronics', name: 'Tech & Gadgets' },
  { id: 'books', slug: 'books', name: 'Textbooks & Notes' },
  { id: 'fashion', slug: 'fashion', name: 'Fashion' },
  { id: 'food', slug: 'food', name: 'Food & Snacks' },
  { id: 'hostel', slug: 'home', name: 'Hostel Essentials' },
  { id: 'services', slug: 'services', name: 'Services' },
];

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
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/index.php');
        if (res.data.success) setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
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

        setSearchParams(params, { replace: true });
        const res = await api.get(`/products/index.php?${params.toString()}`);

        if (res.data.success) {
          setProducts(res.data.data?.products || []);
          setTotalPages(res.data.data?.pagination?.total_pages || 1);
        } else {
          setError(res.data.message || 'Could not load products.');
          setProducts([]);
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
  }, [search, category, vendor, minPrice, maxPrice, sortBy, page, reloadToken, setSearchParams]);

  const displayCategories = useMemo(() => {
    if (!categories.length) return FALLBACK_CATEGORIES;
    const mapped = categories.slice(0, 7).map((cat) => ({ id: cat.id, slug: cat.slug, name: cat.name }));
    return [{ id: 'all', slug: '', name: 'All' }, ...mapped];
  }, [categories]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setPage(1);
    setSearchParams({});
  };

  const chooseCategory = (slug) => {
    setCategory(slug);
    setPage(1);
  };

  const filterPanel = (
    <div className="market-filter-panel">
      <div className="market-filter-heading">
        <div>
          <span className="market-mini-eyebrow">Refine</span>
          <h2>Filter products</h2>
        </div>
        <button type="button" className="market-filter-reset" onClick={handleResetFilters}>Reset</button>
      </div>

      <label className="market-field-label" htmlFor="catalog-search">Search</label>
      <div className="market-filter-search">
        <Search size={16} />
        <input
          id="catalog-search"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Search textbooks, gadgets, food..."
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>
        )}
      </div>

      <label className="market-field-label" htmlFor="catalog-category">Category</label>
      <select id="catalog-category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="market-filter-select">
        <option value="">All categories</option>
        {categories.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
      </select>

      <label className="market-field-label">Price range (₦)</label>
      <div className="market-price-inputs">
        <input type="number" min="0" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} placeholder="Min" aria-label="Minimum price" />
        <span>—</span>
        <input type="number" min="0" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} placeholder="Max" aria-label="Maximum price" />
      </div>

      <button type="button" className="market-apply-filter" onClick={() => setFiltersOpen(false)}>Apply filters</button>
    </div>
  );

  return (
    <div className="market-catalog-page">
      <section className="market-catalog-hero">
        <div>
          <span className="market-mini-eyebrow">ABUAD marketplace</span>
          <h1>Find what you need.<br /><em>Right on campus.</em></h1>
          <p>Shop from student sellers, discover useful campus finds and choose a convenient drop-off point.</p>
        </div>
        <div className="market-catalog-hero-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search textbooks, gadgets, food..."
            aria-label="Search products"
          />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={16} /></button>}
        </div>
      </section>

      <div className="market-category-bar" aria-label="Product categories">
        {displayCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`market-category-pill ${category === cat.slug ? 'is-active' : ''}`}
            onClick={() => chooseCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="market-catalog-layout">
        <aside className="market-desktop-filter">{filterPanel}</aside>

        <main className="market-catalog-main">
          <div className="market-catalog-toolbar">
            <div>
              <span className="market-mini-eyebrow">Live catalog</span>
              <p>{loading ? 'Finding campus products…' : `${products.length} items on this page`}</p>
            </div>
            <div className="market-toolbar-actions">
              <button type="button" className="market-filter-button" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={17} /> Filter
              </button>
              <label className="market-sort">
                <ArrowDownUp size={15} />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="latest">Newest</option>
                  <option value="popular">Popular</option>
                  <option value="price_asc">Lowest price</option>
                  <option value="price_desc">Highest price</option>
                </select>
              </label>
            </div>
          </div>

          <div className="market-trust-banner">
            <span className="market-trust-icon"><ShieldCheck size={21} /></span>
            <div>
              <strong>Shop with confidence</strong>
              <p>Use secure checkout, confirm your campus hand-off and keep your order trail in one place.</p>
            </div>
          </div>

          <div className="market-chat-strip">
            <span className="market-chat-icon"><MessageCircle size={16} /></span>
            <div><strong>Need to ask a seller?</strong><span>Chat before you buy and agree on a convenient meet-up point.</span></div>
          </div>

          {error ? (
            <ErrorAlert title="Could not load products" message={error} onRetry={() => setReloadToken((n) => n + 1)} />
          ) : loading ? (
            <div className="market-product-grid" aria-label="Loading products">
              {Array.from({ length: 6 }, (_, index) => <div className="market-product-skeleton" key={index} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="market-empty-state">
              <div className="market-empty-icon"><Search size={28} /></div>
              <h2>No items found</h2>
              <p>Try adjusting your filters or search terms.</p>
              <button type="button" onClick={handleResetFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="market-product-grid">
              {products.map((product) => <ProductCard key={product.id || product.slug} product={product} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="market-pagination">
              <button disabled={page === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))}>Next</button>
            </div>
          )}
        </main>
      </div>

      {filtersOpen && (
        <div className="market-filter-overlay" role="dialog" aria-modal="true" aria-label="Filters" onClick={() => setFiltersOpen(false)}>
          <div className="market-filter-sheet" onClick={(event) => event.stopPropagation()}>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
