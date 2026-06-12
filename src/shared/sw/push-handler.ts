/**
 * Push notification handler for the Service Worker.
 *
 * This file documents the push event logic. The actual handler is in
 * `public/push-handler.js`, which is imported by the Workbox-generated SW
 * via the `importScripts` option in `vite.config.ts`.
 *
 * Why this approach:
 * - The project uses vite-plugin-pwa with `strategies: 'generateSW'`.
 * - In generateSW mode, Workbox generates the SW entirely — there is no custom
 *   SW source file to edit directly.
 * - Workbox's `importScripts` option injects an `importScripts()` call into the
 *   generated SW, allowing additional event listeners to be added at runtime.
 * - `public/push-handler.js` must be a plain JS file (no ES module syntax)
 *   because it runs in the SW scope via `importScripts()`.
 */

export const PUSH_HANDLER_SCRIPT = '/push-handler.js';
