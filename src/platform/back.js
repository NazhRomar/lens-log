import { useEffect, useRef } from 'react';

// Screens with their own "back" behaviour (a multi-step guide or setup)
// register a handler. The newest handler runs first; it returns true if it
// handled the press, false to let the default (go back a screen) happen.
const handlers = [];

export function useBackHandler(fn, active = true) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!active) return undefined;
    const h = () => ref.current();
    handlers.push(h);
    return () => {
      const i = handlers.lastIndexOf(h);
      if (i >= 0) handlers.splice(i, 1);
    };
  }, [active]);
}

export function runBackHandlers() {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i]()) return true;
  }
  return false;
}
