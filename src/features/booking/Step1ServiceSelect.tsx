import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PublicCategory, PublicProduct } from '@entities/catalog/api';
import type { SelectedService } from '@entities/booking/types';
import { ServiceCard } from './ServiceCard';
import { BookingSummaryFooter } from './BookingSummaryFooter';

interface Props {
  categories: PublicCategory[];
  products: PublicProduct[];
  showPrices: boolean;
  bookingNoun: string;
  selected: SelectedService[];
  onSelectionChange: (services: SelectedService[]) => void;
  onContinue: () => void;
}

export function Step1ServiceSelect({ categories, products, showPrices, bookingNoun, selected, onSelectionChange, onContinue }: Props) {
  const { t } = useTranslation();

  const serviceProducts = useMemo(
    () => products.filter(p => p.type === 'service' && p.durationMinutes != null),
    [products],
  );

  const grouped = useMemo(() =>
    categories
      .map(cat => ({ category: cat, items: serviceProducts.filter(p => p.categoryId === cat.id) }))
      .filter(g => g.items.length > 0),
    [categories, serviceProducts],
  );

  const selectedIds = new Set(selected.map(s => s.itemId));

  function handleToggle(productId: string) {
    const product = serviceProducts.find(p => p.id === productId)!;
    if (selectedIds.has(productId)) {
      onSelectionChange(selected.filter(s => s.itemId !== productId));
    } else {
      onSelectionChange([...selected, {
        itemId: product.id,
        name: product.name,
        durationMinutes: product.durationMinutes!,
        basePrice: product.basePrice ? Number(product.basePrice) : null,
        quantity: 1,
      }]);
    }
  }

  return (
    <div style={{ paddingBottom: selected.length > 0 ? '140px' : '24px' }}>
      <div style={{ padding: '20px 20px 4px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pwa-text)', margin: 0 }}>
          {t('booking.step1Title')}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--pwa-muted)', marginTop: '4px' }}>
          {t('booking.step1Subtitle')}
        </p>
      </div>
      {grouped.map(({ category, items }) => (
        <div key={category.id} style={{ padding: '16px 20px 0' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pwa-muted)', marginBottom: '10px' }}>
            {category.name}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map(product => (
              <ServiceCard
                key={product.id}
                id={product.id}
                name={product.name}
                durationMinutes={product.durationMinutes!}
                basePrice={product.basePrice ? Number(product.basePrice) : null}
                showPrices={showPrices}
                selected={selectedIds.has(product.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      ))}
      <BookingSummaryFooter
        services={selected}
        showPrices={showPrices}
        bookingNoun={bookingNoun}
        onContinue={onContinue}
      />
    </div>
  );
}
