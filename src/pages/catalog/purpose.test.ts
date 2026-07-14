import { describe, it, expect } from 'vitest';
import { catalogSubtitle, resolveCardActionKind, CARD_ACTION_LABEL } from './purpose';

describe('catalogSubtitle', () => {
  it('maps each purpose to its voseo subtitle', () => {
    expect(catalogSubtitle('services')).toBe('Reservá tu cita');
    expect(catalogSubtitle('menu')).toBe('Hacé tu pedido');
    expect(catalogSubtitle('informative')).toBe('Conocé más');
  });

  it('treats a null (legacy) purpose as informative', () => {
    expect(catalogSubtitle(null)).toBe('Conocé más');
  });
});

describe('resolveCardActionKind', () => {
  const base = { productType: 'product' as const, ordersEnabled: true, bookingsEnabled: true };

  it('returns "book" for a services catalog when bookings are enabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'services' })).toBe('book');
  });

  it('returns "none" for a services catalog when bookings are disabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'services', bookingsEnabled: false })).toBe('none');
  });

  it('returns "add" for a menu catalog product when orders are enabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'menu' })).toBe('add');
  });

  it('returns "none" for a menu catalog when orders are disabled', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'menu', ordersEnabled: false })).toBe('none');
  });

  it('returns "none" for a service-type item inside a menu catalog (never add a service to cart)', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'menu', productType: 'service' })).toBe('none');
  });

  it('returns "none" for an informative catalog', () => {
    expect(resolveCardActionKind({ ...base, purpose: 'informative' })).toBe('none');
    expect(resolveCardActionKind({ ...base, purpose: null })).toBe('none');
  });

  it('labels: book→Reservar, add→Agregar, none→null', () => {
    expect(CARD_ACTION_LABEL.book).toBe('Reservar');
    expect(CARD_ACTION_LABEL.add).toBe('Agregar');
    expect(CARD_ACTION_LABEL.none).toBeNull();
  });
});
