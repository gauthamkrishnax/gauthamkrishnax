import { useEffect } from 'react';
import { usePageContext } from 'vike-react/usePageContext';

function ScrollReveal() {
  const pageContext = usePageContext();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (const node of nodes) {
      const delay = Number(node.dataset.revealDelay || 0);
      node.style.setProperty('--reveal-delay', `${delay}ms`);
      if (reducedMotion) {
        node.classList.add('is-revealed');
      }
    }

    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    for (const node of nodes) observer.observe(node);

    return () => observer.disconnect();
  }, [pageContext.urlPathname]);

  return null;
}

export default ScrollReveal;
