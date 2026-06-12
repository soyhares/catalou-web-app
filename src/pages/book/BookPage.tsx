import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { BookingForm } from '@features/booking/BookingForm';
import { BookingConfirmation } from '@features/booking/BookingConfirmation';
import { PushPermissionModal } from '@features/push-notifications/PushPermissionModal';
import { saveBookingRef } from '@shared/lib/bookings-storage';
import type { BookingConfirmation as BookingConfirmationType } from '@features/booking/useBooking';

export default function BookPage() {
  const navigate = useNavigate();
  const { slug } = useBranding();
  const [confirmation, setConfirmation] = useState<BookingConfirmationType | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  function handleSuccess(booking: BookingConfirmationType) {
    saveBookingRef(slug, { id: booking.id, createdAt: new Date().toISOString() });
    setConfirmation(booking);
  }

  function handleDone() {
    navigate('/appointments', { replace: true });
  }

  if (showPushPrompt) {
    return <PushPermissionModal isOpen slug={slug} onClose={handleDone} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--pwa-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'var(--pwa-bg)',
        borderBottom: confirmation ? 'none' : '1px solid var(--pwa-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
      }}>
        {!confirmation && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--pwa-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--pwa-text)',
          margin: 0,
          flex: 1,
        }}>
          {confirmation ? 'Solicitud enviada' : 'Agendar cita'}
        </h1>
      </header>

      {/* Content */}
      <main style={{
        flex: 1,
        padding: '24px 20px 100px',
        maxWidth: '480px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {!confirmation ? (
          <>
            {/* Eyebrow */}
            <p style={{
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--pwa-text-secondary)',
              margin: '0 0 20px',
            }}>
              Rellena el formulario y te contactaremos para confirmar
            </p>

            {/* Form card */}
            <div style={{
              backgroundColor: 'var(--pwa-surface)',
              border: '1px solid var(--pwa-border)',
              borderRadius: '16px',
              padding: '24px 20px',
            }}>
              <BookingForm
                slug={slug}
                onSuccess={handleSuccess}
                onCancel={() => navigate(-1)}
              />
            </div>
          </>
        ) : (
          <BookingConfirmation
            booking={confirmation}
            onClose={() => setShowPushPrompt(true)}
          />
        )}
      </main>
    </div>
  );
}
