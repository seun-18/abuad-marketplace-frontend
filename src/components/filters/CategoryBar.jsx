import { CAMPUS_CATEGORIES } from '../../config/campus';

const CategoryBar = ({ activeSlug = '', onSelect }) => {
  return (
    <div className="category-bar" role="tablist" aria-label="Product categories">
      {CAMPUS_CATEGORIES.map((cat) => {
        const isActive =
          cat.slug === activeSlug || (cat.slug === '' && !activeSlug);
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
