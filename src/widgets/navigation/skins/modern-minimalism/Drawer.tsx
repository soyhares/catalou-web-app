import React from 'react';
import type { NavigationProps } from '../../useNavigation';

const ModernDrawer: React.FC<NavigationProps> = ({
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
          opacity: 0.25,
        }}
      />

      {/* Clean white panel from right */}
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
          width: '260px',
          backgroundColor: 'var(--pwa-card)',
          borderLeft: '1px solid var(--pwa-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close button row */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 20px',
          borderBottom: '1px solid var(--pwa-border)',
        }}>
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="Cerrar menú"
            style={{
              background: 'none',
              border: '1px solid var(--pwa-border)',
              cursor: 'pointer',
              color: 'var(--pwa-text)',
              padding: '6px 12px',
              borderRadius: 'var(--pwa-radius-sm)',
              fontSize: '12px',
              fontFamily: 'var(--pwa-font-body)',
              fontWeight: 600,
            }}
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Menú" style={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
          {links.map((link) => {
            const isActive = activeRoute === link.path;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate(link.path)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  background: isActive ? 'var(--pwa-surface)' : 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--pwa-border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--pwa-font-body)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '0.9375rem',
                  color: 'var(--pwa-text)',
                  padding: '16px 24px',
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

export default ModernDrawer;
