import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Compact theme switch used in navbar + dashboard header.
 */
const ThemeToggle = ({ className = '', size = 18 }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`.trim()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={size} strokeWidth={1.9} aria-hidden="true" /> : <Moon size={size} strokeWidth={1.9} aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
