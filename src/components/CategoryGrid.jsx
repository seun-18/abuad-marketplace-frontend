import { ArrowRight, BookOpen, Gamepad2, Headphones, Home, Laptop, Shirt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import booksImage from '../assets/campus-books.jpg';
import gadgetsImage from '../assets/campus-gadgets.jpg';
import marketImage from '../assets/campus-market-fallback.jpg';
import studentsImage from '../assets/campus-students.jpg';
import { resolveImageUrl } from '../utils/imageUrl';

const fallbackCategories = [
  { id: 'e', name: 'Electronics', slug: 'electronics', icon: Laptop },
  { id: 'f', name: 'Fashion', slug: 'fashion', icon: Shirt },
  { id: 'b', name: 'Books', slug: 'books', icon: BookOpen },
  { id: 'a', name: 'Audio', slug: 'audio', icon: Headphones },
  { id: 'h', name: 'Home', slug: 'home', icon: Home },
  { id: 'g', name: 'Gaming', slug: 'gaming', icon: Gamepad2 },
];

const iconMap = [Laptop, Shirt, BookOpen, Headphones, Home, Gamepad2];
const fallbackImages = [gadgetsImage, booksImage, marketImage, studentsImage];

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/index.php');
        if (response.data.success && response.data.data?.length) {
          setCategories(response.data.data);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const list =
    !loading && categories.length > 0
      ? categories.slice(0, 8).map((cat, i) => ({
          ...cat,
          Icon: iconMap[i % iconMap.length],
          image: cat.category_image || cat.image_url || fallbackImages[i % fallbackImages.length],
        }))
      : fallbackCategories.map((c, i) => ({
          ...c,
          Icon: c.icon,
          image: fallbackImages[i % fallbackImages.length],
        }));

  return (
    <div className="category-grid-wrap">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Browse by category</p>
          <h2>What campus is shopping</h2>
        </div>
        <Link to="/products" className="text-link-gold">
          See all
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="category-scroll" role="list">
        {list.map((cat) => {
          const Icon = cat.Icon;
          return (
            <Link
              key={cat.id || cat.slug}
              to={`/products?category=${cat.slug}`}
              className="category-chip"
              role="listitem"
            >
              <span className="category-chip-image" aria-hidden="true">
                <img
                  src={
                    cat.image.startsWith('/') || cat.image.startsWith('http')
                      ? resolveImageUrl(cat.image)
                      : cat.image
                  }
                  alt=""
                />
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
