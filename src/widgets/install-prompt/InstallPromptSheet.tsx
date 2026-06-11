import { useInstallPrompt } from '@shared/lib/useInstallPrompt';

export function InstallPromptSheet() {
  const { status, triggerPrompt, dismiss } = useInstallPrompt();

  if (status !== 'available' && status !== 'ios') return null;

  return (
    <div className="fixed bottom-[68px] left-3 right-3 z-[9998] mb-2 rounded-xl bg-[var(--pwa-surface,#ffffff)] border border-[var(--pwa-border,rgba(0,0,0,0.1))] shadow-[0_4px_24px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center gap-3 [animation:pwa-fadeIn_0.25s_ease_both]">
      <img
        src="/pwa-icon-192.png"
        alt="App icon"
        className="w-9 h-9 rounded-lg shrink-0"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--pwa-text,#111)] leading-tight">
          Agrega al inicio
        </p>
        <p className="text-[11px] text-[var(--pwa-text-muted,#666)] leading-tight mt-0.5">
          {status === 'ios'
            ? 'Toca Compartir ⎙ → Agregar a inicio'
            : 'Acceso rápido desde tu pantalla'}
        </p>
      </div>

      {status === 'ios' ? (
        <button
          type="button"
          onClick={() => dismiss(true)}
          className="text-[11px] font-medium text-[var(--pwa-text-muted,#666)] px-3 py-1.5 rounded-lg border border-[var(--pwa-border,rgba(0,0,0,0.12))] shrink-0"
        >
          Entendido
        </button>
      ) : (
        <button
          type="button"
          onClick={triggerPrompt}
          className="text-[12px] font-semibold text-white bg-[var(--pwa-accent,#C89B3C)] px-3 py-1.5 rounded-lg shrink-0"
        >
          Instalar
        </button>
      )}

      <button
        type="button"
        onClick={() => dismiss(true)}
        aria-label="Cerrar"
        className="text-[var(--pwa-text-muted,#bbb)] text-sm leading-none shrink-0 -mr-1"
      >
        ✕
      </button>
    </div>
  );
}
