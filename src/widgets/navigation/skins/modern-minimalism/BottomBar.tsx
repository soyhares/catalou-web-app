import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const NAV_ICONS: Record<string, string> = {
  '/': '🏠',
  '/cart': '🛍',
  '/about': '👤',
};

const ModernBottomBar: React.FC<NavigationProps> = ({
  activeRoute,
  cartCount,
  links,
  onNavigate,
}) => {
  return (
    <nav
      aria-label="Navegación principal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: '68px',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: 'var(--pwa-card)',
        borderTop: '1px solid var(--pwa-border)',
      }}
    >
      {links.map((link) => {
        const isActive = activeRoute === link.path;
        const showBadge = link.path === '/cart' && cartCount > 0;
        return (
          <button
            key={link.path}
            type="button"
            onClick={() => onNavigate(link.path)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? 'var(--pwa-text)' : 'var(--pwa-text-secondary)',
              borderTop: isActive ? '2px solid var(--pwa-text)' : '2px solid transparent',
            }}
          >
            {/* Badge */}
            {showBadge && (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: 'calc(50% - 16px)',
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
            <span style={{ fontSize: '20px', lineHeight: 1, filter: isActive ? 'none' : 'grayscale(1)', opacity: isActive ? 1 : 0.45 }} aria-hidden="true">
              {NAV_ICONS[link.path] ?? '·'}
            </span>
            <span style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '9px',
              fontWeight: isActive ? 700 : 400,
              color: 'inherit',
              opacity: isActive ? 1 : 0.55,
            }}>
              {link.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default ModernBottomBar;
