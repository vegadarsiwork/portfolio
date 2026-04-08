'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Starfield from '@/components/v2/Starfield';
import Scanlines from '@/components/v2/Scanlines';
import Hero from '@/components/v2/Hero';
import Origin from '@/components/v2/Origin';
import SelectedWork from '@/components/v2/SelectedWork';
import Stack from '@/components/v2/Stack';
import SideQuests from '@/components/v2/SideQuests';
import Now from '@/components/v2/Now';
import Outro from '@/components/v2/Outro';
import type { Scene } from '@/components/v2/PixelScene';
import { getInterpolatedPreset } from '@/components/v2/time-presets';

export default function V2Page() {
  // Stable SSR defaults — replaced once on mount, then the canvas fades in.
  const [scene, setScene] = useState<Scene>('skyline');
  const [hour, setHour] = useState<number>(18);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // First-mount initialization: random scene + sync wall clock + reveal canvas.
  // Wrapped in setTimeout(0) so the state updates happen in a callback
  // (satisfying React 19's set-state-in-effect rule) and so the canvas
  // ALWAYS fades in from the correct starting state — no hydration flash.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setScene(Math.random() > 0.5 ? 'skyline' : 'mountains');
      const now = new Date();
      setHour(now.getHours() + now.getMinutes() / 60);
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Wall-clock tick when in auto mode
  useEffect(() => {
    if (!autoMode || !mounted) return;
    const tick = () => {
      const now = new Date();
      setHour(now.getHours() + now.getMinutes() / 60);
    };
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [autoMode, mounted]);

  const handleHourChange = (h: number) => {
    if (autoMode) setAutoMode(false);
    setHour(h);
  };

  const handleAutoToggle = () => {
    setAutoMode((prev) => {
      const next = !prev;
      if (next) {
        const now = new Date();
        setHour(now.getHours() + now.getMinutes() / 60);
      }
      return next;
    });
  };

  // Derived — interpolated preset based on continuous hour
  const preset = useMemo(() => getInterpolatedPreset(hour), [hour]);

  const wrapperStyle: CSSProperties = {
    backgroundColor: 'var(--color-v2-bg)',
    color: 'var(--color-v2-text)',
    fontFamily: 'var(--font-family-body-v2)',
    ['--color-v2-orange' as string]: preset.accentColor,
  };

  return (
    <div className="relative min-h-screen overflow-x-clip" style={wrapperStyle}>
      {/* Atmosphere — fixed across the viewport, always visible */}
      <Starfield />
      <Scanlines opacity={0.06} />

      <main className="relative z-10">
        <Hero
          scene={scene}
          hour={hour}
          onHourChange={handleHourChange}
          autoMode={autoMode}
          onAutoToggle={handleAutoToggle}
          presetLabel={preset.label}
          mounted={mounted}
        />
        <Origin />
        <SelectedWork />
        <Stack />
        <SideQuests />
        <Now />
        <Outro />
      </main>
    </div>
  );
}
