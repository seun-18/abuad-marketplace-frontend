import { useEffect, useState } from 'react';
import api from '../../api/axios';

const CategoryBar = ({ activeSlug = '', onSelect }) => {
  const [categories, setCategories] = useState([{ id: 'all', name: 'All', slug: '' }]);

  useEffect(() => {
    let mounted = true;
    api
      .get('/categories/index.php')
      .then((response) => {
        if (!mounted || !response.data.success) return;
        const createdCategories = (response.data.data || []).flatMap((category) => [
          category,
          ...(category.subcategories || []),
        ]);
        if (createdCategories.length) {
          setCategories([{ id: 'all', name: 'All', slug: '' }, ...createdCategories]);
        }
      })
      .catch(() => {})
      .finally(() => {
        mounted = false;
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="category-bar" role="tablist" aria-label="Product categories">
      {categories.map((cat) => {
        const isActive = cat.slug === activeSlug || (cat.slug === '' && !activeSlug);
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`category-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelect?.(cat.slug)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryBar;
