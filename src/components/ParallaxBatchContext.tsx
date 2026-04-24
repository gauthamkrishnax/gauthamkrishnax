import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { useLenis } from 'lenis/react';

export type ParallaxBatchEntry = {
  layerRef: RefObject<HTMLElement | null>;
  /** Multiplier on Lenis scroll position (no layout reads per tick). */
  strength: number;
};

type ParallaxBatchContextValue = {
  register: (entry: ParallaxBatchEntry) => () => void;
};

const ParallaxBatchContext = createContext<ParallaxBatchContextValue | null>(null);

/** Maps document scroll to parallax px (replaces old `getBoundingClientRect().top * strength` scale). */
const SCROLL_TO_PARALLAX = 0.22;

export function useParallaxBatch(): ParallaxBatchContextValue | null {
  return useContext(ParallaxBatchContext);
}

/**
 * One Lenis scroll listener for all parallax layers.
 * Uses `lenis.scroll * strength` only (no getBoundingClientRect) so scroll stays cheap and responsive.
 */
export function ParallaxBatchProvider({ children }: { children: ReactNode }) {
  const entriesRef = useRef<ParallaxBatchEntry[]>([]);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      reducedMotionRef.current = mq.matches;
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const register = useCallback((entry: ParallaxBatchEntry) => {
    entriesRef.current.push(entry);
    return () => {
      const arr = entriesRef.current;
      const i = arr.indexOf(entry);
      if (i !== -1) arr.splice(i, 1);
    };
  }, []);

  const flush = useCallback((scroll: number) => {
    const entries = entriesRef.current;
    if (entries.length === 0) return;

    if (reducedMotionRef.current) {
      for (const e of entries) {
        const l = e.layerRef.current;
        if (!l) continue;
        l.style.removeProperty('transform');
        l.style.removeProperty('will-change');
      }
      return;
    }

    const updates: { el: HTMLElement; y: number }[] = [];
    for (const e of entries) {
      const l = e.layerRef.current;
      if (!l) continue;
      updates.push({ el: l, y: scroll * e.strength * SCROLL_TO_PARALLAX });
    }
    for (const u of updates) {
      u.el.style.willChange = 'transform';
      u.el.style.transform = `translate3d(0, ${u.y}px, 0)`;
    }
  }, []);

  useLenis((lenis) => {
    flush(lenis.scroll);
  }, [flush]);

  const value: ParallaxBatchContextValue = { register };

  return <ParallaxBatchContext.Provider value={value}>{children}</ParallaxBatchContext.Provider>;
}
