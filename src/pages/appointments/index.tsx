import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useBranding } from '@app/BrandingContext';
import { useAppointments, type AppointmentItem } from '@features/appointments/useAppointments';
import type { CatalogTheme } from '@shared/styles/pwa-themes';

export interface AppointmentsSkinProps {
  slug: string;
  bookings: AppointmentItem[];
  isLoading: boolean;
  onCancel: () => void;
  onNewBooking: () => void;
}

const SKINS: Record<CatalogTheme, React.LazyExoticComponent<React.FC<AppointmentsSkinProps>>> = {
  'luxury-minimalism': lazy(() => import('./skins/luxury-minimalism')),
  'neo-luxury':        lazy(() => import('./skins/neo-luxury')),
  'modern-minimalism': lazy(() => import('./skins/modern-minimalism')),
};

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { slug } = useBranding();
  const { bookings, isLoading, refetch } = useAppointments(slug);

  const Skin = SKINS[theme] ?? SKINS['modern-minimalism'];

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <Skin
        slug={slug}
        bookings={bookings}
        isLoading={isLoading}
        onCancel={refetch}
        onNewBooking={() => navigate('/book')}
      />
    </Suspense>
  );
}
