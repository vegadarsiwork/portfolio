'use client';

import { useEffect, useRef, useState } from 'react';

interface CommandBarProps {
  open: boolean;
  value: string;
  feedback: string;
  suggestions: string[];
  selectedSuggestion: number;
  onChange: (value: string) => void;
  onAutocomplete: () => void;
  onSelectSuggestion: (value: string) => void;
  onMoveSelection: (direction: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CommandBar({
  open,
  value,
  feedback,
  suggestions,
  selectedSuggestion,
  onChange,
  onAutocomplete,
  onSelectSuggestion,
  onMoveSelection,
  onSubmit,
  onClose,
}: CommandBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [kbInset, setKbInset] = useState(0);

  // Lift the bar above the on-screen keyboard on mobile (visualViewport shrinks
  // by the keyboard height when it opens). Falls back to 0 where unsupported.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const inset = window.innerHeight - vv.height - vv.offsetTop;
      setKbInset(inset > 0 ? inset : 0);
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    onResize();
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(value.length, value.length);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, value.length]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-v2-commandbar]')) onClose();
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed left-4 z-[120] w-[min(620px,calc(100vw-2rem))] pointer-events-auto"
      style={{ bottom: `calc(1rem + ${kbInset}px + env(safe-area-inset-bottom))` }}
    >
      {suggestions.length > 0 && (
        <div
          data-v2-commandbar
          className="pxl mb-2 border-2 border-[var(--color-v2-orange)]/50 bg-[var(--color-v2-bg)] p-1"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectSuggestion(suggestion)}
              className={`px-step block w-full px-3 py-2 text-left ${
                index === selectedSuggestion
                  ? 'bg-[var(--color-v2-orange)]/16 text-[var(--color-v2-orange)]'
                  : 'text-[var(--color-v2-text)]/88 hover:bg-[var(--color-v2-orange)]/10 hover:text-[var(--color-v2-orange)]'
              }`}
            >
              /{suggestion}
            </button>
          ))}
        </div>
      )}
      <div
        data-v2-commandbar
        className="pxl border-2 border-[var(--color-v2-orange)] bg-[var(--color-v2-bg)] px-4 py-3"
        style={{ boxShadow: 'var(--px) var(--px) 0 0 rgba(0, 0, 0, 0.55)' }}
      >
        {feedback && (
          <div className="mb-2 text-[var(--color-v2-orange)]">
            {feedback}
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-v2-orange)]">/</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                onMoveSelection(1);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onMoveSelection(-1);
              } else if (e.key === 'Tab') {
                e.preventDefault();
                onAutocomplete();
              } else if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full bg-transparent text-[var(--color-v2-text)] outline-none placeholder:text-[var(--color-v2-muted)]/70"
            placeholder="tickrate 20"
          />
        </div>
      </div>
    </div>
  );
}
