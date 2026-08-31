import { publicFetch, ApiError } from '@shared/lib/api';
import type { components } from '@generated/customers';
import {
  getAccessToken,
  expireSession,
  clearTenantTraces,
  type CustomerSession,
  type CustomerProfile,
} from '@shared/lib/customer-session';

/**
 * SPEC-022 (T035) — customer-account endpoints. Contract: `contracts/openapi/customers.yaml`.
 * Only the activation pair is wired here; the account panel arrives with US2/US3.
 */

export type RequestActivationResponse = components['schemas']['RequestActivationResponse'];

/** Wire shape of `POST /customers/{slug}/activation/verify` (snake-free, camelCase). */
type VerifyActivationResponse = components['schemas']['CustomerSession'];

/**
 * `orderId` va en el ALTA (lo aporta el pedido recién hecho) y se omite en el REINGRESO de
 * quien ya es cliente. La respuesta es la misma en ambos casos: nunca revela cuál fue.
 */
export async function requestActivation(
  slug: string,
  input: { email: string; orderId?: string },
): Promise<RequestActivationResponse> {
  return publicFetch<RequestActivationResponse>(
    `/customers/${encodeURIComponent(slug)}/activation/request`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export interface VerifiedActivation {
  session: CustomerSession;
  /** Orders linked retroactively when the account was created (FR-014). */
  linkedOrderCount: number;
}

export async function verifyActivation(
  slug: string,
  input: { email: string; code: string },
): Promise<VerifiedActivation> {
  const res = await publicFetch<VerifyActivationResponse>(
    `/customers/${encodeURIComponent(slug)}/activation/verify`,
    { method: 'POST', body: JSON.stringify(input) },
  );
  return {
    session: {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: res.expiresAt,
      customer: {
        id: res.customer.id,
        name: res.customer.name,
        email: res.customer.email,
        phone: res.customer.phone ?? null,
      },
    },
    linkedOrderCount: res.linkedOrderCount ?? 0,
  };
}

/* ── Cuenta del cliente autenticado (US3) ─────────────────────────────────── */

export type { CustomerProfile };

export type CustomerOrderSummary = components['schemas']['CustomerOrderSummary'];

/**
 * Igual que `publicFetch`, pero con el bearer del cliente de ESTE negocio.
 *
 * Un 401 cierra la sesión local: el token dejó de servir y dejarlo guardado solo produce
 * pantallas que fallan en silencio. Se usa `expireSession` y no `clearSession` porque esto no
 * lo pidió la persona — recordar su correo es lo que hace que el reingreso sea un toque y no
 * un formulario. Nunca cae de vuelta a otra identidad.
 */
async function customerFetch<T>(
  slug: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken(slug);
  if (!token) throw new ApiError(401, 'No customer session');

  try {
    return await publicFetch<T>(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) expireSession(slug);
    throw err;
  }
}

export async function getCustomerProfile(slug: string): Promise<CustomerProfile> {
  return customerFetch<CustomerProfile>(slug, `/customers/${encodeURIComponent(slug)}/me`);
}

export async function updateCustomerProfile(
  slug: string,
  input: { name?: string; phone?: string | null },
): Promise<CustomerProfile> {
  return customerFetch<CustomerProfile>(slug, `/customers/${encodeURIComponent(slug)}/me`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function listCustomerOrders(
  slug: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<{ items: CustomerOrderSummary[]; nextCursor: string | null }> {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const qs = query.toString();
  return customerFetch(slug, `/customers/${encodeURIComponent(slug)}/me/orders${qs ? `?${qs}` : ''}`);
}

/** Baja self-service (gate legal §3). Nunca borra pedidos: quedan sin cliente asociado. */
export async function deleteOwnAccount(slug: string): Promise<void> {
  await customerFetch<void>(slug, `/customers/${encodeURIComponent(slug)}/me`, {
    method: 'DELETE',
  });
  // La cuenta ya no existe: el dispositivo no debe conservar ninguna marca de haberla tenido.
  // Si quedara alguna, la PWA le seguiría ofreciendo reingreso y la API respondería 200 sin
  // mandar nada — la puerta a ninguna parte que produjo el reporte de "la borré y entro igual".
  clearTenantTraces(slug);
}
