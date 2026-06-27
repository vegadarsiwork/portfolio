// Fires once when the initial preloader lifts, so entrance animations can play
// when the user can actually see them (not while still hidden behind the
// preloader). Providers calls markRevealed(); components subscribe via onReveal.

let revealed = false;
const subscribers = new Set<() => void>();

export function markRevealed() {
  if (revealed) return;
  revealed = true;
  for (const cb of subscribers) cb();
}

export function isRevealed() {
  return revealed;
}

/** Run cb when the page is revealed (immediately if it already has). */
export function onReveal(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}
