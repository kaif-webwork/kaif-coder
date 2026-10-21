import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { setLenis } from '../utils/lenis';

export default function SmoothScroll() {
  useEffect(() => {
    // 1. Detect touch / mobile devices (smartphones, tablets, touchscreens)
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches);

    // Track active scrolling on document root to disable pointer-events on heavy canvases & SVGs
    let scrollTimeout: number;
    const handleScrollActive = () => {
      document.documentElement.classList.add('is-scrolling');
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 90);
    };

    window.addEventListener('scroll', handleScrollActive, { passive: true });

    // On mobile and touch devices, do NOT run Lenis virtual scroll.
    // Native hardware compositor scrolling provides 100% lag-free 120Hz/60Hz momentum scroll.
    if (isTouchDevice) {
      setLenis(null);
      return () => {
        window.removeEventListener('scroll', handleScrollActive);
        window.clearTimeout(scrollTimeout);
        document.documentElement.classList.remove('is-scrolling');
      };
    }

    // 2. On desktop (mouse wheel / precision trackpad):
    // Use ultra-responsive low-latency Lenis settings (duration 0.65s instead of sluggish 1.15s lag)
    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        autoRaf: true,
        duration: 0.65,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 0,
        syncTouch: false,
        anchors: true,
        prevent: (node: HTMLElement) => {
          return (
            node?.hasAttribute?.('data-lenis-prevent') ||
            Boolean(node?.closest?.('[data-lenis-prevent]')) ||
            Boolean(node?.closest?.('.chat-window-container')) ||
            Boolean(node?.closest?.('.cert-lightbox-overlay')) ||
            Boolean(node?.closest?.('.adzero-lightbox-overlay'))
          );
        },
      });

      lenis.on('scroll', handleScrollActive);
      setLenis(lenis);
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    } catch (err) {
      console.warn('Failed to initialize Lenis smooth scroll:', err);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollActive);
      window.clearTimeout(scrollTimeout);
      document.documentElement.classList.remove('is-scrolling');
      if (lenis) {
        lenis.destroy();
        setLenis(null);
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  return null;
}
