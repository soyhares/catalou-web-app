import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import {
  getCustomerProfile,
  listCustomerOrders,
  updateCustomerProfile,
  deleteOwnAccount,
  type CustomerProfile,
  type CustomerOrderSummary,
} from '@entities/customer/api';
import { clearSession, readSession, saveSession } from '@shared/lib/customer-session';
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
  /** Qué secciones muestra la pantalla. Un negocio Business ve pedidos y reservas. */
  ordersEnabled: boolean;
  bookingsEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  /** Edición del perfil en la misma pantalla: el endpoint ya existía y no lo usaba nadie. */
  isEditing: boolean;
  isSaving: boolean;
  editName: string;
  editPhone: string;
  onRetry: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (value: string) => void;
  onEditPhoneChange: (value: string) => void;
  onSaveProfile: () => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

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

  function onStartEdit() {
    setEditName(profile?.name ?? '');
    setEditPhone(profile?.phone ?? '');
    setIsEditing(true);
  }

  function onSaveProfile() {
    const name = editName.trim();
    if (!name || isSaving) return;
    setIsSaving(true);
    setError(null);
    const phone = editPhone.trim();
    updateCustomerProfile(slug, { name, phone: phone || null })
      .then((updated) => {
        setProfile(updated);
        // La copia en sesión alimenta el prellenado del checkout: si no se actualiza acá,
        // el checkout sigue ofreciendo el nombre viejo hasta la próxima activación.
        const session = readSession(slug);
        if (session) saveSession(slug, { ...session, customer: updated });
        setIsEditing(false);
      })
      .catch(() => setError('No pudimos guardar tus datos. Intentá de nuevo.'))
      .finally(() => setIsSaving(false));
  }

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
    ordersEnabled: branding.featuresEnabled?.orders === true,
    bookingsEnabled: branding.featuresEnabled?.bookings === true,
    isLoading,
    error,
    isDeleting,
    isEditing,
    isSaving,
    editName,
    editPhone,
    onRetry: load,
    onStartEdit,
    onCancelEdit: () => setIsEditing(false),
    onEditNameChange: setEditName,
    onEditPhoneChange: setEditPhone,
    onSaveProfile,
    onSignOut,
    onDeleteAccount,
    onGoBack: () => void navigate('/catalog'),
  };
}
