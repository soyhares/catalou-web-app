import { useEffect, useState } from 'react';
import { IconCopy } from './icons';

interface CopyValueProps {
  /** Lo que se ve (con espacios para leerlo mejor). */
  display: string;
  /** Lo que se copia (sin espacios). */
  value: string;
  /** Nombre accesible del botón, p. ej. "Copiar número de SINPE Móvil". */
  copyLabel: string;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

/**
 * Dato de pago con botón "Copiar" (FR-013, FR-046). El resultado se anuncia en una región
 * `aria-live`; si el navegador no deja copiar, se dice cómo hacerlo a mano.
 */
export function CopyValue({ display, value, copyLabel }: CopyValueProps) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status !== 'copied') return;
    const id = window.setTimeout(() => setStatus('idle'), 2500);
    return () => window.clearTimeout(id);
  }, [status]);

  function onCopy() {
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clipboard?.writeText) {
      setStatus('failed');
      return;
    }
    clipboard.writeText(value).then(
      () => setStatus('copied'),
      () => setStatus('failed'),
    );
  }

  return (
    <div>
      <div className="mt-1.5 flex items-center justify-between gap-2 rounded-[var(--pwa-radius-sm)] bg-[color-mix(in_srgb,var(--pwa-text)_6%,var(--pwa-card))] py-1 pl-3 pr-1">
        <span className="select-all font-[family-name:var(--pwa-font-body)] text-sm tabular-nums text-[var(--pwa-text)]">
          {display}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copyLabel}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[var(--pwa-radius-sm)] px-3 font-[family-name:var(--pwa-font-body)] text-xs font-bold text-[var(--pwa-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pwa-text)]"
        >
          <IconCopy />
          <span aria-hidden="true">{status === 'copied' ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-0 font-[family-name:var(--pwa-font-body)] text-xs text-[var(--pwa-text-secondary)]">
        {status === 'copied' && <span className="sr-only">Copiado</span>}
        {status === 'failed' && (
          <span className="mt-1 block">No se pudo copiar. Mantené presionado el dato para copiarlo.</span>
        )}
      </p>
    </div>
  );
}
