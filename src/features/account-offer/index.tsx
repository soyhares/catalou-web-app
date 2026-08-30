import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestActivation } from '@entities/customer/api';
import { readSession } from '@shared/lib/customer-session';
import {
  usePostConversionPrompt,
  startPromptCooldown,
} from '@shared/lib/usePostConversionPrompt';
import { AccountOfferSheet } from './AccountOfferSheet';
import { canOffer } from './offer-state';

/**
 * SPEC-022 (T037, T039) — the account offer as mounted by the order confirmation.
 *
 * Owns the two states the shopper can be in after the order: being offered the account, and
 * waiting for the code already sent to their inbox (FR-007b).
 */

interface AccountOfferProps {
  slug: string;
  orderId: string | null;
  email: string | null;
}

export function AccountOffer({ slug, orderId, email }: AccountOfferProps) {
  const navigate = useNavigate();
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  // The offer needs an order to anchor to, and is pointless for someone already signed in.
  const eligible = useMemo(
    () => Boolean(orderId && email) && !readSession(slug) && canOffer(slug),
    [slug, orderId, email],
  );

  const wants = eligible && !dismissed;
  const mayShow = usePostConversionPrompt(slug, 'account', wants);

  if (!wants || !orderId || !email) return null;

  if (maskedEmail) {
    return (
      <div
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-sm rounded-2xl px-5 py-4 text-center shadow-xl"
        style={{ backgroundColor: 'var(--pwa-surface, #ffffff)' }}
      >
        <p className="text-sm" style={{ color: 'var(--pwa-text)' }}>
          Te enviamos un código a {maskedEmail}
        </p>
        <button
          type="button"
          onClick={() => void navigate('/activate-account', { state: { email, slug } })}
          className="mt-3 w-full py-3 text-sm font-semibold"
          style={{
            backgroundColor: 'var(--pwa-accent)',
            color: 'var(--pwa-on-accent)',
            borderRadius: 'var(--pwa-radius-button)',
          }}
        >
          Ingresar el código
        </button>
        <button
          type="button"
          disabled={isResending || resent}
          onClick={() => {
            setIsResending(true);
            requestActivation(slug, { email, orderId })
              .then(() => setResent(true))
              .catch(() => undefined)
              .finally(() => setIsResending(false));
          }}
          className="mt-2 w-full py-2 text-[12px] disabled:opacity-60"
          style={{ color: 'var(--pwa-text-secondary)' }}
        >
          {resent ? 'Código reenviado' : isResending ? 'Reenviando...' : 'Reenviar el código'}
        </button>
      </div>
    );
  }

  if (!mayShow) return null;

  return (
    <AccountOfferSheet
      slug={slug}
      orderId={orderId}
      email={email}
      onCodeSent={setMaskedEmail}
      onDismiss={() => {
        setDismissed(true);
        startPromptCooldown(slug, 'account');
      }}
    />
  );
}
