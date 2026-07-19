type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Web's REST-fallback read hooks (see app/hooks/*) only refetch on screen
 * focus, since there's no PowerSync-style live reactivity backing them.
 * Writes call notifyDataChanged() so any hook currently mounted refetches
 * immediately instead of waiting for the user to navigate away and back.
 */
export function subscribeToDataRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyDataChanged(): void {
  listeners.forEach((listener) => listener());
}
