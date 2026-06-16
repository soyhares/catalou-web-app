import { BookingWizard } from '@features/booking/BookingWizard';
import type { BookSkinProps } from '../index';

export default function ModernBookSkin({ slug, categories, products, showPrices, bookingNoun, preselectedItemId, onBack, onConfirmed }: BookSkinProps) {
  return (
    <BookingWizard
      slug={slug}
      categories={categories}
      products={products}
      showPrices={showPrices}
      bookingNoun={bookingNoun}
      preselectedItemId={preselectedItemId}
      onBack={onBack}
      onConfirmed={onConfirmed}
    />
  );
}
