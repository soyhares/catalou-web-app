import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const ModernTopBar: React.FC<NavigationProps> = ({
  companyName,
  logoUrl,
  activeRoute,
  cartCount,
  links,
  isDrawerOpen,
  onToggleDrawer,
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
          <img src={logoUrl} alt={companyName} style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
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

      {/* Right: search icon + cart + hamburger */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Cart */}
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
            fontSize: '18px',
          }}
        >
          <span aria-hidden="true">🛍</span>
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

        {/* Hamburger (≡) */}
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label={isDrawerOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isDrawerOpen}
          style={{
            background: 'none',
            border: '1px solid var(--pwa-border)',
            cursor: 'pointer',
            color: 'var(--pwa-text)',
            padding: '5px 9px',
            borderRadius: 'var(--pwa-radius-sm)',
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          ≡
        </button>
      </div>
    </header>
  );
};

export default ModernTopBar;
