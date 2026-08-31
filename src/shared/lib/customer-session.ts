/**
 * SPEC-022 (T034) — customer-account session for the tenant PWA.
 *
 * The session is a REAL Supabase session issued by the API (never a token of our own,
 * Principio V). This module only stores it and keeps it fresh.
 *
 * Storage is namespaced by slug: one browser can hold sessions for several tenants, and a
 * session must never leak from one business to another (FR-010).
 *
 * ponytail: no @supabase/supabase-js here. Refreshing is one POST to the GoTrue REST
 * endpoint, and this is a mobile-first PWA where a ~50KB auth client for a single request
 * is not worth it. If session handling grows (OAuth, magic links in-app), add the SDK then.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface CustomerSession {
  accessToken: string;
  refreshToken: string;
  /** ISO-8601 */
  expiresAt: string;
  customer: CustomerProfile;
}

const key = (slug: string) => `catalou_customer_session_${slug}`;

/**
 * Correo de la última sesión de este negocio, que sobrevive a su cierre.
 *
 * Existe solo para que el reingreso no obligue a teclear de nuevo el correo cuando la sesión
 * venció sola. No es una credencial — el código sigue llegando al buzón, que es lo que prueba
 * la identidad — y nunca sale del dispositivo.
 */
const lastEmailKey = (slug: string) => `catalou_customer_last_email_${slug}`;

/** Refresh a bit early so an in-flight request never races the expiry. */
const REFRESH_MARGIN_MS = 60_000;

export function readSession(slug: string): CustomerSession | null {
  try {
    const raw = localStorage.getItem(key(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerSession;
    if (!parsed?.accessToken || !parsed?.customer?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(slug: string, session: CustomerSession): void {
  try {
    localStorage.setItem(key(slug), JSON.stringify(session));
  } catch {
    // Private mode or full storage: the session simply does not survive a reload.
  }
}

export function clearSession(slug: string): void {
  try {
    localStorage.removeItem(key(slug));
  } catch {
    // ignore
  }
}

/**
 * Cierra la sesión recordando a quién pertenecía, para que el reingreso arranque con el
 * correo puesto. Se usa cuando la sesión se pierde **sin que la persona lo pidiera** (venció,
 * el token dejó de servir); `onSignOut` usa `clearSession` a secas.
 */
export function expireSession(slug: string): void {
  const email = readSession(slug)?.customer.email;
  clearSession(slug);
  if (!email) return;
  try {
    localStorage.setItem(lastEmailKey(slug), email);
  } catch {
    // El reingreso simplemente pedirá el correo a mano.
  }
}

/** Correo con el que arrancar el reingreso. `null` si nunca hubo sesión en este negocio. */
export function readLastEmail(slug: string): string | null {
  try {
    return localStorage.getItem(lastEmailKey(slug));
  } catch {
    return null;
  }
}

export function clearLastEmail(slug: string): void {
  try {
    localStorage.removeItem(lastEmailKey(slug));
  } catch {
    // ignore
  }
}

function isExpired(session: CustomerSession): boolean {
  const at = Date.parse(session.expiresAt);
  return !Number.isFinite(at) || at - REFRESH_MARGIN_MS <= Date.now();
}

type RefreshOutcome =
  /** Sesión renovada y guardada. */
  | { status: 'ok'; session: CustomerSession }
  /** El refresh token ya no sirve: la sesión terminó de verdad. */
  | { status: 'dead' }
  /** No se pudo preguntar (offline, 5xx, timeout). La sesión NO se toca. */
  | { status: 'unavailable' };

/**
 * Un refresh en vuelo por negocio, compartido por todos los llamadores.
 *
 * Sin esto, dos peticiones concurrentes con el token por vencer disparaban dos refreshes con
 * el MISMO refresh token. Supabase los rota: el primero lo consume y el segundo recibe 400,
 * así que la sesión se borraba sola. Pasaba de forma sistemática al abrir `/account`
 * (`Promise.all([perfil, pedidos])`) y en el checkout (precarga + envío del pedido).
 */
const inFlight = new Map<string, Promise<RefreshOutcome>>();

async function requestRefresh(
  slug: string,
  session: CustomerSession,
): Promise<RefreshOutcome> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { status: 'dead' };
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });
  } catch {
    // Sin red. Perder la cuenta por un instante sin señal sería absurdo.
    return { status: 'unavailable' };
  }

  // Solo 4xx significa que el token murió. Un 5xx o un corte es un "ahora no".
  if (!res.ok) return res.status >= 400 && res.status < 500 ? { status: 'dead' } : { status: 'unavailable' };

  try {
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    };
    if (!data.access_token || !data.refresh_token || !data.expires_at) return { status: 'dead' };
    const next: CustomerSession = {
      ...session,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at * 1000).toISOString(),
    };
    saveSession(slug, next);
    return { status: 'ok', session: next };
  } catch {
    return { status: 'unavailable' };
  }
}

function refresh(slug: string, session: CustomerSession): Promise<RefreshOutcome> {
  const running = inFlight.get(slug);
  if (running) return running;
  const promise = requestRefresh(slug, session).finally(() => inFlight.delete(slug));
  inFlight.set(slug, promise);
  return promise;
}

/**
 * Returns a usable bearer for this tenant, refreshing it when needed. `null` means the
 * customer is signed out for this business — the caller offers activation again, it never
 * falls back to any other identity.
 *
 * La sesión solo se da por terminada cuando el proveedor lo dice. Ante un fallo transitorio
 * se devuelve el token que había: puede que le queden segundos útiles y, si no, la respuesta
 * 401 del API resuelve el caso por el camino normal.
 */
export async function getAccessToken(slug: string): Promise<string | null> {
  const session = readSession(slug);
  if (!session) return null;
  if (!isExpired(session)) return session.accessToken;

  const outcome = await refresh(slug, session);
  if (outcome.status === 'ok') return outcome.session.accessToken;
  if (outcome.status === 'unavailable') return session.accessToken;

  expireSession(slug);
  return null;
}
