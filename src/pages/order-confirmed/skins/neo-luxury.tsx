import React, { useEffect, useState } from 'react';
import type { OrderConfirmedPageProps } from '../useOrderConfirmedPage';

/* ── Icons ──────────────────────────────────────────────────────────────── */

function IconCheck() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 18.5L15 23.5L26 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Skin ───────────────────────────────────────────────────────────────── */

const NeoLuxuryOrderConfirmedSkin: React.FC<OrderConfirmedPageProps> = ({
  onGoHome,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPulse(true), 300);
    return () => clearTimeout(timer);
  }, []);

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

        {/* Glow checkmark */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px',
          color: 'var(--pwa-accent)',
          filter: pulse ? 'drop-shadow(0 0 16px var(--pwa-accent))' : 'none',
          transition: 'filter 600ms ease',
        }}>
          <IconCheck />
        </div>

        {/* Gradient heading */}
        <h1 style={{
          background: 'linear-gradient(135deg, var(--pwa-accent), var(--pwa-text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '2rem',
          fontWeight: 700,
          margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          ¡Pedido enviado!
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'var(--pwa-text-secondary)',
          lineHeight: 1.6,
          margin: '0 0 40px',
        }}>
          Tu pedido fue recibido con éxito.<br />
          Nos comunicaremos contigo pronto.
        </p>

        {/* Glowing button */}
        <button
          type="button"
          onClick={onGoHome}
          style={{
            padding: '14px 32px',
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
            boxShadow: '0 0 24px var(--pwa-accent)',
          }}
        >
          Volver al catálogo
        </button>
      </div>
    </div>
  );
};

export default NeoLuxuryOrderConfirmedSkin;
