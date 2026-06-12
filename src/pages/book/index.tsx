import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useBranding } from '@app/BrandingContext';
import { PushPermissionModal } from '@features/push-notifications/PushPermissionModal';
import { saveBookingRef } from '@shared/lib/bookings-storage';
import type { BookingConfirmation } from '@features/booking/useBooking';
import type { CatalogTheme } from '@shared/styles/pwa-themes';

export interface BookSkinProps {
  slug: string;
  confirmation: BookingConfirmation | null;
  onSuccess: (b: BookingConfirmation) => void;
  onBack: () => void;
  onConfirmationClose: () => void;
}

const SKINS: Record<CatalogTheme, React.LazyExoticComponent<React.FC<BookSkinProps>>> = {
  'luxury-minimalism': lazy(() => import('./skins/luxury-minimalism')),
  'neo-luxury':        lazy(() => import('./skins/neo-luxury')),
  'modern-minimalism': lazy(() => import('./skins/modern-minimalism')),
};

export default function BookPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { slug } = useBranding();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  const Skin = SKINS[theme] ?? SKINS['modern-minimalism'];

  function handleSuccess(booking: BookingConfirmation) {
    saveBookingRef(slug, { id: booking.id, createdAt: new Date().toISOString() });
    setConfirmation(booking);
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

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <Skin
        slug={slug}
        confirmation={confirmation}
        onSuccess={handleSuccess}
        onBack={() => navigate(-1)}
        onConfirmationClose={() => setShowPushPrompt(true)}
      />
    </Suspense>
  );
}
