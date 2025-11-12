'use client';
import { useEffect } from 'react';
import DotGridBackground from './DotGridBackground';

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
      {/* Animated Dot Grid Background */}
      <DotGridBackground />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-block rounded px-3 py-1 bg-[#0f0f10] text-[#bfe] text-xs mb-4">frontend · design</div>
          <h1 className="font-monoHead text-6xl md:text-7xl leading-tight text-white">
            <span className="mr-2 text-lg block font-sans text-gray-300">ai + ui + web</span>
            <span className="inline-block">hey, i&apos;m&nbsp;
              <span id="hero-name" className="text-6xl md:text-7xl font-monoHead">vega</span>
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-300 max-w-2xl">
            i build things that feel simple and work fast — interfaces, prototypes, and small AI experiments.
          </p>

          <div className="mt-6 flex gap-3">
            <a href="#projects" className="px-4 py-2 rounded-md bg-gradient-to-r from-accent-1 to-accent-2 text-black font-medium">view work</a>
            <a href="#contact" className="px-4 py-2 rounded-md border border-white/10 text-sm text-gray-200">contact</a>
          </div>

          <pre className="mt-8 font-monoHead text-[10px] text-white/90 select-none" aria-hidden="true">
  .:;:..        .:;;:.        .:;;:.
 ::::::.      ::::::::.     :::::::.
 `::::::'    `::::::::'   `::::::::'
    `''        `''`'        `''`'
          </pre>
        </div>
      </div>
    </main>
  );
}
