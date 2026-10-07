'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A pixel-art CRT screen for a project to play on: a chunky bezel with hard
 * highlight and shadow edges, stepped corners, scanlines on the 4px grid and a
 * pixel glare. The picture switches on (a line that opens into the full
 * screen) the first time it scrolls into view.
 */
export default function CrtTv({ children }: { children: ReactNode; tint?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setOn(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="crt-tv">
      <div className="crt-case">
        <div className="crt-bezel">
          <div className="crt-screen">
            <div className={`crt-picture ${on ? 'crt-picture-on' : ''}`}>{children}</div>
            <span aria-hidden className="crt-scanlines" />
            <span aria-hidden className="crt-glare" />
          </div>
        </div>
      </div>
    </div>
  );
}
