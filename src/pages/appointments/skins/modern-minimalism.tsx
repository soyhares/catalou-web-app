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
  confirmed:   '#22C55E',
  rescheduled: '#3B82F6',
  rejected:    '#EF4444',
  completed:   '#D1D5DB',
};

function formatDate(dateStr: string) {
  const bare = dateStr.split('T')[0];
  const [y, m, d] = bare.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function RowCard({ item, slug, onCancel }: { item: AppointmentItem; slug: string; onCancel: () => void }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const canCancel = item.status === 'pending' || item.status === 'confirmed';
  const dot = STATUS_DOT[item.status];

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
    <article
      style={{
        borderBottom: '1px solid var(--pwa-border)',
        padding: '14px 0',
      }}
    >
      {/* Main row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '16px 1fr auto',
          gap: '12px',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Status dot */}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: dot, flexShrink: 0,
        }} />

        {/* Date + status label */}
        <div>
          <p style={{
            fontFamily: 'var(--pwa-font-body)', fontSize: '14px',
            fontWeight: 500, color: 'var(--pwa-text)',
            margin: '0 0 2px', textTransform: 'capitalize',
          }}>
            {formatDate(item.preferredDate)} · {item.preferredTime}
          </p>
          <p style={{
            fontFamily: 'var(--pwa-font-body)', fontSize: '12px',
            color: 'var(--pwa-text-secondary)', margin: 0,
          }}>
            {STATUS_LABEL[item.status]}
          </p>
        </div>

        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{
            color: 'var(--pwa-text-secondary)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
          aria-hidden="true"
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.15 }}
          style={{ overflow: 'hidden', paddingLeft: '28px', marginTop: '12px' }}
        >
          <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', color: 'var(--pwa-text-secondary)', margin: '0 0 6px' }}>
            Solicitada el {new Date(item.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {item.status === 'rescheduled' && item.proposedDate && (
            <div style={{ marginBottom: '8px', padding: '10px 12px', backgroundColor: 'var(--pwa-surface-secondary)', borderRadius: '6px', borderLeft: '3px solid #3B82F6' }}>
              <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '11px', fontWeight: 600, color: '#3B82F6', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Nueva propuesta
              </p>
              <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', color: 'var(--pwa-text)', margin: 0, textTransform: 'capitalize' }}>
                {formatDate(item.proposedDate)} · {item.proposedTime ?? ''}
              </p>
            </div>
          )}

          {item.status === 'rejected' && item.rejectionReason && (
            <div style={{ marginBottom: '8px', padding: '10px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px', borderLeft: '3px solid #EF4444' }}>
              <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', color: '#DC2626', margin: 0 }}>
                {item.rejectionReason}
              </p>
            </div>
          )}

          {canCancel && (
            <div>
              {cancelError && <p style={{ fontSize: '11px', color: '#EF4444', fontFamily: 'var(--pwa-font-body)', marginBottom: '6px' }}>{cancelError}</p>}
              <button
                type="button"
                disabled={isCancelling}
                onClick={(e) => { e.stopPropagation(); void handleCancel(); }}
                style={{
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: '6px', padding: '5px 12px',
                  fontFamily: 'var(--pwa-font-body)', fontSize: '12px', fontWeight: 500,
                  color: '#DC2626', cursor: isCancelling ? 'not-allowed' : 'pointer',
                  opacity: isCancelling ? 0.5 : 1, transition: 'opacity 150ms ease',
                }}
              >
                {isCancelling ? 'Cancelando…' : 'Cancelar cita'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </article>
  );
}

function SkeletonRow() {
  return (
    <div style={{ borderBottom: '1px solid var(--pwa-border)', padding: '14px 0', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--pwa-border)', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '55%', height: '14px', borderRadius: '3px', backgroundColor: 'var(--pwa-border)', marginBottom: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '30%', height: '12px', borderRadius: '3px', backgroundColor: 'var(--pwa-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export default function ModernAppointmentsSkin({ slug, bookings, isLoading, onCancel, onNewBooking }: AppointmentsSkinProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--pwa-border)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'var(--pwa-bg)',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--pwa-font-heading)',
            fontSize: '18px', fontWeight: 700,
            color: 'var(--pwa-text)', margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Mis Citas
          </h1>
          {!isLoading && bookings.length > 0 && (
            <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '12px', color: 'var(--pwa-text-secondary)', margin: '2px 0 0' }}>
              {bookings.length} {bookings.length === 1 ? 'cita' : 'citas'}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onNewBooking}
          style={{
            backgroundColor: 'var(--pwa-accent)',
            color: 'var(--pwa-on-accent)',
            border: 'none',
            borderRadius: 'var(--pwa-radius-button)',
            padding: '8px 16px',
            fontFamily: 'var(--pwa-font-body)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Nueva cita
        </button>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '0 24px 120px', maxWidth: '640px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        {isLoading ? (
          <div>
            <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: 'center', padding: '64px 0' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '10px',
              border: '1.5px solid var(--pwa-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: 'var(--pwa-text-secondary)',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none" />
                <path d="M6 2V6M14 2V6M2 9H18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '15px', fontWeight: 500, color: 'var(--pwa-text)', marginBottom: '6px' }}>
              Sin citas agendadas
            </p>
            <p style={{ fontFamily: 'var(--pwa-font-body)', fontSize: '13px', color: 'var(--pwa-text-secondary)', marginBottom: '24px' }}>
              Agenda tu primera consulta.
            </p>
            <button
              type="button"
              onClick={onNewBooking}
              style={{
                backgroundColor: 'var(--pwa-accent)', color: 'var(--pwa-on-accent)',
                border: 'none', borderRadius: 'var(--pwa-radius-button)',
                padding: '10px 20px', fontFamily: 'var(--pwa-font-body)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Agendar cita
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {bookings.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.15 } },
                }}
              >
                <RowCard item={item} slug={slug} onCancel={onCancel} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  );
}
