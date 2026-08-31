import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
  addCartItem,
  getCartItems,
  cartItemCount,
  removeCartItem,
  clearCart,
  updateCartItemQuantity,
  updateCartItemNote,
} from './cart-store';

// Reset IndexedDB between tests so state doesn't bleed across cases
beforeEach(() => {
  Object.defineProperty(globalThis, 'indexedDB', {
    value: new IDBFactory(),
    writable: true,
    configurable: true,
  });
});

const BASE_ITEM = {
  companySlug: 'tenant-a',
  productId:   'prod-1',
  productName: 'Camisa',
  variantValueIds: [] as string[],
  variantLabel: null,
  quantity:  1,
  unitPrice: 25.00,
} as const;

describe('cart-store', () => {
  it('add → getCartItems returns the item for that slug', async () => {
    await addCartItem(BASE_ITEM);
    const items = await getCartItems('tenant-a');
    expect(items).toHaveLength(1);
    expect(items[0].productName).toBe('Camisa');
  });

  it('multi-tenant isolation: tenant-b sees no items from tenant-a', async () => {
    await addCartItem(BASE_ITEM);
    const items = await getCartItems('tenant-b');
    expect(items).toHaveLength(0);
  });

  it('cartItemCount sums quantities across multiple items', async () => {
    await addCartItem({ ...BASE_ITEM, quantity: 2 });
    await addCartItem({ ...BASE_ITEM, productId: 'prod-2', productName: 'Pantalón', quantity: 3 });
    expect(await cartItemCount('tenant-a')).toBe(5);
  });

  it('updateCartItemQuantity changes the stored quantity', async () => {
    const added = await addCartItem(BASE_ITEM);
    await updateCartItemQuantity(added.id, 4);
    const items = await getCartItems('tenant-a');
    expect(items[0].quantity).toBe(4);
  });

  it('removeCartItem deletes a single item', async () => {
    const added = await addCartItem(BASE_ITEM);
    await addCartItem({ ...BASE_ITEM, productId: 'prod-2', productName: 'Pantalón' });
    await removeCartItem(added.id);
    const items = await getCartItems('tenant-a');
    expect(items).toHaveLength(1);
    expect(items[0].productName).toBe('Pantalón');
  });

  it('clearCart removes all items for a slug but not other tenants', async () => {
    await addCartItem(BASE_ITEM);
    await addCartItem({ ...BASE_ITEM, companySlug: 'tenant-b' });
    await clearCart('tenant-a');
    expect(await getCartItems('tenant-a')).toHaveLength(0);
    expect(await getCartItems('tenant-b')).toHaveLength(1);
  });

  it('merges a repeated add of the same product + combination into one line', async () => {
    await addCartItem({ ...BASE_ITEM, variantValueIds: ['v1', 'v2'] });
    await addCartItem({ ...BASE_ITEM, variantValueIds: ['v2', 'v1'], quantity: 2 });
    const items = await getCartItems('tenant-a');
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('does not merge a different variant combination, nor lines with a note', async () => {
    await addCartItem({ ...BASE_ITEM, variantValueIds: ['v1'] });
    await addCartItem({ ...BASE_ITEM, variantValueIds: ['v2'] });
    await addCartItem({ ...BASE_ITEM, variantValueIds: ['v1'], note: 'Sin cebolla' });
    await addCartItem({ ...BASE_ITEM, variantValueIds: ['v1'], note: 'Sin cebolla' });
    expect(await getCartItems('tenant-a')).toHaveLength(4);
  });

  // SPEC-021 — per-line customer note
  it('addCartItem persists a note; an item without one has no note key', async () => {
    await addCartItem({ ...BASE_ITEM, note: 'Sin cebolla' });
    await addCartItem({ ...BASE_ITEM, productId: 'prod-2', productName: 'Pantalón' });
    const items = await getCartItems('tenant-a');
    const shirt = items.find((i) => i.productName === 'Camisa')!;
    const pants = items.find((i) => i.productName === 'Pantalón')!;
    expect(shirt.note).toBe('Sin cebolla');
    expect('note' in pants).toBe(false);
  });

  it('updateCartItemNote sets a trimmed note and clears it on whitespace-only', async () => {
    const a = await addCartItem(BASE_ITEM);
    const b = await addCartItem({ ...BASE_ITEM, productId: 'prod-2', productName: 'Pantalón' });

    await updateCartItemNote(a.id, '  para regalo  ');
    let items = await getCartItems('tenant-a');
    expect(items.find((i) => i.id === a.id)!.note).toBe('para regalo');
    expect('note' in items.find((i) => i.id === b.id)!).toBe(false);

    await updateCartItemNote(a.id, '   ');
    items = await getCartItems('tenant-a');
    expect('note' in items.find((i) => i.id === a.id)!).toBe(false);
  });
});
