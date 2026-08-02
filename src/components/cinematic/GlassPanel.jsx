import { useRef } from 'react';

/**
 * Hyperreal glass panel — mouse-reactive highlight + edge refraction feel.
 */
const GlassPanel = ({ children, className = '', as: Tag = 'div', intensity = 1, ...rest }) => {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--gx', `${x}%`);
    el.style.setProperty('--gy', `${y}%`);
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -6 * intensity;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 8 * intensity;
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Tag
      ref={ref}
      className={`hyper-glass ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      <span className="hyper-glass-shine" aria-hidden="true" />
      <span className="hyper-glass-edge" aria-hidden="true" />
      <div className="hyper-glass-body">{children}</div>
    </Tag>
  );
};

export default GlassPanel;
