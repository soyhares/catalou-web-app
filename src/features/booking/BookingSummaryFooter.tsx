import { useTranslation } from 'react-i18next';
import type { SelectedService } from '@entities/booking/types';

interface Props {
  services: SelectedService[];
  showPrices: boolean;
  bookingNoun: string;
  onContinue: () => void;
}

export function BookingSummaryFooter({ services, showPrices, onContinue }: Props) {
  const { t } = useTranslation();
  if (services.length === 0) return null;

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes * s.quantity, 0);
  const totalPrice    = services.reduce((sum, s) => sum + (s.basePrice ?? 0) * s.quantity, 0);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'var(--pwa-bg)',
      borderTop: '1px solid var(--pwa-border)',
      padding: '12px 20px',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--pwa-muted)' }}>
        <span>
          {t('booking.services', { count: services.length })}
          {' · '}
          {t('booking.footerDuration', { duration: totalDuration })}
        </span>
        {showPrices && totalPrice > 0 && (
          <span style={{ fontWeight: 600, color: 'var(--pwa-text)' }}>
            {t('booking.footerPrice', { price: totalPrice.toFixed(2) })}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onContinue}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: 'var(--pwa-accent)',
          color: 'var(--pwa-accent-text, #fff)',
          fontWeight: 700,
          fontSize: '15px',
          cursor: 'pointer',
        }}
      >
        {t('booking.step1Cta')}
      </button>
    </div>
  );
}
