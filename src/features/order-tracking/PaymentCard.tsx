import type { OrderTracking } from '@entities/order/tracking-api';
import { PaymentInstructionsBlock } from './PaymentInstructionsBlock';
import { IconCheckSmall, IconClock } from './icons';
import { paymentAmountRows, paymentStatusLabel, paymentSummary } from './payment';

const card = 'mb-2.5 rounded-[var(--pwa-radius-md)] border border-[var(--pwa-border)] bg-[var(--pwa-card)] p-3 font-[family-name:var(--pwa-font-body)] text-[var(--pwa-text)]';

/**
 * Tarjeta de pago, separada de la línea de tiempo (FR-031). Montos según D53 (FR-032). Los
 * datos para pagar solo llegan mientras el pago está pendiente y el pedido abierto.
 */
export function PaymentCard({ tracking }: { tracking: OrderTracking }) {
  const { payment } = tracking;
  const rows = paymentAmountRows(tracking.amounts);
  const verified = payment.status === 'VERIFIED';
  const showInstructions = !verified && payment.instructions && tracking.status !== 'CANCELLED';

  return (
    <section aria-labelledby="payment-card-title" className={card}>
      <div className="flex items-center justify-between gap-2.5 py-0.5">
        <h2 id="payment-card-title" className="m-0 text-[13px] font-bold">Pago</h2>
        <span className="inline-flex items-center gap-1.5 rounded-[var(--pwa-radius-chip)] border border-[var(--pwa-border)] px-2.5 py-1 text-xs font-bold">
          {verified ? <IconCheckSmall className="h-[13px] w-[13px]" /> : <IconClock />}
          {paymentStatusLabel(payment.status)}
        </span>
      </div>
      <p className="m-0 py-0.5 text-[13px] text-[var(--pwa-text-secondary)]">{paymentSummary(payment)}</p>

      {rows.length > 0 && (
        <dl className="m-0 mt-1">
          {rows.map((row) => (
            <div
              key={row.kind}
              className={`flex justify-between gap-2.5 py-[3px] text-[13px] ${row.emphasis && rows.length > 1 ? 'mt-1 border-t border-[var(--pwa-border)] pt-1.5' : ''}`}
            >
              <dt className={row.emphasis ? 'font-bold' : 'text-[var(--pwa-text-secondary)]'}>{row.label}</dt>
              <dd className={`m-0 tabular-nums ${row.emphasis ? 'font-bold' : ''}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {showInstructions && payment.instructions && <PaymentInstructionsBlock instructions={payment.instructions} />}
    </section>
  );
}
