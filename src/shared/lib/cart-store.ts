const DB_NAME = 'catalou-cart';
const DB_VERSION = 1;
const STORE_NAME = 'items';

export interface CartItem {
  id: string;
  companySlug: string;
  productId: string;
  productName: string;
  variantTypeId: string | null;
  variantTypeName: string | null;
  variantValueId: string | null;
  variantValueName: string | null;
  quantity: number;
  unitPrice: number;
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

export async function addCartItem(item: Omit<CartItem, 'id'>): Promise<CartItem> {
  const db = await openDB();
  const newItem: CartItem = { ...item, id: genId() };
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').add(newItem);
    req.onsuccess = () => resolve(newItem);
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
