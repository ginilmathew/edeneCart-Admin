type Listener = (inFlight: number) => void;

let inFlight = 0;
const listeners = new Set<Listener>();

/** Increment/decrement in-flight API count (used by api client). */
export function notifyApiLoading(delta: number): void {
  inFlight = Math.max(0, inFlight + delta);
  for (const fn of listeners) fn(inFlight);
}

export function getApiInFlight(): number {
  return inFlight;
}

export function subscribeApiLoading(fn: Listener): () => void {
  listeners.add(fn);
  fn(inFlight);
  return () => listeners.delete(fn);
}
