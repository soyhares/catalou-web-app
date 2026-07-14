import type { PublicCategory } from '@entities/catalog/api';

type Purpose = PublicCategory['purpose'];

export function catalogSubtitle(purpose: Purpose): string {
  if (purpose === 'services') return 'Reservá tu cita';
  if (purpose === 'menu') return 'Hacé tu pedido';
  return 'Conocé más';
}

export type CardActionKind = 'book' | 'add' | 'none';

export const CARD_ACTION_LABEL: Record<CardActionKind, string | null> = {
  book: 'Reservar',
  add: 'Agregar',
  none: null,
};

export function resolveCardActionKind(args: {
  purpose: Purpose;
  productType: 'product' | 'service';
  ordersEnabled: boolean;
  bookingsEnabled: boolean;
}): CardActionKind {
  const { purpose, productType, ordersEnabled, bookingsEnabled } = args;
  if (purpose === 'services') return bookingsEnabled ? 'book' : 'none';
  if (purpose === 'menu') return ordersEnabled && productType === 'product' ? 'add' : 'none';
  return 'none';
}
