import { useState } from 'react';
import { publicFetch } from '@shared/lib/api';
import type { AppointmentItem } from './useAppointments';

interface AppointmentCardProps {
  item: AppointmentItem;
  slug: string;
  onCancel: (id: string) => void;
}

const STATUS_LABEL: Record<AppointmentItem['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  rescheduled: 'Reagendada',
  rejected: 'Rechazada',
  completed: 'Completada',
};

const STATUS_COLORS: Record<AppointmentItem['status'], { bg: string; color: string }> = {
  pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#B45309' },
  confirmed: { bg: 'rgba(16, 185, 129, 0.12)', color: '#047857' },
  rescheduled: { bg: 'rgba(59, 130, 246, 0.12)', color: '#1D4ED8' },
  rejected: { bg: 'rgba(107, 114, 128, 0.12)', color: '#6B7280' },
  completed: { bg: 'rgba(107, 114, 128, 0.10)', color: '#9CA3AF' },
};

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function AppointmentCard({ item, slug, onCancel }: AppointmentCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const canCancel = item.status === 'pending' || item.status === 'confirmed';
  const statusStyle = STATUS_COLORS[item.status];

  async function handleCancel() {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await publicFetch(`/companies/${slug}/bookings/${item.id}/cancel`, {
        method: 'PATCH',
      });
      onCancel(item.id);
    } catch {
      setCancelError('No se pudo cancelar. Intenta de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <article
      style={{
        backgroundColor: 'var(--pwa-card)',
        border: '1px solid var(--pwa-border)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      {/* Header row: status badge + date */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span
          style={{
            display: 'inline-block',
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            fontSize: '10px',
            fontFamily: 'var(--pwa-font-body)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            padding: '6px 12px',
            borderRadius: '999px',
          }}
        >
          {STATUS_LABEL[item.status]}
        </span>
        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--pwa-font-body)',
          color: 'var(--pwa-text-secondary)',
          textAlign: 'right',
          maxWidth: '140px',
        }}>
          Solicitada el {new Date(item.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Preferred date/time */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{
          fontSize: '8px',
          fontFamily: 'var(--pwa-font-body)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--pwa-text-secondary)',
          marginBottom: '3px',
        }}>
          Fecha solicitada
        </p>
        <p style={{
          fontSize: '14px',
          fontFamily: 'var(--pwa-font-heading)',
          color: 'var(--pwa-text)',
          lineHeight: 1.3,
        }}>
          {formatDate(item.preferredDate)} · {item.preferredTime}
        </p>
      </div>

      {/* Proposed date/time (rescheduled) */}
      {item.status === 'rescheduled' && item.proposedDate && (
        <div style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--pwa-border)',
        }}>
          <p style={{
            fontSize: '8px',
            fontFamily: 'var(--pwa-font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#1D4ED8',
            marginBottom: '3px',
          }}>
            Nueva propuesta
          </p>
          <p style={{
            fontSize: '14px',
            fontFamily: 'var(--pwa-font-heading)',
            color: 'var(--pwa-text)',
            lineHeight: 1.3,
          }}>
            {formatDate(item.proposedDate)} · {item.proposedTime ?? ''}
          </p>
        </div>
      )}

      {/* Rejection reason */}
      {item.status === 'rejected' && item.rejectionReason && (
        <div style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--pwa-border)',
        }}>
          <p style={{
            fontSize: '12px',
            fontFamily: 'var(--pwa-font-body)',
            color: 'var(--pwa-text-secondary)',
            fontStyle: 'italic',
          }}>
            {item.rejectionReason}
          </p>
        </div>
      )}

      {/* Cancel button */}
      {canCancel && (
        <div style={{ marginTop: '14px' }}>
          {cancelError && (
            <p style={{
              fontSize: '11px',
              color: '#EF4444',
              fontFamily: 'var(--pwa-font-body)',
              marginBottom: '6px',
            }}>
              {cancelError}
            </p>
          )}
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => { void handleCancel(); }}
            style={{
              background: 'none',
              border: '1px solid var(--pwa-border)',
              borderRadius: 'var(--pwa-radius-button)',
              padding: '7px 14px',
              fontSize: '11px',
              fontFamily: 'var(--pwa-font-body)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: 'var(--pwa-text-secondary)',
              cursor: isCancelling ? 'not-allowed' : 'pointer',
              opacity: isCancelling ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isCancelling ? 'Cancelando…' : 'Cancelar cita'}
          </button>
        </div>
      )}
    </article>
  );
}
