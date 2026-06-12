import { useState } from 'react';
import { motion } from 'framer-motion';
import { publicFetch } from '@shared/lib/api';
import type { AppointmentItem } from '@features/appointments/useAppointments';
import type { AppointmentsSkinProps } from '../index';

const STATUS_LABEL: Record<AppointmentItem['status'], string> = {
  pending:     'Pendiente',
  confirmed:   'Confirmada',
  rescheduled: 'Reagendada',
  rejected:    'Rechazada',
  completed:   'Completada',
};

const STATUS_BORDER: Record<AppointmentItem['status'], string> = {
  pending:     '#C9A96E',
  confirmed:   '#4A7A5A',
  rescheduled: '#5B6B8A',
  rejected:    '#8B7355',
  completed:   '#C8B9A0',
};

function formatDate(dateStr: string) {
  const bare = dateStr.split('T')[0];
  const [y, m, d] = bare.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function TicketCard({ item, slug, onCancel }: { item: AppointmentItem; slug: string; onCancel: () => void }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const canCancel = item.status === 'pending' || item.status === 'confirmed';
  const borderColor = STATUS_BORDER[item.status];

  async function handleCancel() {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await publicFetch(`/companies/${slug}/bookings/${item.id}/cancel`, { method: 'PATCH' });
      onCancel();
    } catch {
      setCancelError('No se pudo cancelar. Intenta de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <article style={{
      display: 'flex',
      borderLeft: `3px solid ${borderColor}`,
      paddingLeft: '20px',
      paddingTop: '4px',
      paddingBottom: '4px',
    }}>
      <div style={{ flex: 1 }}>
        {/* Status + date row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '8px' }}>
          <span style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: borderColor,
            fontWeight: 600,
          }}>
            {STATUS_LABEL[item.status]}
          </span>
          <span style={{
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--pwa-text-secondary)',
            opacity: 0.6,
          }}>
            {new Date(item.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Date/time */}
        <p style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: '1.15rem',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--pwa-text)',
          margin: '0 0 4px',
          textTransform: 'capitalize',
          lineHeight: 1.3,
        }}>
          {formatDate(item.preferredDate)}
        </p>
        <p style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '12px',
          color: 'var(--pwa-text-secondary)',
          margin: 0,
        }}>
          {item.preferredTime}
        </p>

        {/* Proposed (rescheduled) */}
        {item.status === 'rescheduled' && item.proposedDate && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--pwa-border)' }}>
            <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#5B6B8A', margin: '0 0 4px' }}>
              Nueva propuesta
            </p>
            <p style={{ fontFamily: 'var(--pwa-font-heading)', fontSize: '1rem', fontStyle: 'italic', color: 'var(--pwa-text)', margin: 0, textTransform: 'capitalize' }}>
              {formatDate(item.proposedDate)} · {item.proposedTime ?? ''}
            </p>
          </div>
        )}

        {/* Rejection reason */}
        {item.status === 'rejected' && item.rejectionReason && (
          <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', fontStyle: 'italic', color: 'var(--pwa-text-secondary)', margin: '8px 0 0' }}>
            {item.rejectionReason}
          </p>
        )}

        {/* Cancel */}
        {canCancel && (
          <div style={{ marginTop: '14px' }}>
            {cancelError && (
              <p style={{ fontSize: '11px', color: '#8B3A3A', fontFamily: 'var(--pwa-font-body)', marginBottom: '6px' }}>
                {cancelError}
              </p>
            )}
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => { void handleCancel(); }}
              style={{
                background: 'none', border: 'none', cursor: isCancelling ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--pwa-font-body)', fontSize: '8px',
                textTransform: 'uppercase', letterSpacing: '0.16em',
                color: 'var(--pwa-text-secondary)', opacity: isCancelling ? 0.4 : 0.7,
                padding: 0,
                transition: 'opacity 150ms ease',
              }}
            >
              {isCancelling ? 'Cancelando…' : 'Cancelar cita'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function SkeletonTicket() {
  return (
    <div style={{ display: 'flex', borderLeft: '3px solid var(--pwa-border)', paddingLeft: '20px', paddingTop: '4px', paddingBottom: '4px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ width: '60px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--pwa-border)', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '70%', height: '18px', borderRadius: '3px', backgroundColor: 'var(--pwa-border)', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '30%', height: '12px', borderRadius: '3px', backgroundColor: 'var(--pwa-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export default function LuxuryAppointmentsSkin({ slug, bookings, isLoading, onCancel, onNewBooking }: AppointmentsSkinProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', padding: '0 0 120px' }}>

      {/* Top rule */}
      <div style={{ height: '1px', backgroundColor: 'var(--pwa-border)' }} />

      {/* Header */}
      <header style={{ padding: '40px 32px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
        <p style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: 'var(--pwa-accent)',
          margin: '0 0 16px',
        }}>
          Citas · Historial
        </p>
        <h1 style={{
          fontFamily: 'var(--pwa-font-heading)',
          fontSize: 'clamp(2rem, 7vw, 2.6rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          lineHeight: 1.05,
          color: 'var(--pwa-text)',
          margin: '0 0 32px',
        }}>
          Mis citas
        </h1>
        <div style={{ height: '1px', backgroundColor: 'var(--pwa-border)', marginBottom: '36px' }} />
      </header>

      {/* Content */}
      <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', padding: '0 32px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SkeletonTicket /><SkeletonTicket /><SkeletonTicket />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', padding: '48px 0' }}
          >
            <p style={{
              fontFamily: 'var(--pwa-font-heading)',
              fontSize: '1.2rem',
              fontStyle: 'italic',
              fontWeight: 300,
              color: 'var(--pwa-text)',
              opacity: 0.45,
              marginBottom: '28px',
            }}>
              No hay citas registradas.
            </p>
            <button
              type="button"
              onClick={onNewBooking}
              style={{
                backgroundColor: 'var(--pwa-accent)',
                color: 'var(--pwa-on-accent)',
                border: 'none',
                borderRadius: 'var(--pwa-radius-button)',
                padding: '12px 28px',
                fontFamily: 'var(--pwa-font-body)',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Solicitar consulta
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
            >
              {bookings.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                  }}
                >
                  <TicketCard item={item} slug={slug} onCancel={onCancel} />
                </motion.div>
              ))}
            </motion.div>

            {/* Divider + New booking */}
            <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid var(--pwa-border)', textAlign: 'center' }}>
              <button
                type="button"
                onClick={onNewBooking}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--pwa-accent)',
                  border: '1px solid var(--pwa-accent)',
                  borderRadius: 'var(--pwa-radius-button)',
                  padding: '11px 28px',
                  fontFamily: 'var(--pwa-font-body)',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Nueva consulta
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  );
}
