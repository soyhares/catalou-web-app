import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const NAV_ICONS: Record<string, string> = {
  '/': '⌂',
  '/cart': '◻',
  '/about': '◯',
};

const CALENDAR_SVG = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M4 1.5V4M12 1.5V4M1 7H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const NeoLuxuryBottomBar: React.FC<NavigationProps> = ({
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
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
            }}
          >
            {/* Gradient accent bar on active */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--pwa-accent), transparent)',
                boxShadow: '0 0 8px var(--pwa-accent)',
              }} />
            )}
            {/* Badge */}
            {showBadge && (
              <span style={{
                position: 'absolute',
                top: '10px',
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
                boxShadow: '0 0 6px var(--pwa-accent)',
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span style={{ fontSize: '18px', lineHeight: 1, opacity: isActive ? 1 : 0.4 }} aria-hidden="true">
              {link.path === '/appointments' ? CALENDAR_SVG : (NAV_ICONS[link.path] ?? '·')}
            </span>
            <span style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              opacity: isActive ? 1 : 0.4,
              fontWeight: 600,
            }}>
              {link.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default NeoLuxuryBottomBar;
