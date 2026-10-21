import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { setLenis } from '../utils/lenis';

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: Lenis | null = null;

    try {
      lenis = new Lenis({
        autoRaf: true,
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        syncTouch: true,
        syncTouchLerp: 0.08,
        touchInertiaExponent: 1.6,
        touchMultiplier: 1.2,
        anchors: true,
        prevent: (node: HTMLElement) => {
          return (
            node?.hasAttribute?.('data-lenis-prevent') ||
            Boolean(node?.closest?.('[data-lenis-prevent]')) ||
            Boolean(node?.closest?.('.chat-window-container')) ||
            Boolean(node?.closest?.('.cert-lightbox-overlay')) ||
            Boolean(node?.closest?.('.adzero-lightbox-overlay')) ||
            Boolean(node?.closest?.('.analytics-chart-canvas-container'))
          );
        },
      });

      setLenis(lenis);
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    } catch (err) {
      console.warn('Failed to initialize Lenis smooth scroll:', err);
    }

    return () => {
      if (lenis) {
        lenis.destroy();
        setLenis(null);
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  return null;
}
