import React from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
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
      <path d="M2 5H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2V8M2 5H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const LuxuryMinimalismCartSkin: React.FC<CartPageProps> = ({
  items,
  total,
  showPrices,
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
            <IconChevronLeft />
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'var(--pwa-text)',
              margin: 0,
            }}>
              Mi Selección
            </p>
            {!isEmpty && (
              <p style={{
                fontSize: '9px',
                color: 'var(--pwa-text-secondary)',
                opacity: 0.5,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                margin: '2px 0 0',
              }}>
                {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
              </p>
            )}
          </div>

          {!isEmpty ? (
            <button
              type="button"
              onClick={onClear}
              style={{
                fontSize: '9px',
                color: 'var(--pwa-text)',
                opacity: 0.4,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
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

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '32px 20px 88px' }}>
        {isEmpty ? (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--pwa-text)', opacity: 0.12, marginBottom: '24px' }}>
              <rect x="5" y="14" width="30" height="22" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M14 14V11C14 7.69 16.69 5 20 5C23.31 5 26 7.69 26 11V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <p style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontStyle: 'italic',
              fontSize: '1.4rem',
              color: 'var(--pwa-text)',
              opacity: 0.4,
              marginBottom: '8px',
            }}>
              Tu selección está vacía
            </p>
            <button
              type="button"
              onClick={onBack}
              style={{
                marginTop: '24px',
                fontSize: '10px',
                color: 'var(--pwa-accent)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div>
            {/* Items — editorial list */}
            <div style={{ borderTop: '1px solid var(--pwa-border)' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '20px 0',
                    borderBottom: '1px solid var(--pwa-border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--pwa-font-heading)',
                      fontStyle: 'italic',
                      fontSize: '1.05rem',
                      color: 'var(--pwa-text)',
                      lineHeight: 1.3,
                      margin: '0 0 2px',
                    }}>
                      {item.productName}
                    </p>
                    {item.variantValueName && (
                      <p style={{
                        fontSize: '9px',
                        color: 'var(--pwa-text-secondary)',
                        opacity: 0.55,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        margin: '0 0 8px',
                      }}>
                        {item.variantTypeName} — {item.variantValueName}
                      </p>
                    )}
                    {showPrices && (
                      <p style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: 'var(--pwa-accent)',
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                      }}>
                        ₡{(item.unitPrice * item.quantity).toLocaleString('es-CR')}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
                    {/* Subtle remove link */}
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      style={{
                        fontSize: '9px',
                        color: 'var(--pwa-text-secondary)',
                        opacity: 0.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Quitar
                    </button>

                    {/* Quantity stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--pwa-border)', paddingBottom: '2px' }}>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ color: 'var(--pwa-text)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        aria-label="Reducir cantidad"
                      >
                        <IconMinus />
                      </button>
                      <span style={{ fontSize: '12px', color: 'var(--pwa-text)', minWidth: '16px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ color: 'var(--pwa-text)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        aria-label="Aumentar cantidad"
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {showPrices && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--pwa-accent)', marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--pwa-text)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                    Total
                  </span>
                  <span style={{ fontFamily: 'var(--pwa-font-heading)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--pwa-accent)', fontWeight: 400 }}>
                    {total}
                  </span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={onCheckout}
              style={{
                marginTop: '32px',
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--pwa-accent)',
                color: 'var(--pwa-on-accent)',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'var(--pwa-font-body)',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                borderRadius: 'var(--pwa-radius-button)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continuar
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LuxuryMinimalismCartSkin;
