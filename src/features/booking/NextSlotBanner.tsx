import { useTranslation } from 'react-i18next';

interface Props {
  date: string;
  time: string;
  endTime: string;
  onAccept: () => void;
  onExpand: () => void;
}

export function NextSlotBanner({ date, time, endTime, onAccept, onExpand }: Props) {
  const { t } = useTranslation();
  const label = new Date(`${date}T12:00:00`).toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div style={{
      margin: '16px 20px 0',
      borderRadius: '14px',
      border: '1.5px solid var(--pwa-accent)',
      background: 'color-mix(in srgb, var(--pwa-accent) 6%, var(--pwa-bg))',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 16px 0', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pwa-accent)' }}>
        {t('booking.nextSlotLabel')}
      </div>
      <div style={{ padding: '6px 16px 12px' }}>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--pwa-text)', textTransform: 'capitalize' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--pwa-muted)' }}>{time} – {endTime}</p>
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid color-mix(in srgb, var(--pwa-accent) 20%, transparent)' }}>
        <button type="button" onClick={onAccept} style={{ flex: 1, padding: '12px', border: 'none', background: 'var(--pwa-accent)', color: 'var(--pwa-accent-text, #fff)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          {t('booking.nextSlotCta')}
        </button>
        <button type="button" onClick={onExpand} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', color: 'var(--pwa-accent)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
          {t('booking.moreDates')}
        </button>
      </div>
    </div>
  );
}
