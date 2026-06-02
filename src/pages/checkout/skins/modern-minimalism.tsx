import React from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
import type { CheckoutPageProps } from '../useCheckoutPage';

/* ── Skin ───────────────────────────────────────────────────────────────── */

const ModernMinimalismCheckoutSkin: React.FC<CheckoutPageProps> = ({
  items,
  total,
  form,
  errors,
  isSubmitting,
  submitError,
  showPrices,
  isOnline,
  orderType,
  hasBothOrderTypes,
  onFieldChange,
  onOrderTypeChange,
  onSubmit,
  onBack,
}) => {
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--pwa-bg)' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontSize: '1rem', color: 'var(--pwa-text-secondary)', marginBottom: '16px' }}>
            Tu carrito está vacío
          </p>
          <button type="button" onClick={onBack} style={{ fontSize: '14px', color: 'var(--pwa-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  /* ── Input style — standard bordered */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--pwa-surface)',
    border: '1px solid var(--pwa-border)',
    borderRadius: 'var(--pwa-radius-sm)',
    outline: 'none',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'var(--pwa-font-body)',
    color: 'var(--pwa-text)',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--pwa-text)',
    display: 'block',
    marginBottom: '6px',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const { isMobile } = useTheme();

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
          gap: '12px',
          padding: '0 16px',
          height: '56px',
          borderBottom: '1px solid var(--pwa-border)',
          backgroundColor: 'var(--pwa-bg)',
        }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{ color: 'var(--pwa-text)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--pwa-text)', margin: 0 }}>
            Checkout
          </h1>
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 88px' }}>

        {!isOnline && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: 'var(--pwa-radius-sm)', backgroundColor: 'var(--pwa-warning-bg)', border: '1px solid var(--pwa-warning-text)', fontSize: '13px', color: 'var(--pwa-warning-text)' }}>
            Sin conexión — tu pedido no puede enviarse ahora.
          </div>
        )}

        {/* Order type selector */}
        {hasBothOrderTypes && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', padding: '4px', backgroundColor: 'var(--pwa-surface-secondary)', borderRadius: 'var(--pwa-radius-sm)', border: '1px solid var(--pwa-border)' }}>
            {(['DIRECT', 'FINANCED'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onOrderTypeChange(type)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: orderType === type ? 'var(--pwa-accent)' : 'transparent',
                  color: orderType === type ? 'var(--pwa-on-accent)' : 'var(--pwa-text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--pwa-radius-sm)',
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--pwa-motion)',
                }}
              >
                {type === 'DIRECT' ? 'Pedido directo' : 'Pedido por envío'}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Contact section */}
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pwa-text-secondary)', marginBottom: '16px', padding: '0 0 8px', borderBottom: '1px solid var(--pwa-border)' }}>
              Datos de contacto
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Nombre completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  autoComplete="name"
                  placeholder="Tu nombre completo"
                  style={{ ...inputStyle, borderColor: errors.name ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
                />
                {errors.name && <p style={{ fontSize: '12px', color: 'var(--pwa-error)', margin: 0 }}>{errors.name}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Teléfono *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  autoComplete="tel"
                  placeholder="+506 8888 0000"
                  style={{ ...inputStyle, borderColor: errors.phone ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
                />
                {errors.phone && <p style={{ fontSize: '12px', color: 'var(--pwa-error)', margin: 0 }}>{errors.phone}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Correo electrónico *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  style={{ ...inputStyle, borderColor: errors.email ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
                />
                {errors.email && <p style={{ fontSize: '12px', color: 'var(--pwa-error)', margin: 0 }}>{errors.email}</p>}
              </div>
            </div>
          </section>

          {/* Delivery section */}
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pwa-text-secondary)', marginBottom: '16px', padding: '0 0 8px', borderBottom: '1px solid var(--pwa-border)' }}>
              Entrega
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Dirección *</label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={(e) => onFieldChange('deliveryAddress', e.target.value)}
                  rows={3}
                  placeholder="Dirección de entrega o indicaciones"
                  autoComplete="street-address"
                  style={{ ...inputStyle, resize: 'none', borderColor: errors.deliveryAddress ? 'var(--pwa-error)' : 'var(--pwa-border)' }}
                />
                {errors.deliveryAddress && <p style={{ fontSize: '12px', color: 'var(--pwa-error)', margin: 0 }}>{errors.deliveryAddress}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Notas adicionales</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => onFieldChange('notes', e.target.value)}
                  rows={2}
                  placeholder="Instrucciones especiales (opcional)"
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>
          </section>

          {/* Order summary */}
          {showPrices && (
            <section>
              <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pwa-text-secondary)', marginBottom: '16px', padding: '0 0 8px', borderBottom: '1px solid var(--pwa-border)' }}>
                Resumen del pedido
              </h2>
              <div style={{
                backgroundColor: 'var(--pwa-surface-secondary)',
                border: '1px solid var(--pwa-border)',
                borderRadius: 'var(--pwa-radius-md)',
                padding: '16px',
              }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--pwa-text)', flex: 1 }}>
                      <span style={{ fontWeight: 500 }}>{item.productName}</span>
                      {item.variantValueName && (
                        <span style={{ color: 'var(--pwa-text-secondary)' }}> ({item.variantValueName})</span>
                      )}
                      <span style={{ color: 'var(--pwa-text-secondary)' }}> × {item.quantity}</span>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--pwa-text)', flexShrink: 0 }}>
                      ₡{(item.unitPrice * item.quantity).toLocaleString('es-CR')}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--pwa-border)', marginTop: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pwa-text)' }}>Total</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pwa-accent)' }}>{total}</span>
                </div>
              </div>
            </section>
          )}

          {submitError && (
            <p style={{ fontSize: '14px', color: 'var(--pwa-error)', margin: 0 }}>{submitError}</p>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'var(--pwa-accent)',
              color: 'var(--pwa-on-accent)',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--pwa-font-body)',
              borderRadius: 'var(--pwa-radius-button)',
              border: 'none',
              cursor: isSubmitting || !isOnline ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !isOnline ? 0.5 : 1,
            }}
          >
            {isSubmitting ? 'Enviando…' : 'Confirmar pedido'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ModernMinimalismCheckoutSkin;
