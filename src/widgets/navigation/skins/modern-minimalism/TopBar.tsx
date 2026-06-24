import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const ModernTopBar: React.FC<NavigationProps> = ({
  companyName,
  logoUrl,
  activeRoute,
  cartCount,
  ordersEnabled,
  links,
  onNavigate,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      backgroundColor: 'var(--pwa-card)',
      borderBottom: '1px solid var(--pwa-border)',
      gap: '16px',
    }}>
      {/* Bold logo left */}
      <div style={{ flex: '0 0 auto' }}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--pwa-font-body)',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--pwa-text)',
            letterSpacing: '-0.01em',
          }}>
            {companyName}
          </span>
        )}
      </div>

      {/* Nav links center */}
      <nav aria-label="Navegación principal" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        {links.filter((l) => l.path !== '/cart').map((link) => {
          const isActive = activeRoute === link.path;
          return (
            <button
              key={link.path}
              type="button"
              onClick={() => onNavigate(link.path)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--pwa-text)' : 'var(--pwa-text-secondary)',
                padding: 0,
              }}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right: cart (only when orders enabled) */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {ordersEnabled && (
          <button
            type="button"
            onClick={() => onNavigate('/cart')}
            aria-label={`Carrito${cartCount > 0 ? `, ${cartCount} artículos` : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: 'var(--pwa-text)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 6.5h12l-1.5 9H5.5L4 6.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
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
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default ModernTopBar;
