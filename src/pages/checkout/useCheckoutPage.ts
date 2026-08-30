import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { submitOrder, type OrderType } from '@entities/order/api';
import { formatPrice } from '@shared/lib/formatPrice';
import { readSession } from '@shared/lib/customer-session';
import { getCustomerProfile } from '@entities/customer/api';
import type { CartItem } from '@shared/lib/cart-store';

export type { CartItem };

export interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  deliveryAddress: string;
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
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
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
    affiliateNumber: '',
  });
  // SPEC-022 (T055, FR-021): el cliente autenticado no vuelve a escribir sus datos. Son
  // valores por defecto de ESTA operación: quedan editables y no reescriben su perfil ni los
  // datos de contacto de pedidos ya cerrados (FR-013).
  //
  // El perfil del servidor pisa la copia de la sesión, que se escribió el día de la
  // activación y nunca se refresca. Lo único que no pisa es lo que la persona ya tecleó: por
  // eso `editedFields`, y no un `||` sobre el valor, que con la copia de sesión ya puesta
  // haría que el servidor no ganara jamás.
  const editedFields = useRef(new Set<keyof CheckoutForm>());

  useEffect(() => {
    const session = readSession(slug);
    if (!session) return;

    const prefill = (p: { name: string; email: string; phone: string | null }) => {
      setForm((prev) => ({
        ...prev,
        ...(editedFields.current.has('name') ? {} : { name: p.name }),
        ...(editedFields.current.has('email') ? {} : { email: p.email }),
        ...(editedFields.current.has('phone') ? {} : { phone: p.phone ?? '' }),
      }));
    };

    prefill(session.customer);
    getCustomerProfile(slug).then(prefill).catch(() => undefined);
  }, [slug]);

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const subtotalNum = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function onOrderTypeChange(type: OrderType) {
    setOrderType(type);
  }

  function onFieldChange(field: keyof CheckoutForm, value: string) {
    editedFields.current.add(field);
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
        variantValueIds: item.variantValueIds,
        quantity: item.quantity,
        customerNote: item.note,
      })),
    })
      .then((confirmation) => {
        // SPEC-021: carry the noted lines to the confirmation screen before the cart is cleared
        const notedItems = items
          .filter((item) => item.note)
          .map((item) => ({
            productName: item.productName,
            variantLabel: item.variantLabel,
            note: item.note as string,
          }));
        return clearCart(slug).then(() => ({ notedItems, orderId: confirmation.orderId }));
      })
      .then(({ notedItems, orderId }) => {
        // SPEC-022: the order anchors the account offer to this business, and the email is
        // the one the shopper just typed — no extra data is asked for (FR-006).
        void navigate('/order-confirmed', {
          replace: true,
          state: { notedItems, orderId, email: form.email.trim() },
        });
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
    businessModel: branding.businessModel,
    onFieldChange,
    onOrderTypeChange,
    onSubmit,
    onBack,
  };
}
