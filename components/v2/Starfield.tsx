'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-viewport pixel starfield. Always visible — even during daytime —
 * so the cosmic atmosphere persists as you scroll.
 */
export default function Starfield({
  density = 0.00035,
  className = '',
}: {
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let stars: { x: number; y: number; b: number; tw: number }[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const count = Math.floor(w * h * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.round((Math.random() * w) / 2) * 2,
        y: Math.round((Math.random() * h) / 2) * 2,
        b: Math.random(),
        tw: Math.random() * Math.PI * 2,
      }));
      draw();
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() / 1000;
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.8 + s.tw);
        const alpha = (0.2 + s.b * 0.7) * tw;
        if (alpha < 0.02) continue;
        const hue = s.b > 0.85 ? '255, 200, 140' : s.b > 0.6 ? '180, 170, 220' : '200, 210, 255';
        ctx.fillStyle = `rgba(${hue}, ${alpha.toFixed(3)})`;
        const size = s.b > 0.92 ? 2 : 1;
        ctx.fillRect(s.x, s.y, size, size);
      }
    }

    let last = 0;
    function loop(now: number) {
      if (now - last > 66) {
        last = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    resize();
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
    />
  );
}
