import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';
import type { CartItem } from '@shared/lib/cart-store';

export type { CartItem };

export interface CartPageProps {
  items: CartItem[];
  total: string;
  subtotal: string;
  isLoading: boolean;
  showPrices: boolean;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  onBack: () => void;
  companyName: string;
}

export function useCartPage(): CartPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { items, updateQuantity, remove, refresh } = useCart(slug);
  const [isLoading, setIsLoading] = useState(false);

  // items loaded by useCart internally; no separate loading needed here
  useEffect(() => {
    setIsLoading(false);
  }, [items]);

  const subtotalNum = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const servicePercentage = branding.servicePercentage ?? 0;
  const serviceAmount = (subtotalNum * servicePercentage) / 100;
  const totalNum = subtotalNum + serviceAmount;

  function onUpdateQuantity(id: string, qty: number) {
    void updateQuantity(id, qty);
  }

  function onRemove(id: string) {
    void remove(id);
  }

  const onClear = useCallback(() => {
    void clearCart(slug).then(() => {
      void refresh();
      window.dispatchEvent(new Event('cart-updated'));
    });
  }, [slug, refresh]);

  function onCheckout() {
    void navigate('/checkout');
  }

  function onBack() {
    navigate(-1);
  }

  return {
    items,
    total: `₡${totalNum.toLocaleString('es-CR')}`,
    subtotal: `₡${subtotalNum.toLocaleString('es-CR')}`,
    isLoading,
    showPrices: branding.showPrices ?? false,
    onUpdateQuantity,
    onRemove,
    onClear,
    onCheckout,
    onBack,
    companyName: branding.companyName,
  };
}
