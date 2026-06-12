import { useNavigate } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { AppointmentCard } from '@features/appointments/AppointmentCard';
import { useAppointments } from '@features/appointments/useAppointments';

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
  const navigate = useNavigate();
  const { slug } = useBranding();
  const { bookings, isLoading, refetch } = useAppointments(slug);

  function handleCancel() {
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
            onClick={() => navigate('/book')}
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
          onClick={() => navigate('/book')}
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
