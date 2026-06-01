import { useState, useEffect, useCallback } from 'react';
import {
  getCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  cartItemCount,
  type CartItem,
} from './cart-store';

export function useCart(slug: string) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const [cartItems, total] = await Promise.all([
      getCartItems(slug),
      cartItemCount(slug),
    ]);
    setItems(cartItems);
    setCount(total);
  }, [slug]);

  // Initial load
  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  // Sync across all hook instances — any mutation from any component updates everyone
  useEffect(() => {
    function onExternalUpdate() { void refresh(); }
    window.addEventListener('cart-updated', onExternalUpdate);
    return () => window.removeEventListener('cart-updated', onExternalUpdate);
  }, [refresh]);

  async function add(item: Omit<CartItem, 'id'>) {
    await addCartItem(item);
    await refresh();
    window.dispatchEvent(new Event('cart-updated'));
  }

  async function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      await removeCartItem(id);
    } else {
      await updateCartItemQuantity(id, quantity);
    }
    await refresh();
    window.dispatchEvent(new Event('cart-updated'));
  }

  async function remove(id: string) {
    await removeCartItem(id);
    await refresh();
    window.dispatchEvent(new Event('cart-updated'));
  }

  return { items, count, add, updateQuantity, remove, refresh };
}
