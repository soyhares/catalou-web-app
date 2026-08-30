import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import {
  getCustomerProfile,
  listCustomerOrders,
  deleteOwnAccount,
  type CustomerProfile,
  type CustomerOrderSummary,
} from '@entities/customer/api';
import { clearSession, readSession } from '@shared/lib/customer-session';
import { ApiError } from '@shared/lib/api';

/**
 * SPEC-022 (T056, T077) — la cuenta del cliente en la PWA del negocio.
 *
 * Todo lo que se ve acá está acotado a este negocio: perfil e historial. Nada de otro
 * negocio llega hasta acá, ni siquiera cuando la persona tiene cuenta en varios (FR-022).
 */

export interface AccountPageProps {
  profile: CustomerProfile | null;
  orders: CustomerOrderSummary[];
  currency: string;
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  onRetry: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onGoBack: () => void;
}

export function useAccountPage(): AccountPageProps {
  const { slug, branding } = useBranding();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(
    () => readSession(slug)?.customer ?? null,
  );
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([getCustomerProfile(slug), listCustomerOrders(slug)])
      .then(([me, history]) => {
        setProfile(me);
        setOrders(history.items);
      })
      .catch((err: unknown) => {
        // Un 401 ya dejó la sesión limpia: reintentar acá fallaría para siempre y el guard ya
        // corrió, así que la persona quedaría encerrada en una pantalla sin salida. Se la
        // devuelve al catálogo, donde el ofrecimiento vuelve a estar disponible.
        if (err instanceof ApiError && err.status === 401) {
          clearSession(slug);
          void navigate('/catalog', { replace: true });
          return;
        }
        setError('No pudimos cargar tu cuenta. Intentá de nuevo.');
      })
      .finally(() => setIsLoading(false));
  }, [slug, navigate]);

  useEffect(() => { load(); }, [load]);

  function onSignOut() {
    clearSession(slug);
    void navigate('/catalog', { replace: true });
  }

  function onDeleteAccount() {
    setIsDeleting(true);
    deleteOwnAccount(slug)
      .then(() => void navigate('/catalog', { replace: true }))
      .catch(() => setError('No pudimos eliminar tu cuenta. Intentá de nuevo.'))
      .finally(() => setIsDeleting(false));
  }

  return {
    profile,
    orders,
    currency: branding.currency ?? 'CRC',
    isLoading,
    error,
    isDeleting,
    onRetry: load,
    onSignOut,
    onDeleteAccount,
    onGoBack: () => void navigate('/catalog'),
  };
}
