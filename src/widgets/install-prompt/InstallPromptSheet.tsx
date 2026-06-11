import { useEffect, useState } from 'react';
import { useInstallPrompt } from '@shared/lib/useInstallPrompt';

const DELAY_MS = 30_000;

export function InstallPromptSheet() {
  const { status, triggerPrompt, dismiss } = useInstallPrompt();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'available' && status !== 'ios') return;
    const t = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [status]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '20px 20px 32px',
        background: 'var(--pwa-surface, #ffffff)',
        borderTop: '1px solid var(--pwa-border, rgba(0,0,0,0.1))',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        animation: 'pwa-slideUp 0.3s ease both',
      }}
    >
      <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--pwa-border, #ddd)', margin: '0 auto 20px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <img
          src="/pwa-icon-192.png"
          alt="App icon"
          style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pwa-text, #111)', margin: 0, marginBottom: 2 }}>
            Agrega esta app a tu pantalla de inicio
          </p>
          <p style={{ fontSize: 13, color: 'var(--pwa-text-muted, #666)', margin: 0, lineHeight: 1.4 }}>
            Accede al catálogo más rápido, sin abrir el navegador.
          </p>
        </div>
      </div>

      {status === 'ios' ? (
        <p style={{ fontSize: 13, color: 'var(--pwa-text-muted, #666)', marginBottom: 16, lineHeight: 1.6 }}>
          Toca <strong>Compartir</strong> <span style={{ fontSize: 16 }}>⎙</span> en Safari y luego{' '}
          <strong>"Agregar a pantalla de inicio"</strong>.
        </p>
      ) : (
        <button
          type="button"
          onClick={triggerPrompt}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--pwa-accent, #C89B3C)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Instalar app
        </button>
      )}

      <button
        type="button"
        onClick={() => dismiss(true)}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          background: 'transparent',
          color: 'var(--pwa-text-muted, #888)',
          fontSize: 13,
        }}
      >
        No, gracias
      </button>
    </div>
  );
}
