import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Global resilience shielding: prevent unhandled errors/rejections from third-party extensions from crashing React
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Prevent third-party / extension errors from taking down the page
    if (
      event.message?.includes('ResizeObserver') ||
      event.filename?.includes('extension') ||
      event.filename?.includes('chrome-extension')
    ) {
      event.stopImmediatePropagation();
      return;
    }
    console.warn('Unhandled runtime error shielded:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection shielded:', event.reason);
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

