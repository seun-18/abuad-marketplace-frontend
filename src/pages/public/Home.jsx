import {
  ArrowRight,
  BadgeCheck,
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import trustCommunityImage from '../../assets/abuad-trust-community.jpg';
import CategoryGrid from '../../components/CategoryGrid';
import ProductCard from '../../components/ProductCard';
import VendorUpdatesFeed from '../../components/VendorUpdatesFeed';
import { resolveImageUrl } from '../../utils/imageUrl';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const searchIdeas = ['iPhone 15 Pro', 'gaming laptops', 'Nike shoes', 'wireless headphones'];

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
          setCatalogError(response.data.message || 'The live catalog is temporarily unavailable.');
        }
      } catch (err) {
        console.error('Failed to fetch home products:', err);
        setCatalogError(getErrorMessage(err, 'The live catalog is temporarily unavailable. Please try again shortly.'));
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
        timer = window.setTimeout(type, 1500);
        return;
      }

      if (deleting && characterIndex === 0) {
        deleting = false;
        ideaIndex = (ideaIndex + 1) % searchIdeas.length;
      }

      timer = window.setTimeout(type, deleting ? 35 : 70);
    };

    timer = window.setTimeout(type, 450);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  const heroProducts = useMemo(() => featuredProducts.slice(0, 3), [featuredProducts]);

  const features = [
    {
      Icon: ShieldCheck,
      title: 'Protected payments',
      copy: 'Secure checkout and a trusted order trail from cart to delivery.',
      number: '01',
    },
    {
      Icon: BadgeCheck,
      title: 'Verified sellers',
      copy: 'Discover independent stores and trusted vendors around campus.',
      number: '02',
    },
    {
      Icon: MessageCircleMore,
      title: 'Direct connection',
      copy: 'Ask questions, confirm details, and buy with total confidence.',
      number: '03',
    },
  ];

  return (
    <div className="home-shell">
      <section className="jumia-hero">
        <div className="jumia-hero-grid">
          <div className="jumia-banner">
            <img
              className="jumia-banner-img"
              src={trustCommunityImage}
              alt="ABUAD Market Place campus shopping"
            />
            <div className="jumia-banner-overlay">
              <p className="jumia-banner-kicker">Campus deals</p>
              <h1>Shop everything on campus</h1>
              <p>Phones, fashion, books, essentials — from verified ABUAD sellers.</p>
              <form onSubmit={handleSearch} className="jumia-search" role="search">
                <Search size={18} aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={typedPlaceholder || 'Search products, brands and shops'}
                  aria-label="Search the marketplace"
                />
                <button type="submit">Search</button>
              </form>
              <div className="jumia-banner-actions">
                <Link to="/products" className="jumia-btn-primary">
                  Shop now
                </Link>
                <Link to="/register" className="jumia-btn-outline">
                  Sell on ABUAD
                </Link>
              </div>
            </div>
          </div>

          <div className="jumia-hero-side">
            <div className="jumia-promo-card">
              <img
                src={resolveImageUrl(
                  heroProducts[0]?.primary_image || heroProducts[0]?.image_url
                )}
                alt={heroProducts[0]?.name || 'Featured product'}
                onError={(e) => {
                  e.currentTarget.src = trustCommunityImage;
                }}
              />
              <div>
                <span>Top pick</span>
                <strong>{heroProducts[0]?.name || 'Featured today'}</strong>
                <p>
                  ₦
                  {Number(
                    heroProducts[0]?.base_price || heroProducts[0]?.price || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="jumia-promo-card">
              <img
                src={resolveImageUrl(
                  heroProducts[1]?.primary_image || heroProducts[1]?.image_url
                )}
                alt={heroProducts[1]?.name || 'New arrival'}
                onError={(e) => {
                  e.currentTarget.src = trustCommunityImage;
                }}
              />
              <div>
                <span>New</span>
                <strong>{heroProducts[1]?.name || 'New arrival'}</strong>
                <p>
                  ₦
                  {Number(
                    heroProducts[1]?.base_price || heroProducts[1]?.price || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="jumia-video-card">
              <img
                src={trustCommunityImage}
                alt="Students discovering products at ABUAD Market Place"
                loading="lazy"
              />
              <div className="jumia-video-label">
                <Zap size={14} />
                Live campus market
              </div>
            </div>
          </div>
        </div>

        <div className="jumia-trust-row">
          <div>
            <ShieldCheck size={18} />
            <span>Secure Paystack checkout</span>
          </div>
          <div>
            <BadgeCheck size={18} />
            <span>Verified campus sellers</span>
          </div>
          <div>
            <MessageCircleMore size={18} />
            <span>Chat with shops</span>
          </div>
          <div>
            <Star size={18} />
            <span>Trusted by students</span>
          </div>
        </div>
      </section>

      <section id="categories" className="home-section category-section">
        <div className="section-glow section-glow-gold" />
        <CategoryGrid />
      </section>

      <section className="home-section product-section">
        <div className="section-heading-row">
          <div>
            <p className="luxury-eyebrow">
              <span />
              Top deals
            </p>
            <h2>Recommended for you</h2>
          </div>
          <Link to="/products" className="text-link-gold">
            Shop all products
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="luxury-product-grid" aria-label="Loading products">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="luxury-skeleton">
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
            <Sparkles size={24} aria-hidden="true" />
            <p>The collection is being curated.</p>
            <span>New listings will appear as vendors publish them.</span>
          </div>
        ) : (
          <div className="luxury-product-grid">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      <VendorUpdatesFeed />

      <section className="experience-section">
        <div className="experience-copy">
          <p className="luxury-eyebrow">
            <span />
            Built on trust
          </p>
          <h2>
            Simple shopping.
            <br />
            Real connections.
          </h2>
          <p>
            Protected payments, verified sellers, and direct chat—so buying and selling on campus
            stays clear and confident.
          </p>
          <Link to="/register" className="text-link-gold">
            Start your journey
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div
          className="experience-grid"
          style={{ '--trust-background': `url(${trustCommunityImage})` }}
        >
          {features.map(({ Icon, title, copy, number }) => (
            <article key={title} className="experience-card">
              <span className="experience-number">{number}</span>
              <div className="experience-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-glow" />
        <p className="luxury-eyebrow">
          <span />
          Your marketplace, reimagined
        </p>
        <h2>Find something extraordinary.</h2>
        <p>Thousands of useful finds. One effortless experience.</p>
        <Link to="/products" className="button-gold">
          Start exploring
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default Home;
