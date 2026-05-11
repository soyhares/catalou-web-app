import { Workbox } from 'workbox-window';

export function registerServiceWorkerEvents(): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  const wb = new Workbox('/sw.js');

  // When a new SW has taken control, reload to serve the updated app shell
  wb.addEventListener('controlling', () => {
    window.location.reload();
  });

  wb.register().catch((err: unknown) => {
    console.error('Service worker registration failed', err);
  });
}

registerServiceWorkerEvents();
