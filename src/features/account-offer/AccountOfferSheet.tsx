import { useState } from 'react';
import { requestActivation } from '@entities/customer/api';
import { recordOffer } from './offer-state';

/**
 * SPEC-022 (T037) — the account offer, shown after the order is already confirmed.
 *
 * Accepting is an act of its own, never a pre-checked box nor a condition of the checkout
 * (FR-001, FR-002, gate legal §1). Copy is the approved wording, literal.
 */

interface AccountOfferSheetProps {
  slug: string;
  orderId: string;
  email: string;
  /** Dismissed without activating. */
  onDismiss: () => void;
  /** A code was sent: the caller shows the pending state (FR-007b). */
  onCodeSent: (maskedEmail: string) => void;
}

export function AccountOfferSheet({
  slug,
  orderId,
  email,
  onDismiss,
  onCodeSent,
}: AccountOfferSheetProps) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAccept() {
    setIsSending(true);
    setError(null);
    try {
      const res = await requestActivation(slug, { email, orderId });
      // Not recorded as activated yet: that only happens when the code is verified. If the
      // shopper abandons here, the offer is fair game on a later order.
      onCodeSent(res.maskedEmail);
    } catch {
      setError('No pudimos enviar el código. Intentá de nuevo en un momento.');
    } finally {
      setIsSending(false);
    }
  }

  function onLater() {
    recordOffer(slug, 'postponed');
    onDismiss();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-offer-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onLater} aria-hidden="true" />

      <div
        className="relative w-full sm:max-w-sm mx-auto rounded-t-2xl sm:rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--pwa-surface, #ffffff)' }}
      >
        <h2
          id="account-offer-title"
          className="text-lg font-semibold text-center"
          style={{ color: 'var(--pwa-text)', fontFamily: 'var(--pwa-font-heading)' }}
        >
          La próxima vez, más rápido
        </h2>

        <p
          className="mt-3 text-sm text-center leading-relaxed"
          style={{ color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)' }}
        >
          Guardamos tus datos para que no vuelvas a escribirlos y podés ver tus pedidos cuando
          quieras
        </p>

        <p
          className="mt-3 text-[11px] text-center leading-relaxed"
          style={{ color: 'var(--pwa-text-secondary)', opacity: 0.75 }}
        >
          Te enviamos un código a {email}. Guardamos tu nombre, correo y teléfono junto al
          historial de tus pedidos en este negocio.{' '}
          <a
            href="https://catalou.com/privacidad"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--pwa-accent)', textDecoration: 'underline' }}
          >
            Cómo tratamos tus datos
          </a>
        </p>

        {error && (
          <p className="mt-3 text-[12px] text-center" role="alert" style={{ color: '#b42318' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void onAccept()}
          disabled={isSending}
          className="mt-5 w-full py-3 text-sm font-semibold disabled:opacity-60"
          style={{
            backgroundColor: 'var(--pwa-accent)',
            color: 'var(--pwa-on-accent)',
            borderRadius: 'var(--pwa-radius-button)',
          }}
        >
          {isSending ? 'Enviando...' : 'Guardar mis datos'}
        </button>

        <button
          type="button"
          onClick={onLater}
          className="mt-2 w-full py-3 text-sm"
          style={{ color: 'var(--pwa-text-secondary)', fontFamily: 'var(--pwa-font-body)' }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
