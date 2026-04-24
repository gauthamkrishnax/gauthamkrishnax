import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useParallaxBatch, type ParallaxBatchEntry } from './ParallaxBatchContext';

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Multiplier on viewport-relative Y (`getBoundingClientRect().top`).
   * Typical depth: 0.04–0.14. Negative values move the layer the opposite way.
   */
  strength?: number;
};

export default function ParallaxLayer({
  children,
  className,
  style,
  strength = 0.1,
}: ParallaxLayerProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const batch = useParallaxBatch();

  useLayoutEffect(() => {
    if (!batch) return;
    const entry: ParallaxBatchEntry = {
      measureRef,
      layerRef,
      strength,
    };
    return batch.register(entry);
  }, [batch, strength]);

  return (
    <div ref={measureRef} className={className} style={style}>
      <div ref={layerRef}>{children}</div>
    </div>
  );
}
