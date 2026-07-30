import { ArrowUpRight, BookOpen, Gamepad2, Headphones, Home, Laptop, Shirt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { resolveImageUrl } from '../utils/imageUrl';

const categoryIcons = [Laptop, Shirt, BookOpen, Headphones, Home, Gamepad2];

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/index.php');
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section>
      <div className="section-heading-row">
        <div>
          <p className="luxury-eyebrow">
            <span />
            Popular across ABUAD
          </p>
          <h2>What campus is shopping now.</h2>
        </div>
        <Link to="/products" className="text-link-gold">
          View all categories
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="category-luxury-grid" aria-label="Loading categories">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="category-skeleton" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="catalog-message">
          <p>Collections are being curated.</p>
          <span>Categories will appear when the catalog is ready.</span>
        </div>
      ) : (
        <div className="category-luxury-grid">
          {categories.slice(0, 6).map((cat, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="category-luxury-card"
              >
                <img
                  className="category-card-image"
                  src={resolveImageUrl(cat.category_image)}
                  alt=""
                  loading="lazy"
                />
                <span className="category-card-overlay" />
                <span className="category-index">0{index + 1}</span>
                <div className="category-icon-wrap">
                  <Icon size={31} strokeWidth={1.25} aria-hidden="true" />
                </div>
                <div>
                  <h3>{cat.name}</h3>
                  <p>
                    {Number(cat.product_count) > 0
                      ? `${Number(cat.product_count).toLocaleString()} campus finds`
                      : cat.description || 'Discover the collection'}
                  </p>
                </div>
                <span className="category-arrow">
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
