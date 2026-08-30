import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNavigation } from './useNavigation';
import { saveSession, clearSession } from '@shared/lib/customer-session';
import type { CustomerSession } from '@shared/lib/customer-session';

/**
 * El segundo tab es la única puerta a la cuenta en toda la PWA (no hay login clásico), así
 * que su destino según haya sesión o no es lo que hay que dejar clavado. Antes ese tab
 * simplemente no existía sin sesión y quien perdía la suya quedaba sin entrada.
 */

const branding = { featuresEnabled: { orders: true, bookings: true }, companyName: 'Demo', logoUrl: null };

vi.mock('@app/BrandingContext', () => ({
  useBranding: () => ({ slug: 'demo', branding }),
}));
vi.mock('@shared/lib/use-cart', () => ({ useCart: () => ({ items: [] }) }));

const SESSION: CustomerSession = {
  accessToken: 'a',
  refreshToken: 'r',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  customer: { id: 'c1', name: 'Cliente', email: 'c@d.com', phone: null },
};

function render() {
  return renderHook(() => useNavigation(), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={['/catalog']}>{children}</MemoryRouter>,
  });
}

describe('useNavigation', () => {
  beforeEach(() => clearSession('demo'));

  it('sin sesión el segundo tab lleva a Nosotros, que es donde se ofrece entrar', () => {
    const { result } = render();
    expect(result.current.links).toEqual([
      { label: 'Inicio', path: '/catalog' },
      { label: 'Nosotros', path: '/about' },
    ]);
  });

  it('con sesión el segundo tab lleva a la actividad de la persona', () => {
    saveSession('demo', SESSION);
    const { result } = render();
    expect(result.current.links[1]).toEqual({ label: 'Mi actividad', path: '/account' });
  });

  it('Citas ya no es un tab: subió al header junto al carrito', () => {
    const { result } = render();
    expect(result.current.links.some((l) => l.path === '/appointments')).toBe(false);
    expect(result.current.bookingsEnabled).toBe(true);
  });
});
