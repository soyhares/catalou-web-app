import React from 'react';
import type { NavigationProps } from '../../useNavigation';

/* ── Utility icons — clean strokes, unambiguous, functional ─────────────── */

function IconCatalog({ active }: { active: boolean }) {
  /* 2×2 grid with fill in active cell — catalog / storefront */
  const op = active ? 1 : 0.45;
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true" style={{ opacity: op }}>
      <rect x="1.5" y="1.5" width="7" height="7" rx="1.2"
        stroke="currentColor" strokeWidth="1.4"
        fill={active ? 'currentColor' : 'none'} fillOpacity="0.12"
      />
      <rect x="10.5" y="1.5" width="7" height="7" rx="1.2"
        stroke="currentColor" strokeWidth="1.4" fill="none"
      />
      <rect x="1.5" y="10.5" width="7" height="7" rx="1.2"
        stroke="currentColor" strokeWidth="1.4" fill="none"
      />
      <rect x="10.5" y="10.5" width="7" height="7" rx="1.2"
        stroke="currentColor" strokeWidth="1.4" fill="none"
      />
    </svg>
  );
}

function IconAppointments({ active }: { active: boolean }) {
  /* Calendar with a checkmark on the highlighted day */
  const op = active ? 1 : 0.45;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ opacity: op }}>
      <rect x="1.5" y="3.5" width="15" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M5.5 1.5V5M12.5 1.5V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1.5 8H16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* Checkmark on day */}
      <path
        d="M7 12.5L9 14.5L12 11"
        stroke="currentColor"
        strokeWidth={active ? '1.6' : '1.2'}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={active ? 1 : 0.5}
      />
    </svg>
  );
}

function IconAbout({ active }: { active: boolean }) {
  /* Classic person silhouette — circle head + arc shoulders */
  const op = active ? 1 : 0.45;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ opacity: op }}>
      <circle
        cx="9" cy="6"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity="0.1"
      />
      <path
        d="M2 16C2 12.686 5.134 10 9 10C12.866 10 16 12.686 16 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  '/catalog':      (a) => <IconCatalog active={a} />,
  '/appointments': (a) => <IconAppointments active={a} />,
  '/about':        (a) => <IconAbout active={a} />,
};

/* ── Component ──────────────────────────────────────────────────────────── */

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
              /* Top border as active indicator */
              borderTop: isActive ? '2px solid var(--pwa-text)' : '2px solid transparent',
              transition: 'color 150ms ease, border-color 150ms ease',
            }}
          >
            {/* Cart badge */}
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

            {/* Icon */}
            {ICONS[link.path]?.(isActive)}

            {/* Label */}
            <span style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '10px',
              fontWeight: isActive ? 600 : 400,
              color: 'inherit',
              opacity: isActive ? 1 : 0.5,
              transition: 'opacity 150ms ease, font-weight 150ms ease',
              lineHeight: 1,
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
