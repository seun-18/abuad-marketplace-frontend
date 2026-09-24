import {
  ArrowRight,
  BadgeCheck,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import trustCommunityImage from '../../assets/campus-hero.jpg';
import ProductCard from '../../components/ProductCard';
import CategoryBar from '../../components/filters/CategoryBar';
import EscrowBanner from '../../components/trust/EscrowBanner';
import ChatPreview from '../../components/trust/ChatPreview';
import VendorUpdatesFeed from '../../components/VendorUpdatesFeed';
import { getErrorMessage } from '../../utils/errors';
import ErrorAlert from '../../components/ErrorAlert';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

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

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
    navigate(slug ? `/products?category=${encodeURIComponent(slug)}` : '/products');
  };

  const features = [
    {
      Icon: ShieldCheck,
      title: 'Secure escrow',
      copy: 'Pay safely. Release funds only when you are satisfied with the item.',
    },
    {
      Icon: BadgeCheck,
      title: 'Verified students',
      copy: 'Buy and sell with verified ABUAD students around campus.',
    },
    {
      Icon: MessageCircleMore,
      title: 'Chat & meet',
      copy: 'Message sellers and meet at Salami Hall, Motion Ground, or Main Gate.',
    },
  ];

  return (
    <div className="home-shell">
      {/* Compact hero */}
      <section className="campus-hero">
        <div className="campus-hero-banner">
          <img src={trustCommunityImage} alt="ABUAD campus marketplace" />
          <div className="campus-hero-content">
            <h1>Shop campus-to-campus</h1>
            <p>
              Textbooks, gadgets, fashion & more — from verified ABUAD students near you.
            </p>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <CategoryBar activeSlug={activeCategory} onSelect={handleCategorySelect} />

      {/* Escrow trust banner */}
      <EscrowBanner />

      {/* Featured products */}
      <div className="section-heading-row" style={{ marginTop: '0.5rem' }}>
        <div>
          <p className="eyebrow">Near you</p>
          <h2>Recommended</h2>
        </div>
        <Link to="/products" className="text-link">
          See all
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
        <div style={{ padding: '0 0.75rem' }}>
          <ErrorAlert
            title="Catalog unavailable"
            message={catalogError}
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : featuredProducts.length === 0 ? (
        <div className="product-grid">
          <div className="catalog-message">
            <div className="empty-icon">
              <Sparkles size={28} aria-hidden="true" />
            </div>
            <p>No listings yet</p>
            <span>New campus finds will appear as students publish them.</span>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}

      {/* Chat preview snippet */}
      <ChatPreview />

      <VendorUpdatesFeed />

      {/* Trust pillars */}
      <div className="section-heading-row" style={{ marginTop: '1.5rem' }}>
        <div>
          <p className="eyebrow">Why ABUAD Market</p>
          <h2>Built for campus</h2>
        </div>
      </div>
      <div className="experience-grid">
        {features.map(({ Icon, title, copy }) => (
          <article key={title} className="experience-card">
            <div className="experience-icon">
              <Icon size={18} aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>

      {/* CTA */}
      <section className="closing-cta">
        <p className="eyebrow" style={{ color: '#6ee7b7', justifyContent: 'center' }}>
          Start selling
        </p>
        <h2>List an item in minutes</h2>
        <p>Reach thousands of students across ABUAD hostels and faculties.</p>
        <Link to="/register" className="btn btn-primary" style={{ background: '#fff', color: '#064e3b' }}>
          Open a campus store
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default Home;
