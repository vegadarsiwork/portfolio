'use client';

import { useEffect, useState } from 'react';

export interface V2MotionSettings {
  reduceMotion: boolean;
  coarsePointer: boolean;
  saveData: boolean;
  isMobile: boolean;
  /** Frame cap for the world scene's time-based animation. */
  sceneFps: number;
  enableCursorSprite: boolean;
}

function getInitialSettings(): V2MotionSettings {
  return {
    reduceMotion: false,
    coarsePointer: false,
    saveData: false,
    isMobile: false,
    sceneFps: 30,
    enableCursorSprite: true,
  };
}

export function useV2MotionSettings(): V2MotionSettings {
  const [settings, setSettings] = useState<V2MotionSettings>(getInitialSettings);

  useEffect(() => {
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const read = () => {
      const connection = (navigator as Navigator & {
        connection?: { saveData?: boolean };
      }).connection;
      const reduceMotion = reduceQuery.matches;
      const coarsePointer = pointerQuery.matches || navigator.maxTouchPoints > 0;
      const isMobile = mobileQuery.matches;
      const saveData = Boolean(connection?.saveData);
      const constrained = reduceMotion || coarsePointer || isMobile || saveData;

      setSettings({
        reduceMotion,
        coarsePointer,
        saveData,
        isMobile,
        sceneFps: constrained ? 24 : 30,
        enableCursorSprite: !reduceMotion && !coarsePointer && !isMobile,
      });
    };

    read();
    reduceQuery.addEventListener('change', read);
    pointerQuery.addEventListener('change', read);
    mobileQuery.addEventListener('change', read);
    return () => {
      reduceQuery.removeEventListener('change', read);
      pointerQuery.removeEventListener('change', read);
      mobileQuery.removeEventListener('change', read);
    };
  }, []);

  return settings;
}
