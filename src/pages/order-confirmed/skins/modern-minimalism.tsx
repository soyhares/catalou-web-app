import React from 'react';
import type { OrderConfirmedPageProps } from '../useOrderConfirmedPage';

/* ── Icons ──────────────────────────────────────────────────────────────── */

function IconCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 16.5L13.5 21L23 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const ModernMinimalismOrderConfirmedSkin: React.FC<OrderConfirmedPageProps> = ({
  orderId,
  onGoHome,
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--pwa-bg)',
      padding: '0 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>

        {/* Checkmark */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
          color: '#22C55E',
        }}>
          <IconCheck />
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--pwa-text)',
          margin: '0 0 12px',
        }}>
          Pedido confirmado
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'var(--pwa-text-secondary)',
          lineHeight: 1.6,
          margin: '0 0 16px',
        }}>
          Tu pedido fue recibido. Te contactaremos en breve.
        </p>

        {/* Order number */}
        {orderId && (
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: 'var(--pwa-surface-secondary)',
            border: '1px solid var(--pwa-border)',
            borderRadius: 'var(--pwa-radius-sm)',
            marginBottom: '32px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--pwa-text-secondary)' }}>Pedido # </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--pwa-text)', fontVariantNumeric: 'tabular-nums' }}>
              {orderId}
            </span>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: orderId ? '0' : '32px' }}>
          <button
            type="button"
            onClick={onGoHome}
            style={{
              padding: '12px 28px',
              backgroundColor: 'var(--pwa-accent)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--pwa-font-body)',
              borderRadius: 'var(--pwa-radius-button)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernMinimalismOrderConfirmedSkin;
