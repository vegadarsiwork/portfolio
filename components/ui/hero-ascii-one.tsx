'use client';
import { useEffect, useState } from 'react';
import PixelBlast from './PixelBlast';

type Props = {};

// NOTE: We do NOT hide attribution by default. Set NEXT_PUBLIC_HIDE_UNICORN=true only if you have license.

export default function HeroAsciiOne(_: Props) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // wrap name letters for keyboard accessibility
    const nameEl = document.getElementById('hero-name');
    if (nameEl && nameEl.dataset.wrapped !== '1') {
      const text = nameEl.textContent?.trim() ?? '';
      nameEl.innerHTML = text.split('').map(ch => {
        const safe = ch === ' ' ? '&nbsp;' : ch;
        return `<span tabindex="0" aria-label="${ch}">${safe}</span>`;
      }).join('');
      nameEl.dataset.wrapped = '1';
    }

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax logic:
  // 1. Normal parallax (0.5 speed) for the first 300px (delayed start)
  // 2. Accelerated exit (2.5 speed) after 300px to quickly clear the text just as About section arrives
  const parallaxOffset = scrollY > 300
    ? -150 - (scrollY - 300) * 2.5
    : -scrollY * 0.5;

  return (
    <main className="relative h-[130vh] bg-bg text-muted">
      {/* PixelBlast Interactive Background - Fixed to viewport, on top but allows clicks through */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="w-full h-full pointer-events-auto">
          <PixelBlast
            variant="circle"
            pixelSize={6}
            color="#00ffd5"
            patternScale={3}
            patternDensity={1.2}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            speed={0.6}
            edgeFade={0.25}
            transparent
          />
        </div>
      </div>

      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Content container with parallax */}
        <div
          className="container mx-auto px-4 relative z-20"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            transition: 'transform 0.05s ease-out'
          }}
        >
          <div className="max-w-4xl">
            {/* Badge with subtle backdrop */}
            <div className="inline-block relative">
              <div className="absolute -inset-2 bg-black/30 blur-md rounded-lg -z-10"></div>
              <div className="inline-block rounded px-3 py-1 bg-[#0f0f10] text-[#bfe] text-xs mb-4">frontend · design</div>
            </div>

            {/* Title with subtle dark halo */}
            <div className="relative">
              <div className="absolute -inset-3 bg-black/40 blur-lg -z-10"></div>
              <h1 className="font-monoHead text-6xl md:text-7xl leading-tight text-white relative">
                <span className="mr-2 text-lg block font-sans text-gray-300">ai + ui + web</span>
                <span className="inline-block">hey, i&apos;m&nbsp;
                  <span id="hero-name" className="text-6xl md:text-7xl font-monoHead">vega!</span>
                </span>
              </h1>
            </div>

            {/* Description with subtle backdrop */}
            <div className="relative mt-6">
              <div className="absolute -inset-2 bg-black/35 blur-md -z-10"></div>
              <p className="text-lg text-gray-300 max-w-2xl relative">
                i build things that feel simple and work fast — interfaces, prototypes, and small AI experiments.
              </p>
            </div>

            {/* Buttons with dark halos */}
            <div className="mt-6 flex gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-black/40 blur-md rounded-lg -z-10"></div>
                <a href="#projects" className="px-4 py-2 rounded-md bg-gradient-to-r from-accent-1 to-accent-2 text-black font-medium relative">view work</a>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-black blur-md rounded-lg -z-10"></div>
                <a href="#contact" className="px-4 py-2 rounded-md border border-white/10 bg-black text-sm text-gray-200 relative">contact</a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none opacity-50 z-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>
    </main>
  );
}
