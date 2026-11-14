import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { submitOrder, type OrderType } from '@entities/order/api';
import { formatPrice } from '@shared/lib/formatPrice';
import { ApiError } from '@shared/lib/api';
import { readSession, markKnownCustomer } from '@shared/lib/customer-session';
import { getCustomerProfile } from '@entities/customer/api';
import { fetchCheckoutOptions } from '@entities/catalog/api';
import type { CartItem } from '@shared/lib/cart-store';
import {
  EMPTY_SELECTION,
  availableFulfillmentTypes,
  availableMethods,
  availableTimings,
  confirmationDestination,
  normalizeCrPhone,
  reconcileSelection,
  toCrE164,
  validateDeliveryPayment,
  type CheckoutOptions,
  type DeliveryPaymentField,
  type DeliveryPaymentSelection,
  type FulfillmentType,
  type PaymentMethod,
  type PaymentTiming,
} from './delivery-payment';

export type { CartItem };
export type { CheckoutOptions, DeliveryPaymentSelection, FulfillmentType, PaymentMethod, PaymentTiming };

/** Paso del checkout Directo: primero entrega y pago (SPEC-023), después datos y resumen. */
export type CheckoutStep = 'delivery' | 'details';

export type CheckoutField = keyof CheckoutForm | DeliveryPaymentField;

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
  errors: Partial<Record<CheckoutField, string>>;
  /** Solo pedidos DIRECT; FINANCED es un formulario de un paso. */
  step: CheckoutStep;
  /** `undefined` mientras carga; `null` si la API no manda opciones (checkout de antes). */
  checkoutOptions: CheckoutOptions | null | undefined;
  /** El negocio no está recibiendo pedidos Directos: no se ofrece enviar. */
  directOrdersBlocked: boolean;
  selection: DeliveryPaymentSelection;
  fulfillmentChoices: FulfillmentType[];
  timingChoices: PaymentTiming[];
  methodChoices: PaymentMethod[];
  /** Los 8 dígitos locales del teléfono, sin el +506 que se muestra fijo. */
  phoneDigits: string;
  isSubmitting: boolean;
  submitError: string | null;
  showPrices: boolean;
  currency: 'USD' | 'CRC';
  isOnline: boolean;
  orderType: OrderType;
  hasBothOrderTypes: boolean;
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  onFieldChange: (field: keyof CheckoutForm, value: string) => void;
  onPhoneDigitsChange: (value: string) => void;
  onFulfillmentChange: (value: FulfillmentType) => void;
  onTimingChange: (value: PaymentTiming) => void;
  onMethodChange: (value: PaymentMethod) => void;
  /** Valida entrega y pago y pasa a los datos del pedido. */
  onContinue: () => void;
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

  // SPEC-023 (T074): opciones de entrega y pago que habilitó el negocio.
  const [checkoutOptions, setCheckoutOptions] = useState<CheckoutOptions | null | undefined>(undefined);
  const [selection, setSelection] = useState<DeliveryPaymentSelection>(EMPTY_SELECTION);
  const [step, setStep] = useState<CheckoutStep>('delivery');

  useEffect(() => {
    let cancelled = false;
    fetchCheckoutOptions(slug)
      .then((options) => {
        if (cancelled) return;
        setCheckoutOptions(options);
        if (options) setSelection((prev) => reconcileSelection(options, prev));
      })
      // Sin opciones el checkout sigue como antes de SPEC-023; el servidor decide.
      .catch(() => {
        if (!cancelled) setCheckoutOptions(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const subtotalNum = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const isDirect = orderType === 'DIRECT';
  const directOrdersBlocked = isDirect && checkoutOptions?.acceptsDirectOrders === false;
  const phoneDigits = normalizeCrPhone(form.phone);

  function onOrderTypeChange(type: OrderType) {
    setOrderType(type);
    setStep('delivery');
    setErrors({});
    setSubmitError(null);
  }

  function clearErrors(...fields: CheckoutField[]) {
    setErrors((prev) => {
      if (!fields.some((f) => prev[f])) return prev;
      const next = { ...prev };
      for (const f of fields) delete next[f];
      return next;
    });
  }

  function updateSelection(patch: Partial<DeliveryPaymentSelection>, cleared: CheckoutField[]) {
    setSelection((prev) => {
      const next = { ...prev, ...patch };
      return checkoutOptions ? reconcileSelection(checkoutOptions, next) : next;
    });
    clearErrors(...cleared);
  }

  function onFulfillmentChange(value: FulfillmentType) {
    updateSelection({ fulfillmentType: value }, ['fulfillmentType', 'deliveryAddress']);
  }

  function onTimingChange(value: PaymentTiming) {
    updateSelection({ paymentTiming: value }, ['paymentTiming', 'paymentMethod']);
  }

  function onMethodChange(value: PaymentMethod) {
    updateSelection({ paymentMethod: value }, ['paymentMethod']);
  }

  function onPhoneDigitsChange(value: string) {
    onFieldChange('phone', normalizeCrPhone(value));
  }

  function validateDeliveryStep(): Partial<Record<CheckoutField, string>> {
    return validateDeliveryPayment({
      options: checkoutOptions ?? null,
      selection,
      deliveryAddress: form.deliveryAddress,
      phoneDigits,
    });
  }

  function onContinue() {
    if (directOrdersBlocked || checkoutOptions === undefined) return;
    const errs = validateDeliveryStep();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep('details');
    window.scrollTo({ top: 0 });
  }

  function onFieldChange(field: keyof CheckoutForm, value: string) {
    editedFields.current.add(field);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<CheckoutField, string>> = {};
    if (!form.name.trim()) errs.name = 'Campo requerido';
    if (!form.email.trim()) {
      errs.email = 'Campo requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Correo inválido';
    }
    if (isDirect) {
      const deliveryErrs = validateDeliveryStep();
      Object.assign(errs, deliveryErrs);
      // Lo que falta está en el paso anterior: se vuelve ahí para que se vea el error.
      if (Object.keys(deliveryErrs).length > 0) setStep('delivery');
    } else {
      if (!form.phone.trim()) errs.phone = 'Campo requerido';
      if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Campo requerido';
      if (!form.affiliateNumber.trim()) errs.affiliateNumber = 'Campo requerido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function buildDirectFields() {
    // Pedido Directo: teléfono de Costa Rica normalizado (FR-012). Con opciones del negocio
    // viajan entrega y pago, y la dirección solo con envío (FR-011).
    if (!checkoutOptions) {
      return { visitorPhone: toCrE164(phoneDigits), deliveryAddress: form.deliveryAddress.trim() };
    }
    return {
      visitorPhone: toCrE164(phoneDigits),
      fulfillmentType: selection.fulfillmentType ?? undefined,
      paymentTiming: selection.paymentTiming ?? undefined,
      paymentMethod: selection.paymentMethod ?? undefined,
      deliveryAddress:
        selection.fulfillmentType === 'DELIVERY' ? form.deliveryAddress.trim() : undefined,
    };
  }

  function onSubmit() {
    if (directOrdersBlocked) return;
    if (isDirect && checkoutOptions === undefined) return;
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    submitOrder(slug, {
      orderType,
      visitorName: form.name.trim(),
      visitorEmail: form.email.trim(),
      ...(isDirect
        ? buildDirectFields()
        : {
            visitorPhone: form.phone.trim(),
            deliveryAddress: form.deliveryAddress.trim(),
            affiliateNumber: form.affiliateNumber.trim(),
          }),
      items: items.map((item) => ({
        productId: item.productId,
        variantValueIds: item.variantValueIds,
        quantity: item.quantity,
        customerNote: item.note,
      })),
    })
      .then((confirmation) => {
        // Este dispositivo ya interactuó con el negocio: a partir de acá se le puede ofrecer
        // volver a entrar a su cuenta, porque ya hay un pedido con el que la API responde.
        markKnownCustomer(slug);
        // SPEC-021: carry the noted lines to the confirmation screen before the cart is cleared
        const notedItems = items
          .filter((item) => item.note)
          .map((item) => ({
            productName: item.productName,
            variantLabel: item.variantLabel,
            note: item.note as string,
          }));
        // Vaciar el carrito es limpieza local y va DESPUÉS de que el pedido ya existe en el
        // servidor. Si IndexedDB falla (modo privado, cuota, Safari en PWA instalada), este
        // `.catch` es lo único que impide mostrar "no se pudo enviar el pedido" por un pedido
        // que sí se envió — y dejar a la persona reintentando y duplicándolo.
        return clearCart(slug)
          .catch(() => undefined)
          .then(() => ({ notedItems, confirmation }));
      })
      .then(({ notedItems, confirmation }) => {
        const email = form.email.trim();
        const destination = confirmationDestination(confirmation);
        // SPEC-023 (T075): el pedido Directo aterriza en su página de seguimiento, que
        // sobrevive a recargas al volver de WhatsApp. Se reemplaza el historial para que
        // "atrás" no reabra un checkout ya enviado.
        if (destination.kind === 'tracking') {
          void navigate(destination.path, {
            replace: true,
            state: { orderId: confirmation.orderId, email },
          });
          return;
        }
        // FINANCED, o una API que todavía no manda token: la confirmación de siempre.
        // SPEC-022: the order anchors the account offer to this business, and the email is
        // the one the shopper just typed — no extra data is asked for (FR-006).
        void navigate(destination.path, {
          replace: true,
          state: { notedItems, orderId: confirmation.orderId, email },
        });
      })
      .catch((err: unknown) => {
        // Un 4xx trae un motivo redactado por la API y accionable por quien compra (el módulo
        // está apagado, faltó un dato). Un 5xx no le dice nada: ahí el modal de reporte ya se
        // abrió solo desde `publicFetch`, y este texto solo acompaña.
        const reason =
          err instanceof ApiError && err.status < 500 && !err.message.startsWith('Request failed')
            ? err.message
            : null;
        setSubmitError(reason ?? 'No se pudo enviar el pedido. Intentá nuevamente.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function onBack() {
    if (isDirect && step === 'details') {
      setStep('delivery');
      window.scrollTo({ top: 0 });
      return;
    }
    void navigate(-1);
  }

  const currency = branding.currency ?? 'CRC';

  return {
    items,
    total: formatPrice(subtotalNum, currency),
    form,
    errors,
    step: isDirect ? step : 'details',
    checkoutOptions,
    directOrdersBlocked,
    selection,
    fulfillmentChoices: checkoutOptions ? availableFulfillmentTypes(checkoutOptions) : [],
    timingChoices: checkoutOptions ? availableTimings(checkoutOptions) : [],
    methodChoices: checkoutOptions ? availableMethods(checkoutOptions, selection.paymentTiming) : [],
    phoneDigits,
    isSubmitting,
    submitError,
    showPrices: branding.showPrices ?? false,
    currency,
    isOnline,
    orderType,
    hasBothOrderTypes: branding.orderType === 'BOTH',
    businessModel: branding.businessModel,
    onFieldChange,
    onPhoneDigitsChange,
    onFulfillmentChange,
    onTimingChange,
    onMethodChange,
    onContinue,
    onOrderTypeChange,
    onSubmit,
    onBack,
  };
}
