import React from 'react';
import type { NavigationProps } from '../../useNavigation';

/* ── Atelier marks — ultra-thin strokes, editorial geometry ─────────────── */

function IconCatalog({ active }: { active: boolean }) {
  /* 2×2 grid of thin rectangles — a layout of wares */
  const op = active ? 1 : 0.42;
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ opacity: op }}>
      <rect x="1.5" y="1.5" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.05" fill="none" />
      <rect x="8.5" y="1.5" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.05" fill="none" />
      <rect x="1.5" y="8.5" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.05" fill="none" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.05" fill="none" />
    </svg>
  );
}

function IconAppointments({ active }: { active: boolean }) {
  /* Slender calendar — thin border, ruled rows suggest an agenda */
  const op = active ? 1 : 0.42;
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden="true" style={{ opacity: op }}>
      <rect x="1" y="3" width="12" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.05" fill="none" />
      <path d="M4 1.5V4M10 1.5V4" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
      <path d="M1 6.5H13" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
      {/* agenda ruled lines */}
      <path d="M3.5 9.5H10.5M3.5 11.5H8" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function IconAbout({ active }: { active: boolean }) {
  /* Portrait cameo — circle framing a silhouette suggestion */
  const op = active ? 1 : 0.42;
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ opacity: op }}>
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.05" fill="none" />
      <circle cx="7.5" cy="5.8" r="1.8" stroke="currentColor" strokeWidth="1.05" fill="none" />
      <path d="M3.5 12.5C3.5 10.567 5.314 9 7.5 9C9.686 9 11.5 10.567 11.5 12.5" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  '/catalog':      (a) => <IconCatalog active={a} />,
  '/appointments': (a) => <IconAppointments active={a} />,
  '/about':        (a) => <IconAbout active={a} />,
};

/* ── Component ──────────────────────────────────────────────────────────── */

const LuxuryBottomBar: React.FC<NavigationProps> = ({
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
              gap: '5px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text-secondary)',
              transition: 'color 200ms ease',
            }}
          >
            {/* Active indicator — thin gold dot above icon */}
            <span style={{
              position: 'absolute',
              top: '8px',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              backgroundColor: 'var(--pwa-accent)',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 200ms ease',
            }} />

            {/* Cart badge */}
            {showBadge && (
              <span style={{
                position: 'absolute',
                top: '14px',
                right: 'calc(50% - 14px)',
                minWidth: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: 'var(--pwa-accent)',
                color: 'var(--pwa-on-accent)',
                fontSize: '8px',
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
              fontSize: '7.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              opacity: isActive ? 1 : 0.42,
              transition: 'opacity 200ms ease',
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

export default LuxuryBottomBar;
