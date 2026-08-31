import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useBranding } from '@app/BrandingContext';
import { readSession, readLastEmail } from '@shared/lib/customer-session';

/**
 * SPEC-022 (T056) — protege las pantallas del cliente autenticado.
 *
 * Lee la sesión de ESTE negocio, nunca "una sesión cualquiera": la misma persona puede tener
 * cuenta en varios negocios y en este no tenerla (FR-010).
 *
 * Sin sesión hay dos situaciones distintas y se tratan distinto. Si nunca hubo cuenta acá, al
 * catálogo: no hay nada que reanudar. Si la había y se perdió, al reingreso con el correo ya
 * puesto — antes también caía al catálogo, sin una palabra, y la persona no tenía forma de
 * saber que su sesión había vencido ni de volver a entrar.
 */
export function CustomerGuard({ children }: { children: ReactNode }) {
  const { slug } = useBranding();
  if (readSession(slug)) return <>{children}</>;

  return readLastEmail(slug)
    ? <Navigate to="/activate-account?expired=1" replace />
    : <Navigate to="/catalog" replace />;
}
