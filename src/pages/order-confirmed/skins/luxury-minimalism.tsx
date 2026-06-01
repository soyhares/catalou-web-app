import React from 'react';
import type { OrderConfirmedPageProps } from '../useOrderConfirmedPage';

/* ── Skin ───────────────────────────────────────────────────────────────── */

const LuxuryMinimalismOrderConfirmedSkin: React.FC<OrderConfirmedPageProps> = ({
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
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>

        {/* Accent line */}
        <div style={{
          width: '40px',
          height: '1px',
          backgroundColor: 'var(--pwa-accent)',
          margin: '0 auto 40px',
        }} />

        {/* Large serif heading */}
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontStyle: 'italic',
          fontSize: '2.8rem',
          fontWeight: 400,
          color: 'var(--pwa-text)',
          lineHeight: 1.1,
          margin: '0 0 24px',
        }}>
          Gracias
        </h1>

        {/* Editorial message */}
        <p style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '14px',
          color: 'var(--pwa-text-secondary)',
          lineHeight: 1.7,
          margin: '0 0 48px',
          opacity: 0.8,
        }}>
          Tu selección ha sido recibida.<br />
          Nos pondremos en contacto contigo pronto.
        </p>

        {/* Subtle accent line */}
        <div style={{
          width: '24px',
          height: '1px',
          backgroundColor: 'var(--pwa-accent)',
          margin: '0 auto 40px',
          opacity: 0.4,
        }} />

        {/* Text link CTA */}
        <button
          type="button"
          onClick={onGoHome}
          style={{
            fontSize: '11px',
            color: 'var(--pwa-text)',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--pwa-font-body)',
            fontWeight: 500,
          }}
        >
          Seguir explorando →
        </button>
      </div>
    </div>
  );
};

export default LuxuryMinimalismOrderConfirmedSkin;
