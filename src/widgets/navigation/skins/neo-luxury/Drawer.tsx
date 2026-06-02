import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const NeoLuxuryDrawer: React.FC<NavigationProps> = ({
  links,
  activeRoute,
  onNavigate,
  onCloseDrawer,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        role="presentation"
        onClick={onCloseDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          backgroundColor: 'var(--pwa-text)',
          opacity: 0.6,
        }}
      />

      {/* Dark glassmorphism panel from right */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 31,
          width: '280px',
          backgroundColor: 'var(--pwa-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid var(--pwa-accent)',
          boxShadow: '-4px 0 24px var(--pwa-accent-soft)',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 32px',
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onCloseDrawer}
          aria-label="Cerrar menú"
          style={{
            alignSelf: 'flex-end',
            background: 'none',
            border: '1px solid var(--pwa-border)',
            cursor: 'pointer',
            color: 'var(--pwa-text-secondary)',
            padding: '6px 12px',
            borderRadius: 'var(--pwa-radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--pwa-font-body)',
            marginBottom: '40px',
          }}
        >
          ✕
        </button>

        <nav aria-label="Menú" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {links.map((link) => {
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
                  borderLeft: isActive ? `3px solid var(--pwa-accent)` : '3px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--pwa-font-body)',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text)',
                  opacity: isActive ? 1 : 0.7,
                  padding: '12px 16px',
                  letterSpacing: '0.02em',
                  boxShadow: isActive ? 'inset 0 0 10px var(--pwa-accent-soft)' : 'none',
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default NeoLuxuryDrawer;
