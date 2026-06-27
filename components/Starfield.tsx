'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-viewport pixel starfield. Always visible so the cosmic atmosphere
 * persists as you scroll.
 */
export default function Starfield({
  density = 0.00035,
  tickRate = 1,
  className = '',
}: {
  density?: number;
  tickRate?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let stars: { x: number; y: number; b: number; tw: number; depth: number }[] = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !ctx) return;
      // Recompute DPR in case the window moved to a different-density monitor.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const count = Math.floor(w * h * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.round((Math.random() * w) / 2) * 2,
        y: Math.round((Math.random() * h) / 2) * 2,
        b: Math.random(),
        tw: Math.random() * Math.PI * 2,
        depth: 0.35 + Math.random() * 0.65,
      }));
      draw();
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const t = performance.now() / 1000;
      // Uniform directional flow — every star drifts the SAME way (a gentle
      // up-right diagonal) instead of swirling. Depth only scales the speed a
      // little for parallax, and scroll adds to the flow. Positions wrap so the
      // field always stays full.
      const flow = t * 5 * tickRate;
      const scrollDrift = (typeof window !== 'undefined' ? window.scrollY : 0) * 0.08;

      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.8 + s.tw);
        const alpha = (0.2 + s.b * 0.7) * twinkle;
        if (alpha < 0.02) continue;

        const hue =
          s.b > 0.85 ? '255, 200, 140' : s.b > 0.6 ? '180, 170, 220' : '200, 210, 255';
        ctx.fillStyle = `rgba(${hue}, ${alpha.toFixed(3)})`;

        const size = s.b > 0.92 ? 2 : 1;
        const speed = 0.6 + s.depth * 0.4; // nearer stars drift a touch faster
        let x = s.x + flow * 0.5 * speed; // drift right
        let y = s.y - (flow + scrollDrift) * speed; // drift up
        x = ((x % w) + w) % w;
        y = ((y % h) + h) % h;
        ctx.fillRect(Math.round(x), Math.round(y), size, size);
      }
    }

    // 60fps cap — rotation/twinkle are real-time based, 60 is smooth enough.
    let last = 0;
    function loop(now: number) {
      if (now - last >= 1000 / 60) {
        last = now;
        draw();
      }
      raf = window.requestAnimationFrame(loop);
    }

    resize();
    raf = window.requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density, tickRate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
    />
  );
}
