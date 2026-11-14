import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getLenis } from '../utils/lenis';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector<HTMLElement>(hash);
      if (el) {
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(el, { offset: -80 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }
  }, [pathname, hash]);

  return null;
}
