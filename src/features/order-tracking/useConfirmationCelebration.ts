import { useEffect, useState } from 'react';
import type { OrderTracking } from '@entities/order/tracking-api';

/**
 * "¡Tu pedido fue confirmado!" se celebra una sola vez por pedido y por pestaña: al detectar el
 * paso a CONFIRMED con la página abierta, o al abrirla ya en CONFIRMED si esta persona todavía
 * no lo había visto. Recargar no lo repite.
 *
 * La marca va en sessionStorage con la referencia del pedido (ORD-XXXXXXXX), no con el token:
 * el token da acceso al pedido y no se guarda en ningún almacenamiento. sessionStorage es por
 * origen, y cada negocio tiene el suyo, así que la referencia alcanza.
 */
const KEY_PREFIX = 'catalou_order_confirmed_seen_';

function alreadyCelebrated(reference: string): boolean {
  try {
    return sessionStorage.getItem(KEY_PREFIX + reference) === '1';
  } catch {
    // Sin almacenamiento (modo privado estricto): mejor no celebrar que celebrar en cada recarga.
    return true;
  }
}

function markCelebrated(reference: string): void {
  try {
    sessionStorage.setItem(KEY_PREFIX + reference, '1');
  } catch {
    // ignore
  }
}

/** true mientras el pedido siga en CONFIRMED y esta vista sea la que celebró. */
export function useConfirmationCelebration(data: OrderTracking | null): boolean {
  const [celebrated, setCelebrated] = useState<string | null>(null);
  const reference = data?.reference ?? null;
  const confirmed = data?.status === 'CONFIRMED';

  useEffect(() => {
    if (!confirmed || !reference || celebrated === reference) return;
    if (alreadyCelebrated(reference)) return;
    markCelebrated(reference);
    setCelebrated(reference);
  }, [confirmed, reference, celebrated]);

  return confirmed && reference !== null && celebrated === reference;
}
