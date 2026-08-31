import { useEffect, useState } from 'react';
import { IconWarning } from './confirmation-page-icons';
import { useBranding } from '@app/BrandingContext';
import { subscribeToErrorReport, type ErrorReportEvent } from '@shared/lib/error-report-store';

/**
 * Aviso amigable ante un fallo del servidor, con la opción de reportarlo.
 *
 * Portado del panel de admin (`ErrorReportModal`), con el lenguaje visual del skin de la PWA.
 * El mensaje técnico NO se muestra: viaja solo en el correo. Quien está comprando no necesita
 * leer "Request failed: 500", necesita saber que puede avisarnos.
 *
 * Se monta una sola vez en `AppRouter` y se abre solo a través de `emitErrorReportEvent`.
 */
export function ErrorReportModal() {
  const { slug, branding } = useBranding();
  const [event, setEvent] = useState<ErrorReportEvent | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(
    () =>
      subscribeToErrorReport((next) => {
        setStatus('idle');
        setEvent(next);
      }),
    [],
  );

  if (!event) return null;

  const onClose = () => {
    setEvent(null);
  };

  async function onReport() {
    if (!event) return;
    setStatus('sending');
    try {
      await fetch(`${import.meta.env.VITE_API_URL as string}/public/error-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: event.message,
          context: event.context,
          url: window.location.href,
          companyName: branding.companyName || slug,
          app: 'pwa',
        }),
      });
    } catch {
      // Best-effort: si el reporte tampoco sale, no hay nada más que ofrecerle a la persona.
    }
    setStatus('sent');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-report-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full sm:max-w-sm mx-auto rounded-t-2xl sm:rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--pwa-surface, #ffffff)' }}
      >
        <div className="flex justify-center" style={{ color: '#b42318' }}>
          <IconWarning />
        </div>

        <h2
          id="error-report-title"
          className="mt-3 text-lg font-semibold text-center"
          style={{ color: 'var(--pwa-text)', fontFamily: 'var(--pwa-font-heading)' }}
        >
          Algo salió mal
        </h2>

        <p
          className="mt-3 text-sm text-center leading-relaxed"
          style={{ color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)' }}
        >
          {status === 'sent'
            ? 'Gracias, ya avisamos al equipo. Vamos a revisarlo.'
            : 'No pudimos completar la operación. Podés intentar de nuevo, y si vuelve a pasar avisanos para que lo revisemos.'}
        </p>

        {status !== 'sent' && (
          <button
            type="button"
            onClick={() => void onReport()}
            disabled={status === 'sending'}
            className="mt-5 w-full py-3 text-sm font-semibold disabled:opacity-60"
            style={{
              backgroundColor: 'var(--pwa-accent)',
              color: 'var(--pwa-on-accent)',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            {status === 'sending' ? 'Enviando...' : 'Avisar del problema'}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-3 text-sm"
          style={{ color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
