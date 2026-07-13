import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { useAppointments, type AppointmentItem } from '@features/appointments/useAppointments';

export interface AppointmentsSkinProps {
  slug: string;
  bookings: AppointmentItem[];
  isLoading: boolean;
  onCancel: () => void;
  onNewBooking: () => void;
}

const AppointmentsSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { slug } = useBranding();
  const { bookings, isLoading, refetch } = useAppointments(slug);

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <AppointmentsSkin
        slug={slug}
        bookings={bookings}
        isLoading={isLoading}
        onCancel={refetch}
        onNewBooking={() => navigate('/book')}
      />
    </Suspense>
  );
}
