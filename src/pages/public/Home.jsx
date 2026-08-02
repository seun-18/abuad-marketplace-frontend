import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import trustCommunityImage from '../../assets/abuad-trust-community.jpg';
import CategoryGrid from '../../components/CategoryGrid';
import ProductCard from '../../components/ProductCard';
import VendorUpdatesFeed from '../../components/VendorUpdatesFeed';
import GlassPanel from '../../components/cinematic/GlassPanel';
import ParticleField from '../../components/cinematic/ParticleField';
import ScrollScene from '../../components/cinematic/ScrollScene';
import { resolveImageUrl } from '../../utils/imageUrl';

const searchIdeas = ['iPhone 15 Pro', 'gaming laptops', 'Nike shoes', 'wireless headphones'];

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const lightRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [search, setSearch] = useState('');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [scrollY, setScrollY] = useState(0);

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
        setCatalogError('The live catalog is temporarily unavailable. Please try again shortly.');
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

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', x.toFixed(4));
      el.style.setProperty('--my', y.toFixed(4));
      if (lightRef.current) {
        lightRef.current.style.transform = `translate(${(x - 0.5) * 40}px, ${(y - 0.5) * 28}px)`;
      }
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  const heroProducts = useMemo(() => featuredProducts.slice(0, 3), [featuredProducts]);
  const parallax = Math.min(scrollY * 0.18, 120);

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

  const storyScenes = [
    {
      kicker: 'Scene 01',
      title: 'Floating glass architecture',
      copy: 'The marketplace opens as a living space—structures of light and depth, not a flat page.',
    },
    {
      kicker: 'Scene 02',
      title: 'Products emerge from darkness',
      copy: 'Curated finds surface with cinematic timing. Nothing appears; everything arrives.',
    },
    {
      kicker: 'Scene 03',
      title: 'Campus comes alive',
      copy: 'Hotspots pulse. Vendors glow. Live activity threads through the experience.',
    },
  ];

  return (
    <div className="home-shell cinematic-home">
      {/* ─── SCENE 1: CINEMATIC ARRIVAL ─── */}
      <section className="cinematic-hero" ref={heroRef}>
        <ParticleField density={90} />
        <div className="cinematic-fog" aria-hidden="true" />
        <div className="cinematic-grid" aria-hidden="true" />
        <div className="cinematic-light-orb" ref={lightRef} aria-hidden="true" />
        <div className="cinematic-vignette" aria-hidden="true" />

        {/* Floating architecture planes */}
        <div className="arch-stage" style={{ transform: `translateY(${parallax * 0.35}px)` }} aria-hidden="true">
          <div className="arch-plane arch-plane-a" />
          <div className="arch-plane arch-plane-b" />
          <div className="arch-plane arch-plane-c" />
          <div className="arch-ring arch-ring-outer" />
          <div className="arch-ring arch-ring-inner" />
        </div>

        <div className="cinematic-hero-inner" style={{ transform: `translateY(${parallax * 0.15}px)` }}>
          <div className="cinematic-copy">
            <p className="cinematic-kicker">
              <span className="kicker-pulse" />
              ABUAD · Cinematic marketplace
            </p>
            <h1 className="cinematic-title">
              <span className="title-line">Everything campus.</span>
              <span className="title-accent">One trusted market.</span>
            </h1>
            <p className="cinematic-lead">
              From everyday essentials to the products you have been waiting for—discover it all
              from people right around you. A premium experience, not another shopping site.
            </p>

            <GlassPanel className="cinematic-search-shell" as="form" onSubmit={handleSearch} intensity={0.6}>
              <Search size={18} aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={typedPlaceholder || 'Search the marketplace…'}
                aria-label="Search the marketplace"
              />
              <span className="search-ai-badge">
                <Sparkles size={12} aria-hidden="true" />
                AI
              </span>
              <button type="submit" className="search-submit" aria-label="Submit search">
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </GlassPanel>

            <div className="cinematic-actions">
              <Link to="/products" className="btn-cinematic-primary">
                Explore the marketplace
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/register" className="btn-cinematic-ghost">
                Become a seller
              </Link>
            </div>

            <div className="cinematic-proof">
              <div className="proof-avatars" aria-hidden="true">
                <span>AO</span>
                <span>TM</span>
                <span>KI</span>
              </div>
              <div>
                <div className="proof-stars">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} size={11} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p>Trusted by campus shoppers</p>
              </div>
            </div>
          </div>

          <div className="cinematic-stage" aria-label="Featured marketplace products">
            <div className="stage-halo" />
            <GlassPanel className="float-chip chip-trending" intensity={0.4}>
              <Zap size={13} fill="currentColor" aria-hidden="true" />
              Trending now
            </GlassPanel>
            <GlassPanel className="float-chip chip-live" intensity={0.4}>
              <span className="live-dot" />
              Live campus market
            </GlassPanel>

            <GlassPanel className="hero-product-card hero-main" intensity={1.1}>
              <span className="hero-product-label">Editor&apos;s pick</span>
              <div className="hero-product-media">
                <img
                  src={resolveImageUrl(heroProducts[0]?.primary_image || heroProducts[0]?.image_url)}
                  alt={heroProducts[0]?.name || 'Featured marketplace product'}
                />
              </div>
              <div className="hero-product-meta">
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
            </GlassPanel>

            <GlassPanel className="hero-product-card hero-side side-a" intensity={0.8}>
              <div className="hero-product-media">
                <img
                  src={resolveImageUrl(heroProducts[1]?.primary_image || heroProducts[1]?.image_url)}
                  alt={heroProducts[1]?.name || 'New marketplace arrival'}
                />
              </div>
              <p>{heroProducts[1]?.name || 'New arrival'}</p>
            </GlassPanel>

            <GlassPanel className="hero-product-card hero-side side-b" intensity={0.8}>
              <div className="hero-product-media">
                <img
                  src={resolveImageUrl(heroProducts[2]?.primary_image || heroProducts[2]?.image_url)}
                  alt={heroProducts[2]?.name || 'Popular marketplace product'}
                />
              </div>
              <p>{heroProducts[2]?.name || 'Campus favorite'}</p>
            </GlassPanel>
          </div>
        </div>

        <a className="scroll-cue cinematic-scroll-cue" href="#story" aria-label="Scroll into the experience">
          <span>Enter the experience</span>
          <ChevronDown size={15} aria-hidden="true" />
        </a>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="cinematic-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((group) => (
            <div className="marquee-group" key={group}>
              <span>Verified sellers</span>
              <Sparkles size={13} />
              <span>Curated finds</span>
              <Sparkles size={13} />
              <span>Secure checkout</span>
              <Sparkles size={13} />
              <span>Delivered around you</span>
              <Sparkles size={13} />
              <span>Glass interface</span>
              <Sparkles size={13} />
            </div>
          ))}
        </div>
      </div>

      {/* ─── STORYTELLING SCROLL ─── */}
      <ScrollScene id="story" className="story-reel">
        <div className="story-reel-inner">
          {storyScenes.map((scene, i) => (
            <GlassPanel key={scene.kicker} className="story-card" intensity={0.7}>
              <span className="story-index">{String(i + 1).padStart(2, '0')}</span>
              <p className="story-kicker">{scene.kicker}</p>
              <h3>{scene.title}</h3>
              <p>{scene.copy}</p>
            </GlassPanel>
          ))}
        </div>
      </ScrollScene>

      {/* ─── CATEGORIES ─── */}
      <ScrollScene id="categories" className="home-section category-section cinematic-section">
        <div className="section-glow section-glow-gold" />
        <CategoryGrid />
      </ScrollScene>

      {/* ─── PRODUCTS EMERGE ─── */}
      <ScrollScene className="home-section product-section cinematic-section">
        <div className="section-heading-row">
          <div>
            <p className="luxury-eyebrow">
              <span />
              Freshly curated
            </p>
            <h2>Picked for the way you live.</h2>
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
          <div className="catalog-message">
            <Sparkles size={24} aria-hidden="true" />
            <p>More beautiful finds are on the way.</p>
            <span>{catalogError}</span>
            <Link to="/products">Browse the catalog</Link>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="catalog-message">
            <Sparkles size={24} aria-hidden="true" />
            <p>The collection is being curated.</p>
            <span>New listings will appear as vendors publish them.</span>
          </div>
        ) : (
          <div className="luxury-product-grid cinematic-product-grid">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}
      </ScrollScene>

      <VendorUpdatesFeed />

      {/* ─── TRUST / EXPERIENCE ─── */}
      <ScrollScene className="experience-section cinematic-section">
        <div className="experience-copy">
          <p className="luxury-eyebrow">
            <span />
            Designed around trust
          </p>
          <h2>
            Beautiful shopping.
            <br />
            Built for real life.
          </h2>
          <p>
            A refined marketplace experience with the practical details handled—from protected
            payments to direct conversations with sellers.
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
            <GlassPanel key={title} className="experience-card cinematic-exp-card" as="article" intensity={0.9}>
              <span className="experience-number">{number}</span>
              <div className="experience-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </GlassPanel>
          ))}
        </div>
      </ScrollScene>

      {/* ─── VENDOR ECOSYSTEM TEASER ─── */}
      <ScrollScene className="ecosystem-section">
        <GlassPanel className="ecosystem-panel" intensity={0.5}>
          <div className="ecosystem-icon">
            <Store size={22} />
          </div>
          <div>
            <p className="luxury-eyebrow">
              <span />
              Vendor ecosystem
            </p>
            <h2>Every store is a brand space.</h2>
            <p>
              Verified sellers, live updates, reputation, and campus fulfilment—presented as a
              premium brand experience, not a listing table.
            </p>
          </div>
          <Link to="/register" className="btn-cinematic-primary">
            Open your store
            <ArrowRight size={16} />
          </Link>
        </GlassPanel>
      </ScrollScene>

      {/* ─── CLOSING CTA ─── */}
      <ScrollScene className="closing-cta cinematic-closing">
        <div className="closing-glow" />
        <p className="luxury-eyebrow">
          <span />
          Your marketplace, reimagined
        </p>
        <h2>Find something extraordinary.</h2>
        <p>Thousands of useful finds. One effortless experience.</p>
        <Link to="/products" className="btn-cinematic-primary">
          Start exploring
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </ScrollScene>
    </div>
  );
};

export default Home;
