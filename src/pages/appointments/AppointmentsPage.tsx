import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBranding } from '@app/BrandingContext';
import { BookingForm } from '@features/booking/BookingForm';
import { BookingConfirmation } from '@features/booking/BookingConfirmation';
import { PushPermissionModal } from '@features/push-notifications/PushPermissionModal';
import { AppointmentCard } from '@features/appointments/AppointmentCard';
import { useAppointments } from '@features/appointments/useAppointments';
import { saveBookingRef } from '@shared/lib/bookings-storage';
import type { BookingConfirmation as BookingConfirmationType } from '@features/booking/useBooking';

function BookingModal({ slug, onClose, onCreated }: { slug: string; onClose: () => void; onCreated: () => void }) {
  const [confirmation, setConfirmation] = useState<BookingConfirmationType | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  function handleSuccess(booking: BookingConfirmationType) {
    saveBookingRef(slug, { id: booking.id, createdAt: new Date().toISOString() });
    setConfirmation(booking);
  }

  if (showPushPrompt) {
    return <PushPermissionModal isOpen slug={slug} onClose={() => { onCreated(); onClose(); }} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="booking-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.55)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="booking-card"
          style={{
            width: '100%',
            maxWidth: '512px',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '16px 16px 0 0',
            overflowY: 'auto',
            backgroundColor: 'var(--pwa-surface)',
            maxHeight: '92dvh',
          }}
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {!confirmation && (
            <div
              style={{
                position: 'sticky',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--pwa-border)',
                backgroundColor: 'var(--pwa-surface)',
              }}
            >
              <h2 style={{
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'var(--pwa-font-heading)',
                color: 'var(--pwa-text)',
                margin: 0,
              }}>
                Agendar consulta
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: 'var(--pwa-text-secondary)',
                  borderRadius: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          <div style={{ padding: '20px' }}>
            {confirmation
              ? <BookingConfirmation booking={confirmation} onClose={() => setShowPushPrompt(true)} />
              : <BookingForm slug={slug} onSuccess={handleSuccess} onCancel={onClose} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: 'var(--pwa-card)',
      border: '1px solid var(--pwa-border)',
      borderRadius: '12px',
      padding: '16px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ width: '80px', height: '22px', borderRadius: '999px', backgroundColor: 'var(--pwa-border)', marginBottom: '12px' }} />
      <div style={{ width: '60%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--pwa-border)', marginBottom: '8px' }} />
      <div style={{ width: '90%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--pwa-border)' }} />
    </div>
  );
}

export default function AppointmentsPage() {
  const { slug } = useBranding();
  const { bookings, isLoading, refetch } = useAppointments(slug);
  const [showBooking, setShowBooking] = useState(false);

  function handleCancel(id: string) {
    refetch();
    // optimistically mark as rejected in local state without full refetch
    void id;
    refetch();
  }

  function handleCreated() {
    refetch();
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--pwa-bg)',
      padding: '32px 20px 100px',
    }}>
      {/* Header */}
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '1.4rem',
          fontStyle: 'italic',
          color: 'var(--pwa-text)',
          margin: '0 0 6px',
          fontWeight: 400,
          lineHeight: 1.2,
        }}>
          Mis Citas
        </h1>
        <p style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--pwa-text-secondary)',
          margin: 0,
        }}>
          Historial y estado de tus solicitudes
        </p>
      </header>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--pwa-border)', margin: '0 0 24px' }} />

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '14px',
            color: 'var(--pwa-text-secondary)',
            marginBottom: '24px',
          }}>
            Aún no tienes citas agendadas.
          </p>
          <button
            type="button"
            onClick={() => setShowBooking(true)}
            style={{
              backgroundColor: 'var(--pwa-accent)',
              color: 'var(--pwa-on-accent)',
              border: 'none',
              borderRadius: 'var(--pwa-radius-button)',
              padding: '12px 24px',
              fontSize: '13px',
              fontFamily: 'var(--pwa-font-body)',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            Agendar mi primera cita
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((item) => (
            <AppointmentCard key={item.id} item={item} slug={slug} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Nueva cita button (always visible when there are bookings) */}
      {!isLoading && bookings.length > 0 && (
        <button
          type="button"
          onClick={() => setShowBooking(true)}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '24px',
            backgroundColor: 'var(--pwa-accent)',
            color: 'var(--pwa-on-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '14px',
            fontSize: '13px',
            fontFamily: 'var(--pwa-font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}
        >
          Nueva cita
        </button>
      )}

      {/* Booking modal */}
      {showBooking && (
        <BookingModal
          slug={slug}
          onClose={() => setShowBooking(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
