'use client';

import { useEffect, useRef } from 'react';

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
    <div className="fixed left-4 bottom-4 z-[120] w-[min(620px,calc(100vw-2rem))] pointer-events-auto">
      {suggestions.length > 0 && (
        <div
          data-v2-commandbar
          className="mb-2 border border-[var(--color-v2-orange)]/45 bg-[rgba(7,7,10,0.88)] p-1 backdrop-blur-sm"
          style={{
            boxShadow:
              '0 0 0 1px color-mix(in srgb, var(--color-v2-orange) 12%, transparent), 0 0 20px color-mix(in srgb, var(--color-v2-orange) 14%, transparent)',
            fontFamily: 'var(--font-family-hero-v2)',
            fontWeight: 700,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectSuggestion(suggestion)}
              className={`block w-full px-3 py-2 text-left text-xs tracking-[0.08em] transition-colors ${
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
        className="border border-[var(--color-v2-orange)]/65 bg-[rgba(7,7,10,0.92)] px-4 py-3 backdrop-blur-sm"
        style={{
          boxShadow:
            '0 0 0 1px color-mix(in srgb, var(--color-v2-orange) 18%, transparent), 0 0 18px color-mix(in srgb, var(--color-v2-orange) 24%, transparent), 0 0 42px color-mix(in srgb, var(--color-v2-orange) 16%, transparent)',
          fontFamily: 'var(--font-family-hero-v2)',
          fontWeight: 700,
        }}
      >
        {feedback && (
          <div className="mb-2 text-xs tracking-[0.12em] text-[var(--color-v2-orange)]/90">
            {feedback}
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-[var(--color-v2-orange)]">/</span>
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
            className="w-full bg-transparent text-sm font-bold tracking-[0.08em] text-[var(--color-v2-text)] outline-none placeholder:text-[var(--color-v2-muted)]/70"
            placeholder="tickrate 20"
          />
        </div>
      </div>
    </div>
  );
}
