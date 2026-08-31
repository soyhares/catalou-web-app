import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { requestActivation, verifyActivation } from '@entities/customer/api';
import {
  saveSession,
  readLastEmail,
  clearLastEmail,
  markKnownCustomer,
} from '@shared/lib/customer-session';
import { recordOffer } from '@features/account-offer/offer-state';

/**
 * SPEC-022 (T040) — code entry, without leaving the application (FR-004b).
 *
 * Tres caminos entran acá y terminan en el mismo canje:
 *
 * 1. **Alta** — el ofrecimiento post-pedido llega por `location.state` con `email`, y arranca
 *    en el paso del código.
 * 2. **Enlace del correo** (FR-004c) — aterriza con `?email=` en el sitio del propio negocio.
 * 3. **Reingreso** — quien ya es cliente y perdió su sesión entra sin nada y arranca por el
 *    paso del correo. Antes esta pantalla quedaba muerta sin `email`: `onSubmit` cortaba en
 *    seco y no había forma de volver a entrar a la cuenta.
 */

export type ActivateStep = 'email' | 'code';

export interface ActivateAccountPageProps {
  step: ActivateStep;
  /** La sesión venció sola: hay que decirlo, no dejar a la persona adivinando. */
  isExpiredSession: boolean;
  email: string;
  code: string;
  /** Correo enmascarado que devolvió el servidor: se muestra tras pedir el código. */
  maskedEmail: string | null;
  isRequesting: boolean;
  isVerifying: boolean;
  error: string | null;
  /**
   * Orders linked retroactively (FR-014, T062). Non-null once the account exists: the
   * account must not look empty when the order that motivated it is already in there.
   */
  linkedOrderCount: number | null;
  onEmailChange: (value: string) => void;
  onRequestCode: () => void;
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

  const navState = location.state as { email?: string; orderId?: string } | null;
  const isExpiredSession = searchParams.get('expired') === '1';
  const initialEmail =
    navState?.email ?? searchParams.get('email') ?? (isExpiredSession ? readLastEmail(slug) : null) ?? '';
  const orderId = navState?.orderId;

  const [email, setEmail] = useState(initialEmail);
  // Una sesión vencida arranca en el paso del correo aunque ya lo tengamos: el código viejo
  // no sirve, hay que pedir uno nuevo. Lo que se ahorra es teclear la dirección.
  const [step, setStep] = useState<ActivateStep>(
    initialEmail && !isExpiredSession ? 'code' : 'email',
  );
  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedOrderCount, setLinkedOrderCount] = useState<number | null>(null);

  function onEmailChange(value: string) {
    setEmail(value);
    if (error) setError(null);
  }

  function onRequestCode() {
    const trimmed = email.trim();
    if (!trimmed || isRequesting) return;
    setIsRequesting(true);
    setError(null);
    // Sin `orderId`: el servidor solo emite el código si ya sos cliente de este negocio, y
    // responde igual si no lo sos. Desde acá los dos casos son indistinguibles.
    requestActivation(slug, { email: trimmed, ...(orderId ? { orderId } : {}) })
      .then((res) => {
        setMaskedEmail(res.maskedEmail);
        setStep('code');
      })
      .catch(() => {
        // El 502 del servidor significa que el correo no salió — vale la pena reintentar.
        setError('No pudimos enviar el código. Intentá de nuevo en un momento.');
      })
      .finally(() => setIsRequesting(false));
  }

  function onCodeChange(value: string) {
    setCode(value.replace(/\D/g, '').slice(0, 6));
  }

  function onSubmit() {
    const trimmed = email.trim();
    if (code.length !== 6 || !trimmed) return;
    setIsVerifying(true);
    setError(null);
    verifyActivation(slug, { email: trimmed, code })
      .then(({ session, linkedOrderCount: linked }) => {
        saveSession(slug, session);
        clearLastEmail(slug);
        markKnownCustomer(slug);
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
    step,
    isExpiredSession,
    email,
    code,
    maskedEmail,
    isRequesting,
    isVerifying,
    error,
    linkedOrderCount,
    onEmailChange,
    onRequestCode,
    onCodeChange,
    onSubmit,
    onCancel,
    onDone: onCancel,
  };
}
