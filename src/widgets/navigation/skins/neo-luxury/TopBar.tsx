import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const NeoLuxuryTopBar: React.FC<NavigationProps> = ({
  companyName,
  logoUrl,
  cartCount,
  activeRoute,
  onNavigate,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      backgroundColor: 'var(--pwa-card)',
      borderBottom: '1px solid var(--pwa-border)',
      gap: '16px',
    }}>
      {/* Gradient logo text left */}
      <div style={{ flex: '0 0 auto', minWidth: '120px' }}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--pwa-font-body)',
            fontWeight: 800,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, var(--pwa-accent) 0%, var(--pwa-text) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.02em',
          }}>
            {companyName}
          </span>
        )}
      </div>

      {/* Visual search placeholder — noop */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        height: '36px',
        backgroundColor: 'var(--pwa-bg)',
        border: '1px solid var(--pwa-border)',
        borderRadius: 'var(--pwa-radius-sm)',
        padding: '0 12px',
        gap: '8px',
        maxWidth: '300px',
        margin: '0 auto',
      }}>
        <span style={{ opacity: 0.4, fontSize: '14px' }} aria-hidden="true">🔍</span>
        <span style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '12px',
          color: 'var(--pwa-text-secondary)',
          opacity: 0.5,
        }}>
          Buscar…
        </span>
      </div>

      {/* Cart icon right */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => onNavigate('/cart')}
          aria-label={`Carrito${cartCount > 0 ? `, ${cartCount} artículos` : ''}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            color: activeRoute === '/cart' ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '18px' }} aria-hidden="true">◻</span>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: 'var(--pwa-accent)',
              color: 'var(--pwa-on-accent)',
              fontSize: '9px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              boxShadow: '0 0 6px var(--pwa-accent)',
            }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
};

export default NeoLuxuryTopBar;
