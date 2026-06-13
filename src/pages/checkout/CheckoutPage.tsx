import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBranding } from '@app/BrandingContext';
import { useCart } from '@shared/lib/use-cart';
import { clearCart } from '@shared/lib/cart-store';
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { submitOrder, type OrderType } from '@entities/order/api';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';

type Step = 'type' | 'form';

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PageHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <header
      className="sticky top-0 z-10 px-4 h-14 flex items-center gap-3 border-b"
      style={{ backgroundColor: 'var(--pwa-surface)', borderColor: 'var(--pwa-border)' }}
    >
      <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:opacity-80 transition-opacity" style={{ color: 'var(--pwa-text)' }}>
        <BackArrow />
      </button>
      <h1 className="text-base font-semibold" style={{ color: 'var(--pwa-text)' }}>{title}</h1>
    </header>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface StepIndicatorProps {
  currentStep: Step;
  hasBothOrderTypes: boolean;
}

function StepIndicator({ currentStep, hasBothOrderTypes }: StepIndicatorProps) {
  const steps = hasBothOrderTypes
    ? [{ id: 'type', label: 'Tipo' }, { id: 'form', label: 'Datos' }, { id: 'done', label: 'Listo' }]
    : [{ id: 'form', label: 'Datos' }, { id: 'done', label: 'Listo' }];

  const activeIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  backgroundColor: isDone ? 'var(--pwa-accent)' : isActive ? 'var(--pwa-accent)' : 'var(--pwa-border)',
                  color: isDone || isActive ? '#ffffff' : 'var(--pwa-text-secondary)',
                  opacity: isDone || isActive ? 1 : 0.5,
                }}
              >
                {isDone ? <CheckIcon /> : <span>{i + 1}</span>}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)', opacity: isActive ? 1 : 0.6 }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`checkout-step-connector${i < activeIndex ? ' checkout-step-connector--active' : ''}`}
                style={{ marginTop: '-16px' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--pwa-text)' }}>
        {label}{required && <span style={{ color: 'var(--pwa-accent)' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4V6.5M6 8.5H6.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { branding, slug } = useBranding();
  const { items } = useCart(slug);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const [step, setStep] = useState<Step>(branding.orderType === 'BOTH' ? 'type' : 'form');
  const [selectedType, setSelectedType] = useState<OrderType>('DIRECT');
  const orderType: OrderType = branding.orderType === 'BOTH' ? selectedType : branding.orderType;
  const businessModel = branding.businessModel ?? 'DIRECT';
  const [visitorName, setVisitorName] = useState('');
  const [affiliateNumber, setAffiliateNumber] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--pwa-bg)' }}>
        <div className="text-center px-4">
          <p className="mb-4" style={{ color: 'var(--pwa-text)', opacity: 0.7 }}>{t('checkout.emptyCart')}</p>
          <button type="button" onClick={() => navigate('/')} className="text-sm underline" style={{ color: 'var(--pwa-accent)' }}>
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
    if (orderType === 'FINANCED' && !affiliateNumber.trim()) {
      errs.affiliateNumber = t('checkout.errorRequired');
    }
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
        affiliateNumber: orderType === 'FINANCED' ? affiliateNumber.trim() : undefined,
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

  /* ── Step 1: order type ── */
  if (step === 'type') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }}>
        <PageHeader onBack={() => navigate('/cart')} title={t('checkout.paymentMethod')} />
        <main className="max-w-lg mx-auto px-4 py-6">
          <StepIndicator currentStep="type" hasBothOrderTypes />
          <p className="text-sm mb-4" style={{ color: 'var(--pwa-text-secondary)' }}>
            ¿Cómo quieres realizar tu pedido?
          </p>
          <div className="flex flex-col gap-3">
            {[
              { type: 'DIRECT' as OrderType, title: t('checkout.direct'), desc: t('checkout.directDesc'), icon: '→' },
              { type: 'FINANCED' as OrderType, title: `${t('checkout.associated')} — ${branding.associationName ?? t('checkout.association')}`, desc: t('checkout.associatedDesc'), icon: '◇' },
            ].map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => { setSelectedType(opt.type); setStep('form'); }}
                className="w-full text-left rounded-xl p-4 border-2 transition-all hover:opacity-90"
                style={{
                  borderColor: selectedType === opt.type ? 'var(--pwa-accent)' : 'var(--pwa-border)',
                  backgroundColor: selectedType === opt.type ? 'color-mix(in srgb, var(--pwa-accent) 8%, transparent)' : 'var(--pwa-surface)',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--pwa-text)' }}>{opt.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--pwa-text-secondary)' }}>{opt.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  /* ── Step 2: form ── */
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pwa-bg)' }}>
      <PageHeader
        onBack={() => branding.orderType === 'BOTH' ? setStep('type') : navigate('/cart')}
        title={t('checkout.yourData')}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        <StepIndicator currentStep="form" hasBothOrderTypes={branding.orderType === 'BOTH'} />

        {!isOnline && (
          <div className="mb-5 px-4 py-3 rounded-xl border text-sm" style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)', color: '#92400E' }}>
            {t('checkout.offlineWarning')}
          </div>
        )}

        <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
          {/* Contact section */}
          <div
            className="rounded-xl border overflow-hidden mb-4"
            style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface-secondary)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pwa-text-secondary)' }}>Datos de contacto</p>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <FormField label={t('checkout.name')} error={errors.visitorName} required>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className={`pwa-input${errors.visitorName ? ' pwa-input--error' : ''}`}
                  autoComplete="name"
                  placeholder="Tu nombre completo"
                />
              </FormField>
              <FormField label={t('checkout.phone')} error={errors.visitorPhone} required>
                <input
                  type="tel"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className={`pwa-input${errors.visitorPhone ? ' pwa-input--error' : ''}`}
                  autoComplete="tel"
                  placeholder="+506 8888 0000"
                />
              </FormField>
              <FormField label={t('checkout.email')} error={errors.visitorEmail} required>
                <input
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className={`pwa-input${errors.visitorEmail ? ' pwa-input--error' : ''}`}
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                />
              </FormField>
              {orderType === 'FINANCED' && (
                <FormField label={t('checkout.affiliateNumber')} error={errors.affiliateNumber} required>
                  <input
                    type="text"
                    value={affiliateNumber}
                    onChange={(e) => setAffiliateNumber(e.target.value)}
                    className={`pwa-input${errors.affiliateNumber ? ' pwa-input--error' : ''}`}
                    placeholder={t('checkout.affiliateNumberPlaceholder')}
                  />
                </FormField>
              )}
            </div>
          </div>

          {/* Delivery section */}
          <div
            className="rounded-xl border overflow-hidden mb-4"
            style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface-secondary)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pwa-text-secondary)' }}>Entrega</p>
            </div>
            <div className="p-4">
              <FormField label={t('checkout.deliveryAddress')} error={errors.deliveryAddress} required>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className={`pwa-input${errors.deliveryAddress ? ' pwa-input--error' : ''}`}
                  style={{ resize: 'none' }}
                  autoComplete="street-address"
                  placeholder="Dirección de entrega o indicaciones"
                />
              </FormField>
            </div>
          </div>

          {/* Order summary */}
          <div
            className="rounded-xl border overflow-hidden mb-6"
            style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface-secondary)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pwa-text-secondary)' }}>{t('checkout.orderSummary')}</p>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm gap-4">
                  <span style={{ color: 'var(--pwa-text)' }} className="flex-1 min-w-0">
                    <span className="font-medium">{item.productName}</span>
                    {item.variantValueName ? <span style={{ color: 'var(--pwa-text-secondary)' }}> ({item.variantValueName})</span> : ''}
                    <span style={{ color: 'var(--pwa-text-secondary)' }}> × {item.quantity}</span>
                  </span>
                  {branding.showPrices && (
                    <span className="font-semibold shrink-0" style={{ color: 'var(--pwa-text)' }}>
                      {formatPrice(item.unitPrice * item.quantity, branding.currency ?? 'CRC')}
                    </span>
                  )}
                </div>
              ))}
              {branding.showPrices && (
                <div className="flex justify-between font-bold text-base border-t pt-3 mt-1" style={{ borderColor: 'var(--pwa-border)', color: 'var(--pwa-text)' }}>
                  <span>{t('checkout.total')}</span>
                  <span style={{ color: 'var(--pwa-accent)' }}>{formatPrice(subtotal, branding.currency ?? 'CRC')}</span>
                </div>
              )}
              {branding.showPrices && businessModel === 'ASSOCIATED' && (
                <PriceDisclaimer className="mt-3" />
              )}
            </div>
          </div>

          {submitError && (
            <p className="mb-4 text-sm text-red-600">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !isOnline}
            className="w-full py-4 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--pwa-accent)',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {t('checkout.submitting')}
              </span>
            ) : t('checkout.submit')}
          </button>
        </form>
      </main>
    </div>
  );
}
