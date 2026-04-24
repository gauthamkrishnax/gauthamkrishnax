import { useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import { usePageContext } from 'vike-react/usePageContext';

/**
 * Lenis can ignore programmatic window.scrollTo while wheel smoothing is active.
 * After the first paint, sync the Lenis instance to top on every pathname change so
 * client navigations always land at the top of the new page.
 */
export default function RouteScrollReset() {
  const { urlPathname } = usePageContext();
  const lenis = useLenis();
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (!lenis) return;
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    lenis.scrollTo(0, { immediate: true });
  }, [urlPathname, lenis]);

  return null;
}
