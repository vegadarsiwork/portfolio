/**
 * Subtle CRT scanline overlay. Fixed across the viewport, non-interactive.
 * Uses a repeating linear gradient in a violet-indigo tint so it doesn't
 * fight text contrast. Opacity is intentionally very low.
 */
export default function Scanlines({
  opacity = 0.08,
  className = '',
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[60] mix-blend-overlay ${className}`}
      style={{
        opacity,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(114, 9, 183, 0.6) 0px, rgba(114, 9, 183, 0.6) 1px, transparent 1px, transparent 3px)',
      }}
    />
  );
}
