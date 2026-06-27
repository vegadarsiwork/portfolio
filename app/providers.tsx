'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { emitLenisScroll, setLenisInstance } from '@/lib/lenis-store';
import { markRevealed } from '@/lib/reveal-store';

// Client-only shell: Lenis smooth scroll + initial preloader. Split out of the
// root layout so the layout can stay a server component and export metadata.
export default function Providers({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  // Lock page scroll while the preloader is up (the layout body is server-
  // rendered, so toggle the class imperatively here).
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', !isLoaded);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isLoaded]);

  // Lenis smooth scroll — initialised AFTER the preloader finishes so the
  // body's overflow-hidden state doesn't interfere with Lenis attaching.
  useEffect(() => {
    if (!isLoaded) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Broadcast the smoothed scroll value so scroll-reactive layers (parallax)
    // stay in lockstep with the content instead of sampling window.scrollY.
    lenis.on('scroll', () => emitLenisScroll(lenis.scroll));
    // Expose the instance so e.g. the back-to-top button can scroll smoothly.
    setLenisInstance(lenis);

    let raf = 0;
    function frame(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, [isLoaded]);

  useEffect(() => {
    // Only show the preloader on the first visit of a session. On later reloads
    // / in-session navigations, skip straight to the content (the page is
    // already warm in cache — no reason to make the user wait again).
    if (typeof window !== 'undefined' && sessionStorage.getItem('vega:preloaded') === '1') {
      const id = window.setTimeout(() => {
        setIsLoaded(true);
        setShowPreloader(false);
        markRevealed();
      }, 0);
      return () => window.clearTimeout(id);
    }

    let hasFinished = false;
    let revealTimeout: ReturnType<typeof setTimeout> | null = null;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let failSafeTimeout: ReturnType<typeof setTimeout> | null = null;

    const finishLoading = () => {
      if (hasFinished) {
        return;
      }

      hasFinished = true;
      try {
        sessionStorage.setItem('vega:preloaded', '1');
      } catch {
        // sessionStorage unavailable (private mode etc.) — preloader just runs
        // every load, which is fine.
      }
      setIsLoaded(true);
      // Signal entrance animations (e.g. the skyline fade) to play as the
      // preloader begins fading out.
      markRevealed();
      hideTimeout = setTimeout(() => setShowPreloader(false), 360);
    };

    const onReady = () => {
      // Keep the preload state briefly to avoid a flash on fast connections.
      revealTimeout = setTimeout(finishLoading, 260);
    };

    const onReadyStateChange = () => {
      if (document.readyState === 'complete') {
        onReady();
      }
    };

    if (document.readyState === 'complete') {
      onReady();
    } else {
      window.addEventListener('load', onReady, { once: true });
      document.addEventListener('readystatechange', onReadyStateChange);
    }

    // Fail-safe so scroll is never trapped if load lifecycle behaves unexpectedly.
    failSafeTimeout = setTimeout(finishLoading, 2200);

    return () => {
      window.removeEventListener('load', onReady);
      document.removeEventListener('readystatechange', onReadyStateChange);
      if (revealTimeout) {
        clearTimeout(revealTimeout);
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      if (failSafeTimeout) {
        clearTimeout(failSafeTimeout);
      }
    };
  }, []);

  return (
    <>
      {showPreloader && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300 ${isLoaded ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
              aria-hidden="true"
            />
            <p className="font-monoHead text-[11px] uppercase tracking-[0.16em] text-white/65">loading</p>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
