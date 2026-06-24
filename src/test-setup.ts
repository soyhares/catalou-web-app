import { IDBFactory } from 'fake-indexeddb';

// Polyfill IndexedDB for jsdom (cart-store uses it directly)
Object.defineProperty(globalThis, 'indexedDB', {
  value: new IDBFactory(),
  writable: true,
  configurable: true,
});
