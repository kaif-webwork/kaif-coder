import type Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}
