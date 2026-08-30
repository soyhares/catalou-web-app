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

function isExpired(session: CustomerSession): boolean {
  const at = Date.parse(session.expiresAt);
  return !Number.isFinite(at) || at - REFRESH_MARGIN_MS <= Date.now();
}

async function refresh(slug: string, session: CustomerSession): Promise<CustomerSession | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    };
    if (!data.access_token || !data.refresh_token || !data.expires_at) return null;
    const next: CustomerSession = {
      ...session,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at * 1000).toISOString(),
    };
    saveSession(slug, next);
    return next;
  } catch {
    return null;
  }
}

/**
 * Returns a usable bearer for this tenant, refreshing it when needed. `null` means the
 * customer is signed out for this business — the caller offers activation again, it never
 * falls back to any other identity.
 */
export async function getAccessToken(slug: string): Promise<string | null> {
  const session = readSession(slug);
  if (!session) return null;
  if (!isExpired(session)) return session.accessToken;

  const refreshed = await refresh(slug, session);
  if (!refreshed) {
    clearSession(slug);
    return null;
  }
  return refreshed.accessToken;
}
