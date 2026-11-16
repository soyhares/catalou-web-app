import type { ReactNode } from 'react';

/**
 * Momentos del pedido en `/pedido/:token`: la confirmación (una vez por pedido, ver
 * `useConfirmationCelebration`) y los dos cierres. Todo el movimiento va con `motion-safe:`;
 * sin movimiento se ve el estado final, dibujado y quieto.
 */

const heading = 'font-[family-name:var(--pwa-font-heading)] font-normal italic text-[var(--pwa-text)]';
/** Texto de apoyo: el color del texto atenuado hacia el fondo, así mantiene AA con cualquier paleta. */
const subtle = 'text-[color:color-mix(in_srgb,var(--pwa-text)_72%,var(--pwa-bg))]';
const drawn = '[stroke-dasharray:1]';

/** Check que se dibuja: primero el anillo (acento del negocio) y después el trazo. */
function DrawnCheck({ size }: { size: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-16 w-16' : 'h-11 w-11';
  return (
    <span
      aria-hidden="true"
      className={`relative flex flex-none items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--pwa-accent)_14%,var(--pwa-bg))] text-[var(--pwa-text)] motion-safe:animate-moment-halo ${box}`}
    >
      <svg viewBox="0 0 48 48" fill="none" focusable="false" className="h-full w-full">
        <circle
          cx="24"
          cy="24"
          r="22.5"
          pathLength={1}
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`${drawn} -rotate-90 origin-center stroke-[var(--pwa-accent)] motion-safe:animate-ring-draw`}
        />
        <path
          d="M15.5 24.5l5.5 5.5 11.5-12"
          pathLength={1}
          stroke="currentColor"
          strokeWidth={size === 'lg' ? 2 : 2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${drawn} motion-safe:animate-check-draw`}
        />
      </svg>
    </span>
  );
}

/** "¡Tu pedido fue confirmado!": breve, no bloquea; el seguimiento sigue debajo. */
export function ConfirmedMoment() {
  return (
    <div
      data-testid="confirmed-moment"
      className="mb-5 flex items-center gap-3.5 rounded-[var(--pwa-radius-md)] border border-[var(--pwa-border)] bg-[var(--pwa-card)] px-4 py-3.5 motion-safe:animate-moment-in"
    >
      <DrawnCheck size="md" />
      <div className="min-w-0">
        <p className={`${heading} m-0 text-[1.2rem] leading-tight`}>¡Tu pedido fue confirmado!</p>
        <p className={`${subtle} m-0 mt-0.5 text-[13px]`}>El negocio ya lo tiene en marcha.</p>
      </div>
    </div>
  );
}

function IconClosed() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false" className="h-6 w-6">
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}

interface FinalHeaderProps {
  meta: ReactNode;
  children?: ReactNode;
}

/** Entregado: check grande, agradecimiento y, si corresponde, la valoración como acción principal. */
export function CompletedHeader({ meta, children }: FinalHeaderProps) {
  return (
    <header data-testid="final-completed" className="mb-6 flex flex-col items-center text-center">
      <DrawnCheck size="lg" />
      <p className={`${subtle} m-0 mt-4 text-xs`}>{meta}</p>
      <h1 className={`${heading} m-0 mt-1 text-[1.75rem] leading-tight`}>Pedido entregado</h1>
      <p className={`${subtle} m-0 mt-1 text-sm`}>¡Gracias por tu compra!</p>
      {children && <div className="mt-5 flex w-full flex-col gap-2">{children}</div>}
    </header>
  );
}

/** Cancelado: sobrio, sin celebración. La salida es escribirle al negocio. */
export function CancelledHeader({ meta, body, children }: FinalHeaderProps & { body: string }) {
  return (
    <header data-testid="final-cancelled" className="mb-6 flex flex-col items-center text-center">
      <span
        aria-hidden="true"
        className={`flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-[var(--pwa-border)] ${subtle}`}
      >
        <IconClosed />
      </span>
      <p className={`${subtle} m-0 mt-4 text-xs`}>{meta}</p>
      <h1 className={`${heading} m-0 mt-1 text-[1.75rem] leading-tight`}>Pedido cancelado</h1>
      <p className={`${subtle} m-0 mt-1 max-w-[34ch] text-sm`}>{body}</p>
      {children && <div className="mt-5 flex w-full flex-col gap-2">{children}</div>}
    </header>
  );
}
