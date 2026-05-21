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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--pwa-bg)' }}
      >
        <div className="text-center px-4">
          <p className="mb-4" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>
            {t('checkout.emptyCart')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm underline"
            style={{ color: 'var(--pwa-accent)' }}
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }}>
        <header
          className="border-b px-4 py-4"
          style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
        >
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="text-sm hover:opacity-80"
            style={{ color: 'var(--pwa-text)' }}
          >
            ← {t('checkout.backToCart')}
          </button>
          <h1 className="mt-2 text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
            {t('checkout.paymentMethod')}
          </h1>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <button
            type="button"
            onClick={() => {
              setSelectedType('DIRECT');
              setStep('form');
            }}
            className="w-full border rounded-lg p-4 text-left hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('checkout.direct')}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
              {t('checkout.directDesc')}
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedType('FINANCED');
              setStep('form');
            }}
            className="w-full border rounded-lg p-4 text-left hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('checkout.financed')} — {branding.associationName ?? t('checkout.association')}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--pwa-text)', opacity: 0.6 }}>
              {t('checkout.financedDesc')}
            </p>
          </button>
        </main>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const inputClass = "w-full border rounded px-3 py-2 text-sm focus:outline-none";

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <header
        className="border-b px-4 py-4"
        style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
      >
        <button
          type="button"
          onClick={() =>
            branding.orderType === 'BOTH' ? setStep('type') : navigate('/cart')
          }
          className="text-sm hover:opacity-80"
          style={{ color: 'var(--pwa-text)' }}
        >
          ← {t('checkout.back')}
        </button>
        <h1 className="mt-2 text-lg font-semibold" style={{ color: 'var(--pwa-text)' }}>
          {t('checkout.yourData')}
        </h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!isOnline && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            {t('checkout.offlineWarning')}
          </div>
        )}

        <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pwa-text)' }}>
                {t('checkout.name')} *
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className={inputClass}
                style={{
                  borderColor: errors.visitorName ? '#EF4444' : 'var(--pwa-border)',
                  backgroundColor: 'var(--pwa-surface)',
                  color: 'var(--pwa-text)',
                }}
                autoComplete="name"
              />
              {errors.visitorName && (
                <p className="mt-1 text-xs text-red-500">{errors.visitorName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pwa-text)' }}>
                {t('checkout.phone')} *
              </label>
              <input
                type="tel"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                className={inputClass}
                style={{
                  borderColor: errors.visitorPhone ? '#EF4444' : 'var(--pwa-border)',
                  backgroundColor: 'var(--pwa-surface)',
                  color: 'var(--pwa-text)',
                }}
                autoComplete="tel"
              />
              {errors.visitorPhone && (
                <p className="mt-1 text-xs text-red-500">{errors.visitorPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pwa-text)' }}>
                {t('checkout.email')} *
              </label>
              <input
                type="email"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className={inputClass}
                style={{
                  borderColor: errors.visitorEmail ? '#EF4444' : 'var(--pwa-border)',
                  backgroundColor: 'var(--pwa-surface)',
                  color: 'var(--pwa-text)',
                }}
                autoComplete="email"
              />
              {errors.visitorEmail && (
                <p className="mt-1 text-xs text-red-500">{errors.visitorEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--pwa-text)' }}>
                {t('checkout.deliveryAddress')} *
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                style={{
                  borderColor: errors.deliveryAddress ? '#EF4444' : 'var(--pwa-border)',
                  backgroundColor: 'var(--pwa-surface)',
                  color: 'var(--pwa-text)',
                }}
                autoComplete="street-address"
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-xs text-red-500">{errors.deliveryAddress}</p>
              )}
            </div>
          </div>

          <div
            className="mt-6 border rounded-lg p-4 space-y-2"
            style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--pwa-text)' }}>
              {t('checkout.orderSummary')}
            </p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
                style={{ color: 'var(--pwa-text)', opacity: 0.8 }}
              >
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
              <div
                className="flex justify-between font-semibold border-t pt-2"
                style={{ borderColor: 'var(--pwa-border)', color: 'var(--pwa-text)' }}
              >
                <span>{t('checkout.total')}</span>
                <span>₡{subtotal.toLocaleString('es-CR')}</span>
              </div>
            )}
          </div>

          {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting || !isOnline}
            className="mt-6 w-full py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--pwa-accent)',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            {submitting ? t('checkout.submitting') : t('checkout.submit')}
          </button>
        </form>
      </main>
    </div>
  );
}
