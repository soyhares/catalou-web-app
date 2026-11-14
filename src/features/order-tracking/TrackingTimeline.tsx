import type { TimelineStep } from './timeline';
import { formatStepDate } from './format-date';
import { IconCheckSmall } from './icons';

/**
 * Línea de tiempo del pedido (FR-031, FR-046): lista ordenada; el paso actual lleva
 * `aria-current="step"`, además de distinguirse por forma y subrayado, no solo por color.
 */
export function TrackingTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol aria-label="Estado del pedido" className="m-0 list-none p-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const date = formatStepDate(step.at);
        const dot =
          step.state === 'done'
            ? 'border-[var(--pwa-accent)] bg-[var(--pwa-accent)] text-[var(--pwa-on-accent)]'
            : step.state === 'current'
              ? 'border-[var(--pwa-text)] bg-[var(--pwa-bg)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--pwa-text)_10%,transparent)]'
              : 'border-[var(--pwa-border)] bg-[var(--pwa-bg)]';
        return (
          <li
            key={step.status}
            aria-current={step.state === 'current' ? 'step' : undefined}
            className="relative flex gap-2.5 pb-3 font-[family-name:var(--pwa-font-body)] text-[13px] text-[var(--pwa-text)]"
          >
            {!isLast && (
              <span aria-hidden="true" className="absolute bottom-0 left-2 top-5 w-0.5 bg-[var(--pwa-border)]" />
            )}
            <span aria-hidden="true" className={`z-[1] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2 ${dot}`}>
              {step.state === 'done' && <IconCheckSmall />}
            </span>
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
          </li>
        );
      })}
    </ol>
  );
}
