import type React from 'react';
import { useTranslation } from 'react-i18next';

interface DayChip { date: string; label: string; hasSlots: boolean; }

interface Props {
  days: DayChip[];
  selected: string | null;
  onSelect: (date: string) => void;
  onMoreDates: () => void;
}

export function DayScrubber({ days, selected, onSelect, onMoreDates }: Props) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 20px 4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      {days.map(day => (
        <button key={day.date} type="button"
          onClick={() => day.hasSlots && onSelect(day.date)}
          disabled={!day.hasSlots}
          style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: '20px',
            border: selected === day.date ? '2px solid var(--pwa-accent)' : '1.5px solid var(--pwa-border)',
            background: selected === day.date ? 'var(--pwa-accent)' : 'var(--pwa-bg)',
            color: selected === day.date ? 'var(--pwa-accent-text, #fff)' : day.hasSlots ? 'var(--pwa-text)' : 'var(--pwa-muted)',
            fontSize: '13px', fontWeight: selected === day.date ? 700 : 500,
            cursor: day.hasSlots ? 'pointer' : 'default', opacity: day.hasSlots ? 1 : 0.45,
            textTransform: 'capitalize', whiteSpace: 'nowrap',
          }}>
          {day.label}
        </button>
      ))}
      <button type="button" onClick={onMoreDates}
        style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '20px', border: '1.5px dashed var(--pwa-border)', background: 'transparent', color: 'var(--pwa-accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {t('booking.moreDates')} →
      </button>
    </div>
  );
}
