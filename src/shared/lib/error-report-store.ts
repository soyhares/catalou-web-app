/**
 * Bus mínimo entre `publicFetch` y el modal de error, portado tal cual del panel de admin
 * (`catalou-web-admin/src/shared/lib/error-report-store.ts`).
 *
 * Un solo listener a propósito: el modal se monta una vez en `AppRouter`. Si alguna vez hay
 * dos suscriptores, el segundo pisa al primero — y eso es un bug, no un caso a soportar.
 */

export interface ErrorReportEvent {
  message: string;
  context?: string;
}

type Listener = (event: ErrorReportEvent) => void;

let listener: Listener | null = null;

export function subscribeToErrorReport(cb: Listener): () => void {
  listener = cb;
  return () => {
    listener = null;
  };
}

export function emitErrorReportEvent(event: ErrorReportEvent): void {
  listener?.(event);
}
