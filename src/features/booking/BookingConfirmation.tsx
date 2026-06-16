import { useTranslation } from 'react-i18next';
import type { SelectedService } from '@entities/booking/types';

interface Props {
  bookingId: string;
  preferredDate: string;
  preferredTime: string;
  services: SelectedService[];
  bookingNoun: string;
  onClose: () => void;
}

export function BookingConfirmation({ bookingId, preferredDate, preferredTime, services, bookingNoun, onClose }: Props) {
  const { t }         = useTranslation();
  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes * s.quantity, 0);
  const shortId       = bookingId.slice(0, 8).toUpperCase();
  const dateLabel     = new Date(`${preferredDate}T12:00:00`).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pwa-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 40px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--pwa-accent) 12%, var(--pwa-bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M5 14L11 20L23 8" stroke="var(--pwa-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pwa-text)', margin: '0 0 8px', textTransform: 'capitalize' }}>
        {t('booking.pendingTitle', { noun: bookingNoun })}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--pwa-muted)', maxWidth: '300px', lineHeight: 1.6, margin: '0 0 32px' }}>
        {t('booking.pendingBody')}
      </p>
      <div style={{ width: '100%', maxWidth: '360px', borderRadius: '14px', border: '1.5px solid var(--pwa-border)', padding: '16px', textAlign: 'left', marginBottom: '32px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pwa-muted)' }}>
          {t('booking.bookingNumber', { noun: bookingNoun })} #{shortId}
        </p>
        {services.map(s => (
          <div key={s.itemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--pwa-text)' }}>{s.name}</span>
            <span style={{ color: 'var(--pwa-muted)' }}>{s.durationMinutes} min</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--pwa-border)', marginTop: '10px', paddingTop: '10px', fontSize: '13px', color: 'var(--pwa-muted)', textTransform: 'capitalize' }}>
          {dateLabel} · {preferredTime} · {totalDuration} min
        </div>
      </div>
      <button type="button" onClick={onClose}
        style={{ padding: '14px 32px', borderRadius: '12px', border: '1.5px solid var(--pwa-border)', background: 'transparent', color: 'var(--pwa-text)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
        {t('common.close')}
      </button>
    </div>
  );
}
