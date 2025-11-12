'use client';
import { useEffect } from 'react';
import PixelBlast from './PixelBlast';

type Props = {};

// NOTE: We do NOT hide attribution by default. Set NEXT_PUBLIC_HIDE_UNICORN=true only if you have license.

export default function HeroAsciiOne(_: Props) {
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
  }, []);

  return (
    <main className="sticky top-0 h-screen overflow-hidden bg-bg text-muted flex items-center">
      {/* PixelBlast Interactive Background - Extended to cover any gaps */}
      <div className="absolute -left-4 -right-4 -bottom-4" style={{ top: '0px' }}>
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

      {/* Content container - click-through except for buttons */}
      <div className="container mx-auto px-4 relative z-10 pointer-events-none">
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
          <div className="mt-6 flex gap-3 pointer-events-auto">
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
    </main>
  );
}
