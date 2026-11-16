import type { TimelineStep } from './timeline';
import { formatClockTime, formatStepDate } from './format-date';
import { IconCheckSmall } from './icons';

/** Texto de apoyo: el color del texto atenuado hacia el fondo, así mantiene AA con cualquier paleta. */
const subtle = 'text-[color:color-mix(in_srgb,var(--pwa-text)_72%,var(--pwa-bg))]';

/**
 * Línea de tiempo del pedido (FR-031, FR-046): lista ordenada; el paso actual lleva
 * `aria-current="step"`, además de distinguirse por forma y subrayado, no solo por color.
 *
 * El paso siguiente de un pedido abierto (`nextNote`) está "vivo": punto hueco punteado, un
 * brillo lento que recorre el rótulo y la línea de apoyo ("Esperando al negocio"). Cuando el
 * pedido avanza, ese paso pasa a actual con la entrada que ya tienen los cambios (`step-in`).
 */
export function TrackingTimeline({ steps, changeId = 0 }: { steps: TimelineStep[]; changeId?: number }) {
  return (
    <ol aria-label="Estado del pedido" className="m-0 list-none p-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const changed = changeId > 0 && step.state === 'current';
        const date = formatStepDate(step.at);
        const dot =
          step.state === 'done'
            ? 'border-[var(--pwa-accent)] bg-[var(--pwa-accent)] text-[var(--pwa-on-accent)]'
            : step.state === 'current'
              ? 'border-[var(--pwa-text)] bg-[var(--pwa-bg)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--pwa-text)_10%,transparent)]'
              : step.nextNote
                ? 'border-dashed border-[color:color-mix(in_srgb,var(--pwa-text)_45%,var(--pwa-bg))] bg-[var(--pwa-bg)]'
                : 'border-[var(--pwa-border)] bg-[var(--pwa-bg)]';
        return (
          <li
            key={changed ? `${step.status}-${changeId}` : step.status}
            aria-current={step.state === 'current' ? 'step' : undefined}
            data-testid={step.nextNote ? 'next-step' : undefined}
            className={`relative flex gap-2.5 pb-3 font-[family-name:var(--pwa-font-body)] text-[13px] text-[var(--pwa-text)] ${changed ? 'motion-safe:animate-step-in' : ''}`}
          >
            {!isLast && (
              <span aria-hidden="true" className="absolute bottom-0 left-2 top-5 w-0.5 bg-[var(--pwa-border)]" />
            )}
            <span aria-hidden="true" className={`z-[1] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2 ${dot} ${changed ? 'motion-safe:animate-dot-pulse' : ''}`}>
              {step.state === 'done' && <IconCheckSmall />}
            </span>
            {step.nextNote ? (
              <NextStepLabel label={step.label} note={step.nextNote} />
            ) : (
              <div>
                <span
                  className={`block font-bold ${step.state === 'current' ? 'underline underline-offset-[3px]' : ''} ${step.state === 'upcoming' ? 'text-[var(--pwa-text-secondary)]' : ''}`}
                >
                  {step.label}
                </span>
                {date && step.state !== 'upcoming' && (
                  <span className="text-xs text-[var(--pwa-text-secondary)]">{date}</span>
                )}
                {step.state === 'current' && <span className="sr-only"> (paso actual)</span>}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Rótulo del paso siguiente. El texto base queda quieto y legible; encima, una copia decorativa
 * deja ver solo una franja del color del texto que se desplaza (`next-shimmer`). Con movimiento
 * reducido la copia no se muestra y el paso queda estático.
 */
function NextStepLabel({ label, note }: { label: string; note: string }) {
  return (
    <div>
      <span className="sr-only">
        Próximo paso: {label}, {note.charAt(0).toLowerCase() + note.slice(1)}
      </span>
      <span aria-hidden="true" className="relative block w-fit font-bold">
        <span className={subtle}>{label}</span>
        <span
          data-testid="next-step-shimmer"
          className="pointer-events-none absolute inset-0 whitespace-nowrap bg-[linear-gradient(100deg,transparent_35%,var(--pwa-text)_50%,transparent_65%)] bg-[length:250%_100%] bg-clip-text bg-no-repeat text-transparent motion-safe:animate-next-shimmer motion-reduce:hidden"
        >
          {label}
        </span>
      </span>
      <span aria-hidden="true" className={`block text-xs ${subtle}`}>
        {note}
      </span>
    </div>
  );
}

/**
 * "Última actualización 9:41 a. m.": la hora de la última respuesta buena. En cada refresco la
 * hora entra con un fundido; si un refresco falla se queda la última hora buena, sin aviso.
 */
export function LastUpdated({ at }: { at: number }) {
  return (
    <p
      data-testid="last-updated"
      className={`m-0 mt-1 border-t border-[var(--pwa-border)] pt-2.5 font-[family-name:var(--pwa-font-body)] text-[11px] ${subtle}`}
    >
      Última actualización{' '}
      <time key={at} dateTime={new Date(at).toISOString()} className="tabular-nums motion-safe:animate-time-fade">
        {formatClockTime(at)}
      </time>
    </p>
  );
}
