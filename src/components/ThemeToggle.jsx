import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '', size = 18 }) => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`theme-toggle ${className}`.trim()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      data-theme-active={theme}
    >
      {isDark ? (
        <Sun size={size} strokeWidth={1.9} aria-hidden="true" />
      ) : (
        <Moon size={size} strokeWidth={1.9} aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
