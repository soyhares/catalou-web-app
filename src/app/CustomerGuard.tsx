import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useBranding } from '@app/BrandingContext';
import { readSession } from '@shared/lib/customer-session';

/**
 * SPEC-022 (T056) — protege las pantallas del cliente autenticado.
 *
 * Lee la sesión de ESTE negocio, nunca "una sesión cualquiera": la misma persona puede tener
 * cuenta en varios negocios y en este no tenerla (FR-010). Sin sesión se va al catálogo, no a
 * una pantalla de login: en esta PWA no existe tal cosa, la cuenta se activa desde un pedido.
 */
export function CustomerGuard({ children }: { children: ReactNode }) {
  const { slug } = useBranding();
  if (!readSession(slug)) return <Navigate to="/catalog" replace />;
  return <>{children}</>;
}
