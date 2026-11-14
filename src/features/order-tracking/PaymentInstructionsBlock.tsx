import type { PaymentInstructions } from '@entities/order/tracking-api';
import { CopyValue } from './CopyValue';
import { formatIban, formatSinpePhone, sinpeCopyValue } from './payment';

const label = 'mb-0.5 mt-2 font-[family-name:var(--pwa-font-heading)] text-[0.95rem] italic text-[var(--pwa-text-secondary)]';
const note = 'mt-1.5 font-[family-name:var(--pwa-font-body)] text-xs text-[var(--pwa-text-secondary)]';

/**
 * Datos de pago tal como estaban al crear el pedido (FR-014, US2 AS4). Solo los del método
 * elegido; en efectivo no hay nada que copiar.
 */
export function PaymentInstructionsBlock({ instructions }: { instructions: PaymentInstructions }) {
  if (instructions.method === 'SINPE_MOVIL' && instructions.sinpePhone) {
    return (
      <div>
        <p className={label}>Pagá por SINPE Móvil</p>
        <CopyValue
          display={formatSinpePhone(instructions.sinpePhone)}
          value={sinpeCopyValue(instructions.sinpePhone)}
          copyLabel="Copiar número de SINPE Móvil"
        />
        {instructions.sinpeHolder && <p className={note}>A nombre de {instructions.sinpeHolder}</p>}
      </div>
    );
  }

  if (instructions.method === 'BANK_TRANSFER' && instructions.iban) {
    return (
      <div>
        <p className={label}>Pagá por transferencia bancaria</p>
        <CopyValue
          display={formatIban(instructions.iban)}
          value={instructions.iban.replace(/\s/g, '')}
          copyLabel="Copiar IBAN"
        />
        {(instructions.ibanHolder || instructions.ibanBank) && (
          <p className={note}>
            {instructions.ibanHolder ? `A nombre de ${instructions.ibanHolder}` : ''}
            {instructions.ibanHolder && instructions.ibanBank ? ', ' : ''}
            {instructions.ibanBank ?? ''}
          </p>
        )}
      </div>
    );
  }

  if (instructions.method === 'CASH') {
    return <p className={`${note} text-sm`}>Pagás en efectivo cuando recibís tu pedido.</p>;
  }

  return null;
}
