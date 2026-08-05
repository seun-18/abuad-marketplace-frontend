import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
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
      <section className="hero-stage">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="hero-noise" />
        <div className="hero-grid" />

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-kicker-dot" aria-hidden="true" />
              ABUAD campus market
            </div>
            <h1>
              Campus finds,
              <span>quietly curated.</span>
            </h1>
            <p>
              Essentials, rare pieces, and trusted sellers—all in one calm marketplace built for
              life around ABUAD.
            </p>

            <form onSubmit={handleSearch} className="hero-search" role="search">
              <Search size={19} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={typedPlaceholder || 'Search the marketplace…'}
                aria-label="Search the marketplace"
              />
              <span className="search-ai">
                <Sparkles size={13} aria-hidden="true" />
                AI
              </span>
              <button type="submit" aria-label="Submit search">
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>

            <div className="hero-actions">
              <Link to="/products" className="button-gold">
                Explore the marketplace
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/register" className="button-ghost">
                Become a seller
              </Link>
            </div>

            <div className="hero-proof">
              <div className="proof-avatars" aria-hidden="true">
                <span>AO</span>
                <span>TM</span>
                <span>KI</span>
              </div>
              <div>
                <div className="proof-stars">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} size={12} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p>Trusted by campus shoppers</p>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Featured marketplace products">
            <div className="visual-halo" />
            <div className="visual-ring visual-ring-one" />
            <div className="visual-ring visual-ring-two" />
            <div className="floating-chip chip-top">
              <Zap size={14} fill="currentColor" aria-hidden="true" />
              Trending now
            </div>
            <div className="floating-chip chip-bottom">
              <span className="live-dot" />
              2.4k shoppers online
            </div>

            <div className="hero-product hero-product-main">
              <span className="hero-product-label">Editor&apos;s pick</span>
              <div className="hero-product-image">
                <img
                  src={resolveImageUrl(
                    heroProducts[0]?.primary_image || heroProducts[0]?.image_url
                  )}
                  alt={heroProducts[0]?.name || 'Featured marketplace product'}
                />
              </div>
              <div className="hero-product-info">
                <div>
                  <p>{heroProducts[0]?.brand || 'Featured today'}</p>
                  <h2>{heroProducts[0]?.name || 'Your next favorite find'}</h2>
                </div>
                <span>
                  ₦
                  {Number(
                    heroProducts[0]?.base_price || heroProducts[0]?.price || 24900
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="hero-product hero-product-side side-left">
              <div className="hero-product-image">
                <img
                  src={resolveImageUrl(
                    heroProducts[1]?.primary_image || heroProducts[1]?.image_url
                  )}
                  alt={heroProducts[1]?.name || 'New marketplace arrival'}
                />
              </div>
              <p>{heroProducts[1]?.name || 'New arrival'}</p>
            </div>

            <div className="hero-product hero-product-side side-right">
              <div className="hero-product-image">
                <img
                  src={resolveImageUrl(
                    heroProducts[2]?.primary_image || heroProducts[2]?.image_url
                  )}
                  alt={heroProducts[2]?.name || 'Popular marketplace product'}
                />
              </div>
              <p>{heroProducts[2]?.name || 'Campus favorite'}</p>
            </div>
          </div>
        </div>

        <a className="scroll-cue" href="#categories" aria-label="Scroll to categories">
          <span>Discover more</span>
          <ChevronDown size={16} aria-hidden="true" />
        </a>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((group) => (
            <div className="marquee-group" key={group}>
              <span>Verified sellers</span>
              <Sparkles size={14} />
              <span>Curated finds</span>
              <Sparkles size={14} />
              <span>Secure checkout</span>
              <Sparkles size={14} />
              <span>Delivered around you</span>
              <Sparkles size={14} />
            </div>
          ))}
        </div>
      </div>

      <section id="categories" className="home-section category-section">
        <div className="section-glow section-glow-gold" />
        <CategoryGrid />
      </section>

      <section className="home-section product-section">
        <div className="section-heading-row">
          <div>
            <p className="luxury-eyebrow">
              <span />
              Fresh picks
            </p>
            <h2>Selected for campus life.</h2>
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
