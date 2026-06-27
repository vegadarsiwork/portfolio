// Tiny pub/sub so components can react to the *exact* Lenis scroll value in the
// same frame Lenis positions the content. Reading window.scrollY in a separate
// RAF desyncs from Lenis by a frame (and is integer-quantized), which makes
// parallax layers judder on scrollbar drags. Subscribing here avoids that.

type ScrollCb = (scroll: number) => void;

const subscribers = new Set<ScrollCb>();

/** Called by the Lenis owner (providers) on every Lenis scroll tick. */
export function emitLenisScroll(scroll: number) {
  for (const cb of subscribers) cb(scroll);
}

/** Subscribe to the smoothed Lenis scroll position. Returns an unsubscribe fn. */
export function onLenisScroll(cb: ScrollCb) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

type LenisLike = {
  scrollTo: (target: number | string | HTMLElement, options?: Record<string, unknown>) => void;
};

let lenisInstance: LenisLike | null = null;

export function setLenisInstance(l: LenisLike | null) {
  lenisInstance = l;
}

/** Smooth-scroll via Lenis (native smooth is disabled while Lenis is active).
 *  Falls back to window.scrollTo if Lenis isn't mounted. */
export function lenisScrollTo(target: number | string | HTMLElement = 0, options?: Record<string, unknown>) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
    return;
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: typeof target === 'number' ? target : 0, behavior: 'smooth' });
  }
}
