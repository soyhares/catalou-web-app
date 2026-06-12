import { usePushSubscription } from './usePushSubscription';

interface PushPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export function PushPermissionModal({ isOpen, onClose }: PushPermissionModalProps) {
  const { isSupported, permission, subscribe } = usePushSubscription();

  if (!isOpen) return null;
  if (!isSupported || permission === 'denied') return null;

  const handleActivate = async (): Promise<void> => {
    await subscribe();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / Modal */}
      <div
        className="relative w-full sm:max-w-sm mx-auto rounded-t-2xl sm:rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--pwa-surface, #ffffff)' }}
      >
        {/* Bell icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto"
          style={{ backgroundColor: 'color-mix(in srgb, var(--pwa-accent, #6366f1) 12%, transparent)' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: 'var(--pwa-accent, #6366f1)' }}
            aria-hidden="true"
          >
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          id="push-modal-title"
          className="text-lg font-bold text-center mb-2"
          style={{ color: 'var(--pwa-text, #111827)', fontFamily: 'var(--pwa-font-heading, inherit)' }}
        >
          Recibe notificaciones
        </h2>

        <p
          className="text-sm text-center mb-6"
          style={{ color: 'var(--pwa-text-secondary, #6b7280)', lineHeight: 1.6 }}
        >
          Te avisaremos cuando tu cita sea confirmada o cambiada.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleActivate()}
            className="w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--pwa-accent, #6366f1)',
              borderRadius: 'var(--pwa-radius-button, 0.75rem)',
            }}
          >
            Activar notificaciones
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--pwa-text-secondary, #6b7280)' }}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
