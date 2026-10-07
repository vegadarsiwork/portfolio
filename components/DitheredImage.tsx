'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BAYER4, PX } from '@/lib/pixel';

// Colour levels per channel after dithering (4 levels -> a 64-colour palette).
const LEVELS = 4;

/**
 * A project screenshot shown through an ordered-dither filter so it sits in the
 * pixel world. Hover, focus or tap clears the filter to the real image.
 */
export default function DitheredImage({
  src,
  alt,
  onError,
}: {
  src: string;
  alt: string;
  onError: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [clear, setClear] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!wrap || !canvas || !ctx) return;

    const img = new window.Image();
    let cancelled = false;

    function render() {
      if (cancelled || !img.naturalWidth) return;
      const scale = Math.max(2, Math.min(PX, Math.floor(wrap!.clientWidth / 160)));
      const w = Math.max(1, Math.ceil(wrap!.clientWidth / scale));
      const h = Math.max(1, Math.ceil(wrap!.clientHeight / scale));
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = `${w * scale}px`;
      canvas!.style.height = `${h * scale}px`;

      // object-cover fit, then quantise each channel against the Bayer matrix.
      const fit = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * fit;
      const dh = img.naturalHeight * fit;
      ctx!.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const data = ctx!.getImageData(0, 0, w, h);
      const px = data.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const threshold = (BAYER4[y % 4][x % 4] + 0.5) / 16;
          const i = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const v = (px[i + c] / 255) * (LEVELS - 1);
            const level = Math.floor(v) + (v - Math.floor(v) > threshold ? 1 : 0);
            px[i + c] = (level / (LEVELS - 1)) * 255;
          }
        }
      }
      ctx!.putImageData(data, 0, 0);
      setReady(true);
    }

    img.onload = render;
    img.src = src;
    const resize = new ResizeObserver(render);
    resize.observe(wrap);
    return () => {
      cancelled = true;
      resize.disconnect();
    };
  }, [src]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onClick={() => setClear((v) => !v)}
      className="group absolute inset-0 overflow-hidden outline-none"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 800px"
        onError={onError}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`px-step absolute left-0 top-0 block max-w-none group-hover:opacity-0 group-focus-visible:opacity-0 ${
          ready && !clear ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
