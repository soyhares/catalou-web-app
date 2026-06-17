import { useTranslation } from 'react-i18next';
import type { AvailableSlot } from '@entities/booking/types';

interface Props {
  slots: AvailableSlot[];
  selected: string | null;
  totalDuration: number;
  onSelect: (time: string) => void;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function SlotGrid({ slots, selected, totalDuration, onSelect }: Props) {
  const { t } = useTranslation();
  if (slots.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 20px' }}>
      {slots.map(slot => {
        const isSelected = selected === slot.time;
        return (
          <button key={slot.time} type="button"
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.time)}
            style={{
              padding: '10px 4px', borderRadius: '10px',
              border: isSelected ? '2px solid var(--pwa-accent)' : '1.5px solid var(--pwa-border)',
              background: isSelected ? 'var(--pwa-accent)' : slot.available ? 'var(--pwa-bg)' : 'color-mix(in srgb, var(--pwa-muted) 8%, var(--pwa-bg))',
              color: isSelected ? 'var(--pwa-accent-text, #fff)' : 'var(--pwa-text)',
              cursor: slot.available ? 'pointer' : 'default',
            }}
          >
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, textDecoration: !slot.available ? 'line-through' : 'none', color: !slot.available ? 'var(--pwa-muted)' : 'inherit' }}>
              {slot.time}
            </span>
            {slot.available
              ? <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginTop: '1px' }}>– {addMinutes(slot.time, totalDuration)}</span>
              : <span style={{ display: 'block', fontSize: '10px', color: 'var(--pwa-muted)', marginTop: '1px' }}>{t('booking.slotNoFit')}</span>
            }
          </button>
        );
      })}
    </div>
  );
}
