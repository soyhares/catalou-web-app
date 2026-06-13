import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { submitOrder, type OrderType } from '@entities/order/api';
import { formatPrice } from '@shared/lib/formatPrice';
import type { CartItem } from '@shared/lib/cart-store';

export type { CartItem };

export interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  notes: string;
  affiliateNumber: string;
}

export interface CheckoutPageProps {
  items: CartItem[];
  total: string;
  form: CheckoutForm;
  errors: Partial<Record<keyof CheckoutForm, string>>;
  isSubmitting: boolean;
  submitError: string | null;
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  isOnline: boolean;
  orderType: OrderType;
  hasBothOrderTypes: boolean;
  businessModel: 'DIRECT' | 'ASSOCIATED';
  onFieldChange: (field: keyof CheckoutForm, value: string) => void;
  onOrderTypeChange: (type: OrderType) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function useCheckoutPage(): CheckoutPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const { items } = useCart(slug);
  const isOnline = useOnlineStatus();

  const [orderType, setOrderType] = useState<OrderType>(
    branding.orderType === 'BOTH' ? 'DIRECT' : (branding.orderType as OrderType) ?? 'DIRECT'
  );

  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    notes: '',
    affiliateNumber: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const subtotalNum = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function onOrderTypeChange(type: OrderType) {
    setOrderType(type);
  }

  function onFieldChange(field: keyof CheckoutForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!form.name.trim()) errs.name = 'Campo requerido';
    if (!form.phone.trim()) errs.phone = 'Campo requerido';
    if (!form.email.trim()) {
      errs.email = 'Campo requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Correo inválido';
    }
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Campo requerido';
    if (orderType === 'FINANCED' && !form.affiliateNumber.trim()) {
      errs.affiliateNumber = 'Campo requerido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function onSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    submitOrder(slug, {
      orderType,
      visitorName: form.name.trim(),
      visitorPhone: form.phone.trim(),
      visitorEmail: form.email.trim(),
      deliveryAddress: form.deliveryAddress.trim(),
      affiliateNumber: orderType === 'FINANCED' ? form.affiliateNumber.trim() : undefined,
      items: items.map((item) => ({
        productId: item.productId,
        variantValueId: item.variantValueId,
        quantity: item.quantity,
      })),
    })
      .then(() => clearCart(slug))
      .then(() => {
        void navigate('/order-confirmed', { replace: true });
      })
      .catch(() => {
        setSubmitError('No se pudo enviar el pedido. Intenta nuevamente.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function onBack() {
    navigate(-1);
  }

  const currency = branding.currency ?? 'CRC';

  return {
    items,
    total: formatPrice(subtotalNum, currency),
    form,
    errors,
    isSubmitting,
    submitError,
    showPrices: branding.showPrices ?? false,
    currency,
    isOnline,
    orderType,
    hasBothOrderTypes: branding.orderType === 'BOTH',
    businessModel: branding.businessModel ?? 'DIRECT',
    onFieldChange,
    onOrderTypeChange,
    onSubmit,
    onBack,
  };
}
