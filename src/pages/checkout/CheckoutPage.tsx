import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { submitOrder, type OrderType } from '@entities/order/api';

type Step = 'type' | 'form';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { branding, slug } = useBranding();
  const { items } = useCart(slug);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const [step, setStep] = useState<Step>(branding.orderType === 'BOTH' ? 'type' : 'form');
  // Only tracked as state when BOTH; otherwise the company's configured type is used directly.
  const [selectedType, setSelectedType] = useState<OrderType>('DIRECT');
  const orderType: OrderType = branding.orderType === 'BOTH' ? selectedType : branding.orderType;
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <p className="text-gray-600 mb-4">{t('checkout.emptyCart')}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm underline text-gray-700"
          >
            {t('checkout.backToCatalog')}
          </button>
        </div>
      </div>
    );
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!visitorName.trim()) errs.visitorName = t('checkout.errorRequired');
    if (!visitorPhone.trim()) errs.visitorPhone = t('checkout.errorRequired');
    if (!visitorEmail.trim()) {
      errs.visitorEmail = t('checkout.errorRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
      errs.visitorEmail = t('checkout.errorEmail');
    }
    if (!deliveryAddress.trim()) errs.deliveryAddress = t('checkout.errorRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await submitOrder(slug, {
        orderType,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        visitorEmail: visitorEmail.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          variantValueId: item.variantValueId,
          quantity: item.quantity,
        })),
      });
      await clearCart(slug);
      navigate('/order-confirmed', { replace: true });
    } catch {
      setSubmitError(t('checkout.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'type') {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="text-sm text-gray-600"
          >
            ← {t('checkout.backToCart')}
          </button>
          <h1 className="mt-2 text-lg font-semibold">{t('checkout.paymentMethod')}</h1>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <button
            type="button"
            onClick={() => {
              setSelectedType('DIRECT');
              setStep('form');
            }}
            className="w-full border rounded-lg p-4 text-left hover:bg-gray-50"
          >
            <p className="font-semibold">{t('checkout.direct')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('checkout.directDesc')}</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedType('FINANCED');
              setStep('form');
            }}
            className="w-full border rounded-lg p-4 text-left hover:bg-gray-50"
          >
            <p className="font-semibold">
              {t('checkout.financed')} —{' '}
              {branding.associationName ?? t('checkout.association')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t('checkout.financedDesc')}</p>
          </button>
        </main>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-4 py-4">
        <button
          type="button"
          onClick={() =>
            branding.orderType === 'BOTH' ? setStep('type') : navigate('/cart')
          }
          className="text-sm text-gray-600"
        >
          ← {t('checkout.back')}
        </button>
        <h1 className="mt-2 text-lg font-semibold">{t('checkout.yourData')}</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!isOnline && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            {t('checkout.offlineWarning')}
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          noValidate
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.name')} *
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 ${
                  errors.visitorName ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="name"
              />
              {errors.visitorName && (
                <p className="mt-1 text-xs text-red-500">{errors.visitorName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.phone')} *
              </label>
              <input
                type="tel"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 ${
                  errors.visitorPhone ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="tel"
              />
              {errors.visitorPhone && (
                <p className="mt-1 text-xs text-red-500">{errors.visitorPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.email')} *
              </label>
              <input
                type="email"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 ${
                  errors.visitorEmail ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="email"
              />
              {errors.visitorEmail && (
                <p className="mt-1 text-xs text-red-500">{errors.visitorEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.deliveryAddress')} *
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none ${
                  errors.deliveryAddress ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="street-address"
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-xs text-red-500">{errors.deliveryAddress}</p>
              )}
            </div>
          </div>

          <div className="mt-6 border rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('checkout.orderSummary')}</p>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>
                  {item.productName}
                  {item.variantValueName ? ` (${item.variantValueName})` : ''} × {item.quantity}
                </span>
                {branding.showPrices && (
                  <span>₡{(item.unitPrice * item.quantity).toLocaleString('es-CR')}</span>
                )}
              </div>
            ))}
            {branding.showPrices && (
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>{t('checkout.total')}</span>
                <span>₡{subtotal.toLocaleString('es-CR')}</span>
              </div>
            )}
          </div>

          {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting || !isOnline}
            className="mt-6 w-full py-3 rounded bg-gray-900 text-white font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('checkout.submitting') : t('checkout.submit')}
          </button>
        </form>
      </main>
    </div>
  );
}
