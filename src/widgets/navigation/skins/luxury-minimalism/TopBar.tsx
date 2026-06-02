import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const LuxuryTopBar: React.FC<NavigationProps> = ({
  companyName,
  logoUrl,
  activeRoute,
  cartCount,
  links,
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
      padding: '0 32px',
      backgroundColor: 'var(--pwa-card)',
      borderBottom: '1px solid var(--pwa-border)',
    }}>
      {/* Company name / logo — serif italic */}
      <div style={{ flex: '0 0 auto', minWidth: '120px' }}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
        ) : (
          <span style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--pwa-text)',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}>
            {companyName}
          </span>
        )}
      </div>

      {/* Nav links — small caps centered */}
      <nav aria-label="Navegación principal" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '36px' }}>
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
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text)',
                opacity: isActive ? 1 : 0.55,
                fontWeight: 600,
                padding: 0,
                position: 'relative',
              }}
            >
              {link.label}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: 'var(--pwa-accent)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Cart + Hamburger */}
      <div style={{ flex: '0 0 auto', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px' }}>
        <button
          type="button"
          onClick={() => onNavigate('/cart')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: activeRoute === '/cart' ? 'var(--pwa-accent)' : 'var(--pwa-text)',
            opacity: activeRoute === '/cart' ? 1 : 0.55,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
          }}
        >
          Carrito
          {cartCount > 0 && (
            <span style={{
              fontStyle: 'italic',
              fontFamily: 'var(--pwa-font-heading)',
              color: 'var(--pwa-accent)',
              fontSize: '10px',
            }}>
              ({cartCount})
            </span>
          )}
        </button>

      </div>
    </header>
  );
};

export default LuxuryTopBar;
