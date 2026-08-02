import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-linked scene wrapper — fades / translates as it enters viewport.
 */
const ScrollScene = ({ children, className = '', id, threshold = 0.18 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <section
      id={id}
      ref={ref}
      className={`scroll-scene ${visible ? 'scroll-scene-visible' : ''} ${className}`}
    >
      {children}
    </section>
  );
};

export default ScrollScene;
