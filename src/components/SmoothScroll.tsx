import { useEffect } from 'react';
import { setLenis } from '../utils/lenis';

export default function SmoothScroll() {
  useEffect(() => {
    // On touch/mobile devices, use native hardware-accelerated scrolling for 0ms latency & 100% performance
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches);

    if (isTouch) {
      return;
    }

    let lenisInstance: any = null;
    let destroyed = false;

    // Dynamically load Lenis on idle for desktop wheel smoothing without blocking the initial paint
    const initLenis = async () => {
      try {
        const [{ default: Lenis }] = await Promise.all([
          import('lenis'),
          import('lenis/dist/lenis.css'),
        ]);

        if (destroyed) return;

        lenisInstance = new Lenis({
          autoRaf: true,
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.0,
          infinite: false,
        });

        setLenis(lenisInstance);
        (window as unknown as { lenis?: any }).lenis = lenisInstance;
      } catch (err) {
        console.warn('Lenis dynamic load deferred', err);
      }
    };

    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && 'requestIdleCallback' in win) {
      const handle = win.requestIdleCallback(initLenis, { timeout: 1500 });
      return () => {
        destroyed = true;
        if ('cancelIdleCallback' in win) {
          win.cancelIdleCallback(handle);
        }
        if (lenisInstance) {
          lenisInstance.destroy();
          setLenis(null);
          delete win.lenis;
        }
      };
    } else {
      const timer = setTimeout(initLenis, 400);
      return () => {
        destroyed = true;
        clearTimeout(timer);
        if (lenisInstance) {
          lenisInstance.destroy();
          setLenis(null);
          if (win) delete win.lenis;
        }
      };
    }
  }, []);

  return null;
}
