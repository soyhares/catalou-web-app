import { openDB, type IDBPDatabase } from 'idb';

export interface CartItem {
  id: string;            // composite: `${productId}::${variantValueId ?? 'none'}`
  productId: string;
  variantValueId: string | null;
  productName: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}

const DB_NAME = 'catalou-cart';
const STORE_NAME = 'items';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export function makeCartItemId(
  productId: string,
  variantValueId: string | null,
): string {
  return `${productId}::${variantValueId ?? 'none'}`;
}

export async function getCart(): Promise<CartItem[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function addCartItem(item: CartItem): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE_NAME, item.id) as CartItem | undefined;
  if (existing) {
    await db.put(STORE_NAME, { ...existing, quantity: existing.quantity + item.quantity });
  } else {
    await db.put(STORE_NAME, item);
  }
}

export async function updateCartItemQuantity(
  id: string,
  quantity: number,
): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE_NAME, id) as CartItem | undefined;
  if (!existing) return;
  if (quantity <= 0) {
    await db.delete(STORE_NAME, id);
  } else {
    await db.put(STORE_NAME, { ...existing, quantity });
  }
}

export async function removeCartItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearCart(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
