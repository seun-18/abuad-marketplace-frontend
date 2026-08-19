import {
  ArrowRight,
  BadgeCheck,
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import trustCommunityImage from '../../assets/abuad-trust-community.jpg';
import CategoryGrid from '../../components/CategoryGrid';
import ProductCard from '../../components/ProductCard';
import VendorUpdatesFeed from '../../components/VendorUpdatesFeed';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const searchIdeas = ['iPhone', 'laptops', 'Nike shoes', 'headphones', 'textbooks'];

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [search, setSearch] = useState('');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/products/index.php?limit=8');
        if (response.data.success) {
          setFeaturedProducts(response.data.data?.products || []);
        } else {
          setCatalogError(response.data.message || 'Catalog temporarily unavailable.');
        }
      } catch (err) {
        setCatalogError(
          getErrorMessage(err, 'Catalog temporarily unavailable. Please try again shortly.')
        );
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    let ideaIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer;

    const type = () => {
      const phrase = `Search ${searchIdeas[ideaIndex]}…`;
      characterIndex += deleting ? -1 : 1;
      setTypedPlaceholder(phrase.slice(0, characterIndex));

      if (!deleting && characterIndex === phrase.length) {
        deleting = true;
        timer = window.setTimeout(type, 1400);
        return;
      }
      if (deleting && characterIndex === 0) {
        deleting = false;
        ideaIndex = (ideaIndex + 1) % searchIdeas.length;
      }
      timer = window.setTimeout(type, deleting ? 30 : 65);
    };

    timer = window.setTimeout(type, 400);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  const features = [
    {
      Icon: ShieldCheck,
      title: 'Protected payments',
      copy: 'Secure Paystack checkout and a clear order trail from cart to delivery.',
      number: '01',
    },
    {
      Icon: BadgeCheck,
      title: 'Verified sellers',
      copy: 'Shop independent stores and trusted vendors right around campus.',
      number: '02',
    },
    {
      Icon: MessageCircleMore,
      title: 'Direct chat',
      copy: 'Ask questions, confirm details, and buy with confidence.',
      number: '03',
    },
  ];

  return (
    <div className="home-shell">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-banner">
            <img
              className="hero-banner-img"
              src={trustCommunityImage}
              alt="ABUAD campus marketplace"
            />
            <div className="hero-banner-overlay">
              <p className="hero-kicker">Campus marketplace</p>
              <h1>Shop everything on campus</h1>
              <p>Phones, fashion, books & essentials — from verified ABUAD sellers.</p>

              <form onSubmit={handleSearch} className="hero-search" role="search">
                <Search size={18} aria-hidden="true" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={typedPlaceholder || 'Search products, brands…'}
                  aria-label="Search the marketplace"
                />
                <button type="submit">Search</button>
              </form>

              <div className="hero-actions">
                <Link to="/products" className="hero-btn-primary">
                  Shop now
                </Link>
                <Link to="/register" className="hero-btn-outline">
                  Sell on ABUAD
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="trust-strip">
          <div>
            <ShieldCheck size={16} />
            <span>Secure checkout</span>
          </div>
          <div>
            <BadgeCheck size={16} />
            <span>Verified sellers</span>
          </div>
          <div>
            <MessageCircleMore size={16} />
            <span>Chat with shops</span>
          </div>
          <div>
            <Star size={16} />
            <span>Trusted by students</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="home-section">
        <CategoryGrid />
      </section>

      {/* Featured products */}
      <section className="home-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Top deals</p>
            <h2>Recommended for you</h2>
          </div>
          <Link to="/products" className="text-link-gold">
            Shop all
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="product-grid" aria-label="Loading products">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="product-skeleton">
                <span />
              </div>
            ))}
          </div>
        ) : catalogError ? (
          <div className="space-y-4">
            <ErrorAlert
              title="Catalog unavailable"
              message={catalogError}
              onRetry={() => window.location.reload()}
            />
            <div className="catalog-message">
              <Link to="/products">Browse the catalog</Link>
            </div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="catalog-message">
            <Sparkles size={22} aria-hidden="true" />
            <p>The collection is being curated</p>
            <span>New listings will appear as vendors publish them.</span>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      <VendorUpdatesFeed />

      {/* Trust / experience */}
      <section className="experience-section">
        <div className="experience-copy">
          <p className="eyebrow">Built on trust</p>
          <h2>
            Simple shopping.
            <br />
            Real connections.
          </h2>
          <p>
            Protected payments, verified sellers, and direct chat — so buying and selling on
            campus stays clear and confident.
          </p>
          <Link to="/register" className="text-link-gold">
            Start your journey
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="experience-grid">
          {features.map(({ Icon, title, copy, number }) => (
            <article key={title} className="experience-card">
              <span className="experience-number">{number}</span>
              <div className="experience-icon">
                <Icon size={18} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <p className="eyebrow">Your marketplace</p>
        <h2>Find something extraordinary</h2>
        <p>Thousands of useful finds. One effortless experience.</p>
        <Link to="/products" className="btn btn-gold">
          Start exploring
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default Home;
