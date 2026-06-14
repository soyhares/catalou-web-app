import React from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import { PriceDisclaimer } from '@shared/ui';
import type { CartPageProps } from '../useCartPage';

/* ── Icons ──────────────────────────────────────────────────────────────── */

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2V8M2 5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconRemove() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const NeoLuxuryCartSkin: React.FC<CartPageProps> = ({
  items,
  total,
  showPrices,
  currency,
  businessModel,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
  onBack,
}) => {
  const { isMobile } = useTheme();
  const isEmpty = items.length === 0;

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
            <IconChevronLeft />
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
            Tu carrito
          </h1>

          {!isEmpty ? (
            <button
              type="button"
              onClick={onClear}
              style={{
                fontSize: '9px',
                color: 'var(--pwa-text-secondary)',
                opacity: 0.6,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Vaciar
            </button>
          ) : (
            <span style={{ width: '40px' }} />
          )}
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '24px 20px 88px' }}>
        {isEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ color: 'var(--pwa-accent)', opacity: 0.2, marginBottom: '24px' }}>
              <rect x="6" y="16" width="36" height="26" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M16 16V13C16 9.13 19.13 6 23 6C26.87 6 30 9.13 30 13V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: '1.2rem',
              color: 'var(--pwa-text)',
              opacity: 0.4,
              marginBottom: '8px',
            }}>
              Tu carrito está vacío
            </p>
            <button
              type="button"
              onClick={onBack}
              style={{
                marginTop: '20px',
                fontSize: '11px',
                color: 'var(--pwa-accent)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Explorar catálogo →
            </button>
          </div>
        ) : (
          <div>
            {/* Items — dark surface cards with neon border */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--pwa-card)',
                    border: '1px solid var(--pwa-border)',
                    borderRadius: 'var(--pwa-radius-md)',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    boxShadow: '0 0 0 1px var(--pwa-accent)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--pwa-font-heading)',
                      fontSize: '1rem',
                      color: 'var(--pwa-text)',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      margin: '0 0 4px',
                    }}>
                      {item.productName}
                    </p>
                    {item.variantValueName && (
                      <p style={{
                        fontSize: '10px',
                        color: 'var(--pwa-text-secondary)',
                        margin: '0 0 8px',
                      }}>
                        {item.variantTypeName}: {item.variantValueName}
                      </p>
                    )}
                    {showPrices && (
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--pwa-accent)',
                        fontWeight: 600,
                        margin: 0,
                        textShadow: '0 0 8px var(--pwa-accent)',
                      }}>
                        {formatPrice(item.unitPrice * item.quantity, currency)}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label="Eliminar"
                      style={{ color: 'var(--pwa-text-secondary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <IconRemove />
                    </button>

                    {/* Quantity — accent colors */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      border: '1px solid var(--pwa-border)',
                      borderRadius: 'var(--pwa-radius-sm)',
                      padding: '4px 10px',
                    }}>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        aria-label="Reducir cantidad"
                        style={{ color: 'var(--pwa-accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <IconMinus />
                      </button>
                      <span style={{ fontSize: '13px', color: 'var(--pwa-accent)', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        aria-label="Aumentar cantidad"
                        style={{ color: 'var(--pwa-accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            {showPrices && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'var(--pwa-card)',
                borderRadius: 'var(--pwa-radius-md)',
                border: '1px solid var(--pwa-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--pwa-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Total
                </span>
                <span style={{
                  fontFamily: 'var(--pwa-font-heading)',
                  fontSize: '1.2rem',
                  color: 'var(--pwa-accent)',
                  fontWeight: 700,
                  textShadow: '0 0 10px var(--pwa-accent)',
                }}>
                  {total}
                </span>
              </div>
            )}

            {showPrices && (businessModel === 'ASSOCIATED' || businessModel === 'BOTH') && (
              <PriceDisclaimer className="mt-2" />
            )}

            {/* Glowing CTA */}
            <button
              type="button"
              onClick={onCheckout}
              style={{
                marginTop: '20px',
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
                cursor: 'pointer',
                boxShadow: '0 0 20px var(--pwa-accent)',
              }}
            >
              Proceder
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NeoLuxuryCartSkin;
