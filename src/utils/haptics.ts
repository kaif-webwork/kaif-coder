// Hardware-accelerated haptic feedback for mobile devices via Web Vibration API

export type HapticFeedbackType = 'light' | 'medium' | 'selection' | 'success';

export function triggerHaptic(type: HapticFeedbackType = 'selection') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'selection':
      case 'light':
        // Crisp 8ms micro-tick for graph scrubbing / timeline point selection
        navigator.vibrate(8);
        break;
      case 'medium':
        // Solid 14ms notch for tab change or interactive toggle
        navigator.vibrate(14);
        break;
      case 'success':
        navigator.vibrate([10, 30, 10]);
        break;
      default:
        navigator.vibrate(8);
    }
  } catch {
    // Vibration safely suppressed if not supported or restricted by browser
  }
}
