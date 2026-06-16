import { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useBranding } from '@app/BrandingContext';
import { PushPermissionModal } from '@features/push-notifications/PushPermissionModal';
import { saveBookingRef } from '@shared/lib/bookings-storage';
import { fetchCatalog, type PublicCategory, type PublicProduct } from '@entities/catalog/api';
import { getCompanyAvailability } from '@entities/booking/api';
import type { BookingPublicResponse } from '@entities/booking/types';
import type { CatalogTheme } from '@shared/styles/pwa-themes';

export interface BookSkinProps {
  slug: string;
  categories: PublicCategory[];
  products: PublicProduct[];
  showPrices: boolean;
  bookingNoun: string;
  preselectedItemId?: string;
  onBack: () => void;
  onConfirmed: (booking: BookingPublicResponse) => void;
}

const SKINS: Record<CatalogTheme, React.LazyExoticComponent<React.FC<BookSkinProps>>> = {
  'luxury-minimalism': lazy(() => import('./skins/luxury-minimalism')),
  'neo-luxury':        lazy(() => import('./skins/neo-luxury')),
  'modern-minimalism': lazy(() => import('./skins/modern-minimalism')),
};

export default function BookPage() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { theme }       = useTheme();
  const { slug, branding } = useBranding();
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [categories, setCategories]         = useState<PublicCategory[]>([]);
  const [products, setProducts]             = useState<PublicProduct[]>([]);
  const [bookingNoun, setBookingNoun]       = useState('cita');
  const [ready, setReady]                   = useState(false);

  const preselectedItemId = searchParams.get('itemId') ?? undefined;

  useEffect(() => {
    Promise.all([
      fetchCatalog(slug),
      getCompanyAvailability(slug),
    ]).then(([catalog, availability]) => {
      setCategories(catalog.categories);
      setProducts(catalog.products);
      if (availability?.bookingNoun) {
        setBookingNoun(availability.bookingNoun);
      }
      setReady(true);
    }).catch(() => {
      setReady(true);
    });
  }, [slug]);

  const Skin = SKINS[theme] ?? SKINS['modern-minimalism'];

  function handleConfirmed(booking: BookingPublicResponse) {
    saveBookingRef(slug, { id: booking.id, createdAt: new Date().toISOString() });
    setShowPushPrompt(true);
  }

  if (showPushPrompt) {
    return (
      <PushPermissionModal
        isOpen
        slug={slug}
        onClose={() => navigate('/appointments', { replace: true })}
      />
    );
  }

  if (!ready) {
    return <div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />;
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <Skin
        slug={slug}
        categories={categories}
        products={products}
        showPrices={branding.showPrices}
        bookingNoun={bookingNoun}
        preselectedItemId={preselectedItemId}
        onBack={() => navigate(-1)}
        onConfirmed={handleConfirmed}
      />
    </Suspense>
  );
}
