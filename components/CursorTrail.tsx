'use client';

import { useEffect, useRef } from 'react';
import { PX } from '@/lib/pixel';

// How long a lit cell lasts, and the most cells the tail can hold however fast
// the mouse moves.
const LIFE = 260;
const MAX_CELLS = 12;

/**
 * Pixel trail behind the mouse: a short tail of lit grid cells that fades out
 * from its far end. Nothing is drawn (and no frame loop runs) while the pointer
 * is still.
 */
export default function CursorTrail({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!enabled || !canvas || !ctx) return;

    // The tail, oldest cell first.
    let tail: { x: number; y: number; born: number }[] = [];
    let w = 1;
    let h = 1;
    let last: { x: number; y: number; at: number } | null = null;
    let raf = 0;

    function resize() {
      w = Math.ceil(window.innerWidth / PX);
      h = Math.ceil(window.innerHeight / PX);
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = `${w * PX}px`;
      canvas!.style.height = `${h * PX}px`;
    }

    function frame(now: number) {
      tail = tail.filter((cell) => now - cell.born < LIFE);
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = getComputedStyle(canvas!).getPropertyValue('--color-v2-orange').trim() || '#ff8c42';
      for (const cell of tail) {
        ctx!.globalAlpha = (1 - (now - cell.born) / LIFE) * 0.85;
        ctx!.fillRect(cell.x, cell.y, 1, 1);
      }
      ctx!.globalAlpha = 1;
      raf = tail.length ? requestAnimationFrame(frame) : 0;
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      const x = Math.floor(e.clientX / PX);
      const y = Math.floor(e.clientY / PX);
      if (last && (last.x !== x || last.y !== y)) {
        // Walk the grid from the previous cell so fast moves leave no gaps, and
        // spread the cells' birth times across the move so the tail fades from
        // its far end rather than in one block.
        const steps = Math.max(Math.abs(x - last.x), Math.abs(y - last.y));
        const since = Math.min(now - last.at, 50);
        for (let i = 1; i <= steps; i++) {
          tail.push({
            x: Math.round(last.x + ((x - last.x) * i) / steps),
            y: Math.round(last.y + ((y - last.y) * i) / steps),
            born: now - since * (1 - i / steps),
          });
        }
        if (tail.length > MAX_CELLS) tail = tail.slice(-MAX_CELLS);
      }
      last = { x, y, at: now };
      if (!raf && tail.length) raf = requestAnimationFrame(frame);
    }

    const onLeave = () => {
      last = null;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[99] block"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
