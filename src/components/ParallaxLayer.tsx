import { useLenis } from 'lenis/react';
import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react';

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

  const onScroll = useCallback(() => {
    const measure = measureRef.current;
    const layer = layerRef.current;
    if (!measure || !layer) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      layer.style.removeProperty('transform');
      layer.style.removeProperty('will-change');
      return;
    }

    const y = measure.getBoundingClientRect().top * strength;
    layer.style.willChange = 'transform';
    layer.style.transform = `translate3d(0, ${y}px, 0)`;
  }, [strength]);

  useLenis(onScroll, [onScroll]);

  return (
    <div ref={measureRef} className={className} style={style}>
      <div ref={layerRef}>{children}</div>
    </div>
  );
}
