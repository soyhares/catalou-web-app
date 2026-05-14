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

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  async function add(item: Omit<CartItem, 'id'>) {
    await addCartItem(item);
    await refresh();
  }

  async function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      await removeCartItem(id);
    } else {
      await updateCartItemQuantity(id, quantity);
    }
    await refresh();
  }

  async function remove(id: string) {
    await removeCartItem(id);
    await refresh();
  }

  return { items, count, add, updateQuantity, remove, refresh };
}
