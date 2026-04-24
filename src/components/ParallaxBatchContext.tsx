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
  measureRef: RefObject<HTMLElement | null>;
  layerRef: RefObject<HTMLElement | null>;
  strength: number;
};

type ParallaxBatchContextValue = {
  register: (entry: ParallaxBatchEntry) => () => void;
};

const ParallaxBatchContext = createContext<ParallaxBatchContextValue | null>(null);

export function useParallaxBatch(): ParallaxBatchContextValue | null {
  return useContext(ParallaxBatchContext);
}

/**
 * One Lenis scroll listener for all parallax layers: read all rects, then write all transforms.
 * Avoids read/write interleaving that forces layout each time Lenis ticks.
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

  const flush = useCallback(() => {
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
      const m = e.measureRef.current;
      const l = e.layerRef.current;
      if (!m || !l) continue;
      updates.push({ el: l, y: m.getBoundingClientRect().top * e.strength });
    }
    for (const u of updates) {
      u.el.style.willChange = 'transform';
      u.el.style.transform = `translate3d(0, ${u.y}px, 0)`;
    }
  }, []);

  useLenis(() => {
    flush();
  }, [flush]);

  const value: ParallaxBatchContextValue = { register };

  return <ParallaxBatchContext.Provider value={value}>{children}</ParallaxBatchContext.Provider>;
}
