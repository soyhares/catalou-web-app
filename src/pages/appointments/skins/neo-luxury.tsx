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

const STATUS_DOT: Record<AppointmentItem['status'], string> = {
  pending:     '#F59E0B',
  confirmed:   '#34D399',
  rescheduled: '#60A5FA',
  rejected:    'rgba(248,113,113,0.7)',
  completed:   'rgba(167,139,250,0.45)',
};

const STATUS_GLOW: Record<AppointmentItem['status'], string> = {
  pending:     'rgba(245,158,11,0.12)',
  confirmed:   'rgba(52,211,153,0.12)',
  rescheduled: 'rgba(96,165,250,0.12)',
  rejected:    'rgba(248,113,113,0.08)',
  completed:   'rgba(167,139,250,0.06)',
};

function formatDate(dateStr: string) {
  const bare = dateStr.split('T')[0];
  const [y, m, d] = bare.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CR', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function GlassCard({ item, slug, onCancel }: { item: AppointmentItem; slug: string; onCancel: () => void }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const canCancel = item.status === 'pending' || item.status === 'confirmed';
  const dot = STATUS_DOT[item.status];
  const glow = STATUS_GLOW[item.status];

  async function handleCancel() {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await publicFetch(`/companies/${slug}/bookings/${item.id}/cancel`, { method: 'PATCH' });
      onCancel();
    } catch {
      setCancelError('No se pudo cancelar.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <article style={{
      background: `rgba(21,11,42,0.7)`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${glow.replace('0.', '0.3').replace('rgba(', 'rgba(').replace(',0.', ',0.')}`,
      borderColor: `color-mix(in srgb, ${dot} 25%, rgba(167,139,250,0.12))`,
      borderRadius: '14px',
      padding: '18px 20px',
      boxShadow: `0 4px 24px ${glow}`,
    }}>
      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          backgroundColor: dot,
          boxShadow: `0 0 8px ${dot}`,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: dot,
          fontWeight: 600,
        }}>
          {STATUS_LABEL[item.status]}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--pwa-font-body)',
          fontSize: '10px',
          color: 'var(--pwa-text-secondary)',
        }}>
          {new Date(item.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Date */}
      <p style={{
        fontFamily: 'var(--pwa-font-heading)',
        fontSize: '1.15rem',
        fontWeight: 600,
        color: 'var(--pwa-text)',
        margin: '0 0 2px',
        textTransform: 'capitalize',
        letterSpacing: '-0.01em',
      }}>
        {formatDate(item.preferredDate)}
      </p>
      <p style={{
        fontFamily: 'var(--pwa-font-body)',
        fontSize: '13px',
        color: 'var(--pwa-text-secondary)',
        margin: 0,
      }}>
        {item.preferredTime}
      </p>

      {/* Proposed */}
      {item.status === 'rescheduled' && item.proposedDate && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(167,139,250,0.12)' }}>
          <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#60A5FA', margin: '0 0 4px' }}>
            Nueva propuesta
          </p>
          <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '14px', color: 'var(--pwa-text)', margin: 0, textTransform: 'capitalize' }}>
            {formatDate(item.proposedDate)} · {item.proposedTime ?? ''}
          </p>
        </div>
      )}

      {/* Rejection */}
      {item.status === 'rejected' && item.rejectionReason && (
        <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', color: 'rgba(248,113,113,0.7)', margin: '10px 0 0', fontStyle: 'italic' }}>
          {item.rejectionReason}
        </p>
      )}

      {/* Cancel */}
      {canCancel && (
        <div style={{ marginTop: '16px' }}>
          {cancelError && <p style={{ fontSize: '11px', color: '#FF6B6B', fontFamily: 'var(--pwa-font-body)', marginBottom: '6px' }}>{cancelError}</p>}
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => { void handleCancel(); }}
            style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontFamily: 'var(--pwa-font-body)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(248,113,113,0.8)',
              cursor: isCancelling ? 'not-allowed' : 'pointer',
              opacity: isCancelling ? 0.5 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
            {isCancelling ? 'Cancelando…' : 'Cancelar'}
          </button>
        </div>
      )}
    </article>
  );
}

function SkeletonGlass() {
  return (
    <div style={{
      background: 'rgba(21,11,42,0.5)',
      border: '1px solid rgba(167,139,250,0.1)',
      borderRadius: '14px',
      padding: '18px 20px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'rgba(167,139,250,0.2)' }} />
        <div style={{ width: '60px', height: '9px', borderRadius: '2px', backgroundColor: 'rgba(167,139,250,0.12)' }} />
      </div>
      <div style={{ width: '55%', height: '18px', borderRadius: '3px', backgroundColor: 'rgba(167,139,250,0.1)', marginBottom: '8px' }} />
      <div style={{ width: '25%', height: '13px', borderRadius: '3px', backgroundColor: 'rgba(167,139,250,0.08)' }} />
    </div>
  );
}

export default function NeoAppointmentsSkin({ slug, bookings, isLoading, onCancel, onNewBooking }: AppointmentsSkinProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--pwa-bg)',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 0 120px',
    }}>
      {/* Background bloom */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '120vw', height: '50vh',
        background: 'radial-gradient(ellipse 65% 45% at 50% -5%, rgba(232,121,249,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, padding: '36px 24px 0', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
        <p style={{
          fontFamily: 'var(--pwa-font-body)', fontSize: '9px', textTransform: 'uppercase',
          letterSpacing: '0.22em', color: 'rgba(232,121,249,0.6)', margin: '0 0 14px',
        }}>
          Mis Citas
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--pwa-font-heading)', fontSize: 'clamp(1.8rem, 6vw, 2.2rem)',
            fontWeight: 600, color: 'var(--pwa-text)', margin: 0, lineHeight: 1.1,
          }}>
            Reservas
          </h1>
          <button
            type="button"
            onClick={onNewBooking}
            aria-label="Nueva cita"
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #E879F9, #A855F7)',
              border: 'none', cursor: 'pointer', color: '#0D0718',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(232,121,249,0.35)',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(167,139,250,0.15)', marginBottom: '28px' }} />
      </header>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto', padding: '0 24px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SkeletonGlass /><SkeletonGlass /><SkeletonGlass />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ textAlign: 'center', padding: '56px 0' }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(232,121,249,0.08)',
              border: '1px solid rgba(232,121,249,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: 'rgba(232,121,249,0.6)' }}>
                <rect x="2" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M6 2V6M16 2V6M2 10H20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{
              fontFamily: 'var(--pwa-font-body)', fontSize: '14px',
              color: 'var(--pwa-text-secondary)', marginBottom: '24px',
            }}>
              No tienes citas agendadas.
            </p>
            <button
              type="button"
              onClick={onNewBooking}
              style={{
                background: 'linear-gradient(135deg, #E879F9, #A855F7)',
                border: 'none', borderRadius: '24px',
                padding: '12px 28px',
                fontFamily: 'var(--pwa-font-body)', fontSize: '12px',
                textTransform: 'uppercase', letterSpacing: '0.14em',
                color: '#0D0718', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(232,121,249,0.3)',
              }}
            >
              Agendar cita
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {bookings.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <GlassCard item={item} slug={slug} onCancel={onCancel} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  );
}
