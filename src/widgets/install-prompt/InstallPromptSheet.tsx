import { useBranding } from '@app/BrandingContext';
import { useInstallPrompt } from '@shared/lib/useInstallPrompt';
import {
  usePostConversionPrompt,
  startPromptCooldown,
} from '@shared/lib/usePostConversionPrompt';

export function InstallPromptSheet() {
  const { slug } = useBranding();
  const { status, triggerPrompt, dismiss } = useInstallPrompt();

  // SPEC-022 (T036): this sheet is mounted globally, so whether it may appear is no longer
  // its own call. The coordinator gives way to the notification and account surfaces first.
  const wantsToShow = status === 'available' || status === 'ios';
  const mayShow = usePostConversionPrompt(slug, 'install', wantsToShow);

  function dismissForever() {
    dismiss(true);
    startPromptCooldown(slug, 'install');
  }

  if (!mayShow) return null;

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
            ? 'Toca Compartir y luego Agregar a inicio'
            : 'Acceso rápido desde tu pantalla'}
        </p>
      </div>

      {status === 'ios' ? (
        <button
          type="button"
          onClick={dismissForever}
          className="text-[11px] font-medium text-[var(--pwa-text-muted,#666)] px-3 py-1.5 rounded-lg border border-[var(--pwa-border,rgba(0,0,0,0.12))] shrink-0"
        >
          Entendido
        </button>
      ) : (
        <button
          type="button"
          onClick={triggerPrompt}
          className="text-[12px] font-semibold bg-[var(--pwa-accent,#C89B3C)] px-3 py-1.5 rounded-lg shrink-0"
          style={{ color: 'var(--pwa-on-accent)' }}
        >
          Instalar
        </button>
      )}

      <button
        type="button"
        onClick={dismissForever}
        aria-label="Cerrar"
        className="text-[var(--pwa-text-muted,#bbb)] leading-none shrink-0 -mr-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
