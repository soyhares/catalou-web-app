import { motion } from 'framer-motion';
import type { BookingConfirmation as BookingConfirmationType } from './useBooking';

interface BookingConfirmationProps {
  booking: BookingConfirmationType;
  onClose: () => void;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function BookingConfirmation({ booking, onClose }: BookingConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center text-center px-2 py-4"
    >
      {/* Success icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: 'color-mix(in srgb, var(--pwa-accent) 12%, transparent)' }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--pwa-accent)' }}>
          <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2
        className="text-xl font-bold mb-2"
        style={{ color: 'var(--pwa-text)', fontFamily: 'var(--pwa-font-heading)' }}
      >
        ¡Solicitud enviada!
      </h2>

      <p className="text-sm mb-6" style={{ color: 'var(--pwa-text-secondary)', lineHeight: 1.6 }}>
        El equipo te contactará para confirmar tu cita.
      </p>

      {/* Date & time detail */}
      <div
        className="w-full rounded-xl border p-4 mb-6 text-left"
        style={{ borderColor: 'var(--pwa-border)', backgroundColor: 'var(--pwa-surface-secondary)' }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--pwa-accent)', flexShrink: 0 }}>
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M5 1.5V4M11 1.5V4M2 6.5H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pwa-text-secondary)' }}>
                Fecha solicitada
              </p>
              <p className="text-sm font-semibold capitalize" style={{ color: 'var(--pwa-text)' }}>
                {formatDate(booking.preferredDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--pwa-accent)', flexShrink: 0 }}>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M8 5V8.5L10.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--pwa-text-secondary)' }}>
                Hora solicitada
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--pwa-text)' }}>
                {formatTime(booking.preferredTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        style={{
          backgroundColor: 'var(--pwa-accent)',
          borderRadius: 'var(--pwa-radius-button)',
        }}
      >
        Cerrar
      </button>
    </motion.div>
  );
}
