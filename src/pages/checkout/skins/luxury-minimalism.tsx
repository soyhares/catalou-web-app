import React from 'react';
import type { CheckoutPageProps } from '../useCheckoutPage';

/* ── Skin ───────────────────────────────────────────────────────────────── */

const LuxuryMinimalismCheckoutSkin: React.FC<CheckoutPageProps> = ({
  items,
  total,
  form,
  errors,
  isSubmitting,
  submitError,
  showPrices,
  isOnline,
  onFieldChange,
  onSubmit,
  onBack,
}) => {
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--pwa-bg)' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--pwa-text)', opacity: 0.5, marginBottom: '20px' }}>
            Tu carrito está vacío
          </p>
          <button type="button" onClick={onBack} style={{ fontSize: '10px', color: 'var(--pwa-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  /* ── Label style */
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--pwa-font-heading)',
    fontStyle: 'italic',
    fontSize: '0.85rem',
    color: 'var(--pwa-text-secondary)',
    display: 'block',
    marginBottom: '6px',
  };

  /* ── Input style — border-bottom only, no box */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--pwa-border)',
    outline: 'none',
    padding: '8px 0',
    fontSize: '1rem',
    fontFamily: 'var(--pwa-font-body)',
    color: 'var(--pwa-text)',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)' }}>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '56px',
        borderBottom: '1px solid var(--pwa-border)',
        backgroundColor: 'var(--pwa-bg)',
      }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          style={{ color: 'var(--pwa-text)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontStyle: 'italic',
          fontSize: '1.1rem',
          color: 'var(--pwa-text)',
          margin: 0,
          fontWeight: 400,
        }}>
          Reserva tu pedido
        </h1>
        <span style={{ width: '24px' }} />
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px 48px' }}>

        {!isOnline && (
          <div style={{ marginBottom: '24px', padding: '12px 16px', borderRadius: '4px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '13px', color: '#92400E' }}>
            Sin conexión — tu pedido no puede enviarse ahora.
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
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
              style={{ ...inputStyle, borderBottomColor: errors.name ? '#EF4444' : 'var(--pwa-border)' }}
            />
            {errors.name && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.name}</p>}
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
              style={{ ...inputStyle, borderBottomColor: errors.phone ? '#EF4444' : 'var(--pwa-border)' }}
            />
            {errors.phone && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.phone}</p>}
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
              style={{ ...inputStyle, borderBottomColor: errors.email ? '#EF4444' : 'var(--pwa-border)' }}
            />
            {errors.email && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.email}</p>}
          </div>

          {/* Delivery address */}
          <div>
            <label style={labelStyle}>Dirección de entrega *</label>
            <textarea
              value={form.deliveryAddress}
              onChange={(e) => onFieldChange('deliveryAddress', e.target.value)}
              rows={2}
              placeholder="Dirección o indicaciones"
              style={{ ...inputStyle, resize: 'none', borderBottomColor: errors.deliveryAddress ? '#EF4444' : 'var(--pwa-border)' }}
            />
            {errors.deliveryAddress && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.deliveryAddress}</p>}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notas adicionales</label>
            <textarea
              value={form.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              rows={2}
              placeholder="Instrucciones especiales (opcional)"
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Order summary */}
          {showPrices && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--pwa-border)' }}>
              <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--pwa-text-secondary)', marginBottom: '12px' }}>
                Resumen
              </p>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--pwa-text)', opacity: 0.7 }}>
                    {item.productName} × {item.quantity}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--pwa-text)' }}>
                    ₡{(item.unitPrice * item.quantity).toLocaleString('es-CR')}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--pwa-accent)', marginTop: '8px' }}>
                <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--pwa-text)' }}>Total</span>
                <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--pwa-accent)' }}>{total}</span>
              </div>
            </div>
          )}

          {submitError && (
            <p style={{ fontSize: '13px', color: '#EF4444' }}>{submitError}</p>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--pwa-accent)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--pwa-font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              borderRadius: 'var(--pwa-radius-button)',
              border: 'none',
              cursor: isSubmitting || !isOnline ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !isOnline ? 0.5 : 1,
            }}
          >
            {isSubmitting ? 'Enviando…' : 'Confirmar'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default LuxuryMinimalismCheckoutSkin;
