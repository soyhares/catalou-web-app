import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { verifyActivation } from '@entities/customer/api';
import { saveSession } from '@shared/lib/customer-session';
import { recordOffer } from '@features/account-offer/offer-state';

/**
 * SPEC-022 (T040) — code entry, without leaving the application (FR-004b).
 *
 * The email link is the secondary path (FR-004c): it lands here on the business's own site
 * with `?email=` and, when present, `?code=` prefilled. Both paths end in the same exchange.
 */

export interface ActivateAccountPageProps {
  email: string;
  code: string;
  isVerifying: boolean;
  error: string | null;
  /**
   * Orders linked retroactively (FR-014, T062). Non-null once the account exists: the
   * account must not look empty when the order that motivated it is already in there.
   */
  linkedOrderCount: number | null;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDone: () => void;
}

export function useActivateAccountPage(): ActivateAccountPageProps {
  const { slug } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const email = stateEmail ?? searchParams.get('email') ?? '';

  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedOrderCount, setLinkedOrderCount] = useState<number | null>(null);

  function onCodeChange(value: string) {
    setCode(value.replace(/\D/g, '').slice(0, 6));
  }

  function onSubmit() {
    if (code.length !== 6 || !email) return;
    setIsVerifying(true);
    setError(null);
    verifyActivation(slug, { email, code })
      .then(({ session, linkedOrderCount: linked }) => {
        saveSession(slug, session);
        recordOffer(slug, 'activated');
        setLinkedOrderCount(linked);
      })
      .catch(() => {
        // The API answers the same way for a wrong, expired or already used code, on purpose.
        setError('El código no es válido o ya venció. Pedí uno nuevo.');
      })
      .finally(() => setIsVerifying(false));
  }

  function onCancel() {
    void navigate('/catalog', { replace: true });
  }

  return {
    email,
    code,
    isVerifying,
    error,
    linkedOrderCount,
    onCodeChange,
    onSubmit,
    onCancel,
    onDone: onCancel,
  };
}
