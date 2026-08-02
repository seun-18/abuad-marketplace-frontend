import { useEffect, useRef } from 'react';

/**
 * GPU-friendly particle atmosphere — reacts to mouse + scroll time.
 */
const ParticleField = ({ density = 80, className = '' }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0;
    let h = 0;
    let dpr = 1;

    const particles = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.0002,
      size: Math.random() * 1.8 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width;
      mouse.current.y = (e.clientY - rect.top) / rect.height;
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const p of particles) {
        p.x += p.vx + (mx - 0.5) * 0.00008 * p.z;
        p.y += p.vy + (my - 0.5) * 0.00006 * p.z;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;

        const px = p.x * w;
        const py = p.y * h;
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.0012 + p.phase);
        const r = p.size * p.z * (1 + pulse * 0.35);
        const alpha = 0.12 + p.z * 0.35 * pulse;

        const g = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
        g.addColorStop(0, `rgba(255, 183, 3, ${alpha})`);
        g.addColorStop(0.35, `rgba(200, 170, 90, ${alpha * 0.35})`);
        g.addColorStop(1, 'rgba(255,183,3,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`cinematic-particles ${className}`}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
