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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] px-5 pt-5 pb-8 bg-[var(--pwa-surface,#ffffff)] border-t border-[var(--pwa-border,rgba(0,0,0,0.1))] rounded-t-[20px] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] [animation:pwa-slideUp_0.3s_ease_both]">

      {/* Handle bar */}
      <div className="w-9 h-1 rounded-full bg-[var(--pwa-border,#ddd)] mx-auto mb-5" />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        <img
          src="/pwa-icon-192.png"
          alt="App icon"
          className="w-13 h-13 rounded-xl shrink-0"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div>
          <p className="text-[15px] font-bold text-[var(--pwa-text,#111)] mb-0.5">
            Agrega esta app a tu pantalla de inicio
          </p>
          <p className="text-[13px] text-[var(--pwa-text-muted,#666)] leading-snug">
            Accede al catálogo más rápido, sin abrir el navegador.
          </p>
        </div>
      </div>

      {status === 'ios' ? (
        <p className="text-[13px] text-[var(--pwa-text-muted,#666)] mb-4 leading-relaxed">
          Toca <strong>Compartir</strong> <span className="text-base">⎙</span> en Safari y luego{' '}
          <strong>"Agregar a pantalla de inicio"</strong>.
        </p>
      ) : (
        <button
          type="button"
          onClick={triggerPrompt}
          className="w-full py-[13px] rounded-xl border-none cursor-pointer bg-[var(--pwa-accent,#C89B3C)] text-white text-[14px] font-semibold mb-2.5"
        >
          Instalar app
        </button>
      )}

      <button
        type="button"
        onClick={() => dismiss(true)}
        className="w-full py-2.5 rounded-xl border-none cursor-pointer bg-transparent text-[var(--pwa-text-muted,#888)] text-[13px]"
      >
        No, gracias
      </button>
    </div>
  );
}
