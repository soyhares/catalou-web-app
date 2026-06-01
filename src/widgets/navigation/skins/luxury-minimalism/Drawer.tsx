import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const LuxuryDrawer: React.FC<NavigationProps> = ({
  links,
  activeRoute,
  onNavigate,
  onCloseDrawer,
}) => {
  return (
    <>
      {/* Soft overlay — close on click */}
      <div
        role="presentation"
        onClick={onCloseDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          backgroundColor: 'var(--pwa-text)',
          opacity: 0.18,
        }}
      />

      {/* Drawer panel */}
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
          borderLeft: '1px solid var(--pwa-border)',
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
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--pwa-text)',
            opacity: 0.4,
            marginBottom: '40px',
            padding: 0,
          }}
        >
          Cerrar
        </button>

        <nav aria-label="Menú" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--pwa-font-heading)',
                  fontStyle: 'italic',
                  fontSize: '1.4rem',
                  color: isActive ? 'var(--pwa-accent)' : 'var(--pwa-text)',
                  fontWeight: 400,
                  opacity: isActive ? 1 : 0.65,
                  padding: 0,
                  letterSpacing: '0.01em',
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

export default LuxuryDrawer;
