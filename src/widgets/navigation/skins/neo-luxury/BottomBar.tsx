import React from 'react';
import type { NavigationProps } from '../../useNavigation';

/* ── Terminal symbols — geometric, matrix-inspired ──────────────────────── */

function IconCatalog({ active }: { active: boolean }) {
  /* 3×3 dot matrix — a data grid / product mesh */
  const op = active ? 1 : 0.38;
  const r = active ? 1.2 : 1;
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true" style={{ opacity: op }}>
      {[2.5, 8.5, 14.5].map((cx) =>
        [2.5, 8.5, 14.5].map((cy) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" />
        ))
      )}
    </svg>
  );
}

function IconAppointments({ active }: { active: boolean }) {
  /* Calendar with bracket corners — terminal UI aesthetic */
  const op = active ? 1 : 0.38;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: op }}>
      {/* Corner brackets instead of full border */}
      <path d="M1 5V2H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 2H15V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M1 11V14H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 14H15V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Date pins */}
      <path d="M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Neon accent dot on a day cell */}
      <circle cx="11" cy="10" r="1.5" fill="currentColor" opacity={active ? 0.9 : 0.5} />
      <circle cx="5.5" cy="10" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function IconAbout({ active }: { active: boolean }) {
  /* Geometric person — hexagonal head + sharp shoulders */
  const op = active ? 1 : 0.38;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ opacity: op }}>
      {/* Hexagon head */}
      <path
        d="M8 1.5L11 3.3V6.7L8 8.5L5 6.7V3.3L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Angular shoulders / connector */}
      <path
        d="M3 14.5C3 11.5 5.2 10 8 10C10.8 10 13 11.5 13 14.5"
        stroke="currentColor"
        strokeWidth="1.2"
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
              transition: 'color 150ms ease',
            }}
          >
            {/* Neon gradient bar — active indicator */}
            <span style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: '2px',
              background: isActive
                ? 'linear-gradient(90deg, transparent, var(--pwa-accent), transparent)'
                : 'transparent',
              boxShadow: isActive ? '0 0 10px var(--pwa-accent)' : 'none',
              transition: 'background 200ms ease, box-shadow 200ms ease',
            }} />

            {/* Cart badge */}
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

            {/* Icon */}
            {ICONS[link.path]?.(isActive)}

            {/* Label */}
            <span style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 600,
              opacity: isActive ? 1 : 0.38,
              transition: 'opacity 150ms ease',
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

export default NeoLuxuryBottomBar;
