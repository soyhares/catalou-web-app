import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveSession,
  clearSession,
  readSession,
  readLastEmail,
  getAccessToken,
  type CustomerSession,
} from './customer-session';

/**
 * Dos defectos reales que hacían que la cuenta "venciera muy rápido". Ninguno era la
 * duración del token:
 *
 * 1. Dos peticiones concurrentes con el token por vencer disparaban dos refreshes con el
 *    MISMO refresh token. Supabase los rota, así que el segundo recibía 400 y la sesión se
 *    borraba sola. Pasaba de forma sistemática al abrir `/account`, que hace
 *    `Promise.all([perfil, pedidos])`.
 * 2. Cualquier `!res.ok` — un 500, un timeout, estar sin señal — se trataba igual que un
 *    token muerto y también borraba la cuenta.
 */

const SLUG = 'demo';

function session(overrides: Partial<CustomerSession> = {}): CustomerSession {
  return {
    accessToken: 'viejo',
    refreshToken: 'r1',
    expiresAt: new Date(Date.now() - 1000).toISOString(), // vencido: fuerza el refresh
    customer: { id: 'c1', name: 'Cliente', email: 'c@d.com', phone: null },
    ...overrides,
  };
}

const okBody = { access_token: 'nuevo', refresh_token: 'r2', expires_at: Math.floor(Date.now() / 1000) + 3600 };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
afterEach(() => vi.restoreAllMocks());

describe('getAccessToken', () => {
  it('devuelve el token sin refrescar cuando todavía sirve', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    saveSession(SLUG, session({ expiresAt: new Date(Date.now() + 3_600_000).toISOString() }));

    await expect(getAccessToken(SLUG)).resolves.toBe('viejo');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('dos llamadas concurrentes comparten UN solo refresh', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(okBody), { status: 200 }),
    );
    saveSession(SLUG, session());

    const [a, b] = await Promise.all([getAccessToken(SLUG), getAccessToken(SLUG)]);

    // Sin single-flight, el segundo refresh reusaba `r1` ya rotado → 400 → sesión borrada.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(a).toBe('nuevo');
    expect(b).toBe('nuevo');
    expect(readSession(SLUG)?.refreshToken).toBe('r2');
  });

  it('un 400 sí termina la sesión, y recuerda el correo para el reingreso', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 400 }));
    saveSession(SLUG, session());

    await expect(getAccessToken(SLUG)).resolves.toBeNull();
    expect(readSession(SLUG)).toBeNull();
    expect(readLastEmail(SLUG)).toBe('c@d.com');
  });

  it('un 500 NO borra la sesión', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    saveSession(SLUG, session());

    await getAccessToken(SLUG);

    expect(readSession(SLUG)).not.toBeNull();
  });

  it('estar sin red NO borra la sesión', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    saveSession(SLUG, session());

    await getAccessToken(SLUG);

    expect(readSession(SLUG)).not.toBeNull();
  });

  it('sin sesión no hay token ni llamada', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    clearSession(SLUG);

    await expect(getAccessToken(SLUG)).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
