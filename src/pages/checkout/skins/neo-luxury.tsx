import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { CheckoutPageProps } from '../useCheckoutPage';

/* ── Skin ───────────────────────────────────────────────────────────────── */

const NeoLuxuryCheckoutSkin: React.FC<CheckoutPageProps> = ({
  items,
  total,
  form,
  errors,
  isSubmitting,
  submitError,
  showPrices,
  currency,
  isOnline,
  orderType,
  hasBothOrderTypes,
  businessModel,
  onFieldChange,
  onOrderTypeChange,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useTheme();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--pwa-bg)' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1.2rem', color: 'var(--pwa-text)', opacity: 0.5, marginBottom: '20px' }}>
            Tu carrito está vacío
          </p>
          <button type="button" onClick={onBack} style={{ fontSize: '11px', color: 'var(--pwa-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  /* ── Input style — dark with accent border */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--pwa-bg)',
    border: '1px solid var(--pwa-border)',
    borderRadius: 'var(--pwa-radius-sm)',
    outline: 'none',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: 'var(--pwa-font-body)',
    color: 'var(--pwa-text)',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--pwa-text-secondary)',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)' }}>

      {/* Header — mobile only; desktop nav handled by global TopBar */}
      {isMobile ? (
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '60px',
          borderBottom: '1px solid var(--pwa-border)',
          backgroundColor: 'var(--pwa-card)',
        }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{ color: 'var(--pwa-text)', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{
            background: 'linear-gradient(135deg, var(--pwa-accent), var(--pwa-text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            margin: 0,
          }}>
            Confirma tu orden
          </h1>
          <span style={{ width: '24px' }} />
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '24px 20px 88px' }}>

        {!isOnline && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: 'var(--pwa-radius-sm)', backgroundColor: 'var(--pwa-warning-bg)', border: '1px solid var(--pwa-warning-text)', fontSize: '13px', color: 'var(--pwa-warning-text)' }}>
            Sin conexión — tu pedido no puede enviarse.
          </div>
        )}

        {/* Order type selector */}
        {hasBothOrderTypes && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
            {(['DIRECT', 'FINANCED'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onOrderTypeChange(type)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  backgroundColor: orderType === type ? 'var(--pwa-accent)' : 'var(--pwa-bg)',
                  color: orderType === type ? 'var(--pwa-on-accent)' : 'var(--pwa-text-secondary)',
                  border: '1px solid',
                  borderColor: orderType === type ? 'var(--pwa-accent)' : 'var(--pwa-border)',
                  borderRadius: 'var(--pwa-radius-sm)',
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  boxShadow: orderType === type ? '0 0 12px var(--pwa-accent)' : 'none',
                  transition: 'all var(--pwa-motion)',
                }}
              >
                {type === 'DIRECT' ? t('checkout.direct') : t('checkout.associated')}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Name */}
          <div>
            <label style={labelStyle}>Nombre completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              autoComplete="name"
              placeholder="Tu nombre"
              style={{ ...inputStyle, borderColor: errors.name ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
            />
            {errors.name && <p style={{ fontSize: '11px', color: 'var(--pwa-error)', marginTop: '4px' }}>{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Teléfono *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              autoComplete="tel"
              placeholder="+506 8888 0000"
              style={{ ...inputStyle, borderColor: errors.phone ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
            />
            {errors.phone && <p style={{ fontSize: '11px', color: 'var(--pwa-error)', marginTop: '4px' }}>{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Correo electrónico *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              style={{ ...inputStyle, borderColor: errors.email ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
            />
            {errors.email && <p style={{ fontSize: '11px', color: 'var(--pwa-error)', marginTop: '4px' }}>{errors.email}</p>}
          </div>

          {/* Delivery address */}
          <div>
            <label style={labelStyle}>Dirección de entrega *</label>
            <textarea
              value={form.deliveryAddress}
              onChange={(e) => onFieldChange('deliveryAddress', e.target.value)}
              rows={3}
              placeholder="Dirección o indicaciones"
              style={{ ...inputStyle, resize: 'none', borderColor: errors.deliveryAddress ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
            />
            {errors.deliveryAddress && <p style={{ fontSize: '11px', color: 'var(--pwa-error)', marginTop: '4px' }}>{errors.deliveryAddress}</p>}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              rows={2}
              placeholder="Instrucciones especiales (opcional)"
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Affiliate number — only for FINANCED orders */}
          {orderType === 'FINANCED' && (
            <div>
              <label style={labelStyle}>{t('checkout.affiliateNumber')} *</label>
              <input
                type="text"
                value={form.affiliateNumber}
                onChange={(e) => onFieldChange('affiliateNumber', e.target.value)}
                placeholder={t('checkout.affiliateNumberPlaceholder')}
                style={{ ...inputStyle, borderColor: errors.affiliateNumber ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
              />
              {errors.affiliateNumber && (
                <p style={{ fontSize: '11px', color: 'var(--pwa-error)', marginTop: '4px' }}>{errors.affiliateNumber}</p>
              )}
            </div>
          )}

          {/* Order summary */}
          {showPrices && (
            <div style={{
              backgroundColor: 'var(--pwa-card)',
              border: '1px solid var(--pwa-border)',
              borderRadius: 'var(--pwa-radius-md)',
              padding: '16px',
              marginTop: '8px',
            }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--pwa-text-secondary)', marginBottom: '12px', margin: '0 0 12px' }}>
                Resumen del pedido
              </p>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--pwa-text)', opacity: 0.8 }}>
                    {item.productName} × {item.quantity}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--pwa-text)' }}>
                    {formatPrice(item.unitPrice * item.quantity, currency)}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--pwa-border)', marginTop: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pwa-text)' }}>Total</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pwa-accent)', textShadow: '0 0 8px var(--pwa-accent)' }}>{total}</span>
              </div>
            </div>
          )}
          {showPrices && businessModel === 'ASSOCIATED' && (
            <PriceDisclaimer className="mt-2" />
          )}

          {submitError && (
            <p style={{ fontSize: '13px', color: 'var(--pwa-error)' }}>{submitError}</p>
          )}

          {/* Futuristic CTA with glow */}
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--pwa-accent)',
              color: 'var(--pwa-on-accent)',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--pwa-font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              borderRadius: 'var(--pwa-radius-button)',
              border: 'none',
              cursor: isSubmitting || !isOnline ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !isOnline ? 0.5 : 1,
              boxShadow: isSubmitting || !isOnline ? 'none' : '0 0 20px var(--pwa-accent)',
            }}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar pedido'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default NeoLuxuryCheckoutSkin;
