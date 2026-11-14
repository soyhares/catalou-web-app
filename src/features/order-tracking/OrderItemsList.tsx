import type { OrderTracking } from '@entities/order/tracking-api';
import { formatPrice } from '@shared/lib/formatPrice';

/** Productos del pedido. Sin notas por producto (FR-031); el precio solo si la API lo manda. */
export function OrderItemsList({ items, currency }: { items: OrderTracking['items']; currency: 'USD' | 'CRC' }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="order-items-title" className="mb-2.5">
      <h2 id="order-items-title" className="mb-1.5 mt-4 font-[family-name:var(--pwa-font-heading)] text-[0.95rem] font-normal italic text-[var(--pwa-text-secondary)]">
        Tu pedido
      </h2>
      <ul className="m-0 list-none p-0">
        {items.map((item, i) => (
          <li
            key={`${item.productName}-${i}`}
            className="flex items-center gap-3 border-b border-[var(--pwa-border)] py-2.5 font-[family-name:var(--pwa-font-body)] text-[13px] text-[var(--pwa-text)] last:border-b-0"
          >
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" loading="lazy" className="h-10 w-10 flex-none rounded-[var(--pwa-radius-sm)] object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <span className="block">
                {item.quantity} × {item.productName}
              </span>
              {item.variantLabel && (
                <span className="block text-xs text-[var(--pwa-text-secondary)]">{item.variantLabel}</span>
              )}
            </div>
            {item.lineTotal !== null && item.lineTotal !== undefined && (
              <span className="tabular-nums">{formatPrice(item.lineTotal, currency)}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
