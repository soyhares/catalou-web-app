import React from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
import { formatPrice } from '@shared/lib/formatPrice';
import type { CartPageProps } from '../useCartPage';

/* ── Icons ──────────────────────────────────────────────────────────────── */

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconRemove() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const ModernMinimalismCartSkin: React.FC<CartPageProps> = ({
  items,
  total,
  subtotal,
  showPrices,
  currency,
  onUpdateQuantity,
  onRemove,
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
            <IconChevronLeft />
          </button>
          <h1 style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--pwa-text)',
            margin: 0,
          }}>
            Carrito {!isEmpty && `(${items.length} ${items.length === 1 ? 'artículo' : 'artículos'})`}
          </h1>
        </header>
      ) : (
        <div style={{ padding: '12px 24px' }}>
          <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>
      )}

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 16px 88px' }}>
        {isEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '1rem', color: 'var(--pwa-text-secondary)', marginBottom: '16px' }}>
              Tu carrito está vacío
            </p>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '10px 24px',
                backgroundColor: 'var(--pwa-accent)',
                color: 'var(--pwa-on-accent)',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: 'var(--pwa-radius-button)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Items — dense list */}
            <div style={{
              backgroundColor: 'var(--pwa-surface)',
              border: '1px solid var(--pwa-border)',
              borderRadius: 'var(--pwa-radius-md)',
              overflow: 'hidden',
            }}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    borderTop: index > 0 ? '1px solid var(--pwa-border)' : undefined,
                  }}
                >
                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--pwa-font-body)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--pwa-text)',
                      margin: '0 0 2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.productName}
                    </p>
                    {item.variantValueName && (
                      <p style={{ fontSize: '12px', color: 'var(--pwa-text-secondary)', margin: '0 0 4px' }}>
                        {item.variantTypeName}: {item.variantValueName}
                      </p>
                    )}
                    {showPrices && (
                      <p style={{ fontSize: '13px', color: 'var(--pwa-text)', fontWeight: 500, margin: 0 }}>
                        {formatPrice(item.unitPrice, currency)} c/u
                      </p>
                    )}
                  </div>

                  {/* Quantity stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--pwa-border)', borderRadius: 'var(--pwa-radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      aria-label="Reducir cantidad"
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pwa-text)',
                        background: 'var(--pwa-surface-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <IconMinus />
                    </button>
                    <span style={{
                      width: '36px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--pwa-text)',
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label="Aumentar cantidad"
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pwa-text)',
                        background: 'var(--pwa-surface-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <IconPlus />
                    </button>
                  </div>

                  {/* Price total */}
                  {showPrices && (
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--pwa-text)', minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>
                      {formatPrice(item.unitPrice * item.quantity, currency)}
                    </span>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label="Eliminar"
                    style={{
                      color: 'var(--pwa-text-secondary)',
                      opacity: 0.5,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconRemove />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary box */}
            {showPrices && (
              <div style={{
                backgroundColor: 'var(--pwa-surface-secondary)',
                border: '1px solid var(--pwa-border)',
                borderRadius: 'var(--pwa-radius-md)',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--pwa-text-secondary)' }}>Subtotal</span>
                  <span style={{ fontSize: '13px', color: 'var(--pwa-text)', fontWeight: 500 }}>{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--pwa-border)' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--pwa-text)' }}>Total</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--pwa-accent)' }}>{total}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={onCheckout}
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
                cursor: 'pointer',
              }}
            >
              Ir a Checkout
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ModernMinimalismCartSkin;
