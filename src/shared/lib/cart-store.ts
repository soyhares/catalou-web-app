const DB_NAME = 'catalou-cart';
const DB_VERSION = 1;
const STORE_NAME = 'items';

export interface CartItem {
  id: string;
  companySlug: string;
  productId: string;
  productName: string;
  // one value id per variant type of the product (in type order); [] when it has none
  variantValueIds: string[];
  // joined label for display, e.g. "Talla: M, Color: Azul"; null when no variants
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  // free-text note the shopper wrote for this line (SPEC-021); absent when none.
  // IndexedDB is schemaless per record — older items simply lack the key.
  note?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

export async function getCartItems(slug: string): Promise<CartItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').getAll();
    req.onsuccess = () =>
      resolve((req.result as CartItem[]).filter((item) => item.companySlug === slug));
    req.onerror = () => reject(req.error);
  });
}

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 11);
}

// Two adds of the same product with the same variant combination are one line of quantity 2,
// not two lines of 1. Lines carrying a note never merge: the note belongs to that line.
export function isSameCartLine(a: Omit<CartItem, 'id'>, b: CartItem): boolean {
  if (a.note || b.note) return false;
  return (
    a.companySlug === b.companySlug &&
    a.productId === b.productId &&
    a.variantValueIds.length === b.variantValueIds.length &&
    [...a.variantValueIds].sort().join('|') === [...b.variantValueIds].sort().join('|')
  );
}

export async function addCartItem(item: Omit<CartItem, 'id'>): Promise<CartItem> {
  const existing = (await getCartItems(item.companySlug)).find((line) =>
    isSameCartLine(item, line),
  );
  const db = await openDB();
  const next: CartItem = existing
    ? { ...existing, quantity: existing.quantity + item.quantity }
    : { ...item, id: genId() };
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').put(next);
    req.onsuccess = () => resolve(next);
    req.onerror = () => reject(req.error);
  });
}

export async function updateCartItemQuantity(id: string, quantity: number): Promise<void> {
  const db = await openDB();
  const store = tx(db, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result as CartItem;
      if (!item) {
        resolve();
        return;
      }
      const putReq = tx(db, 'readwrite').put({ ...item, quantity });
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// SPEC-021: set/clear the free-text note on a cart line. Whitespace-only clears it.
export async function updateCartItemNote(id: string, note: string): Promise<void> {
  const db = await openDB();
  const store = tx(db, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result as CartItem;
      if (!item) {
        resolve();
        return;
      }
      const trimmed = note.trim();
      const next: CartItem = { ...item };
      if (trimmed) {
        next.note = trimmed;
      } else {
        delete next.note;
      }
      const putReq = tx(db, 'readwrite').put(next);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function removeCartItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearCart(slug: string): Promise<void> {
  const items = await getCartItems(slug);
  const db = await openDB();
  await Promise.all(
    items.map(
      (item) =>
        new Promise<void>((resolve, reject) => {
          const req = tx(db, 'readwrite').delete(item.id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        }),
    ),
  );
}

export async function cartItemCount(slug: string): Promise<number> {
  const items = await getCartItems(slug);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
