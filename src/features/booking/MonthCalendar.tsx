import { useState, useEffect } from 'react';
import { getAvailableSlots } from '@entities/booking/api';

interface Props {
  slug: string;
  totalDuration: number;
  selected: string | null;
  onSelect: (date: string) => void;
}

const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function localTodayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function MonthCalendar({ slug, totalDuration, selected, onSelect }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [availMap, setAvailMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const todayStr = localTodayStr();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  useEffect(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const futureDays: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(viewYear, viewMonth, d);
      if (dateStr >= todayStr) futureDays.push(dateStr);
    }

    if (futureDays.length === 0) {
      setAvailMap({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    setAvailMap({});

    void Promise.all(
      futureDays.map(date =>
        getAvailableSlots(slug, date, totalDuration)
          .then(res => ({ date, hasSlots: res.slots.some(s => s.available) }))
          .catch(() => ({ date, hasSlots: false })),
      ),
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, boolean> = {};
      for (const { date, hasSlots } of results) map[date] = hasSlots;
      setAvailMap(map);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [viewYear, viewMonth, slug, totalDuration, todayStr]);

  function prevMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;     // Lu=0..Do=6
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={{ padding: '4px 20px 16px' }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={prevMonth}
          disabled={isCurrentMonth}
          aria-label="Mes anterior"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: '1.5px solid var(--pwa-border)',
            background: 'transparent',
            color: 'var(--pwa-text)',
            fontSize: '20px', lineHeight: 1,
            cursor: isCurrentMonth ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: isCurrentMonth ? 0.25 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          ‹
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--pwa-text)', textTransform: 'capitalize' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          {loading && (
            <span style={{ fontSize: '13px', color: 'var(--pwa-muted)' }}>…</span>
          )}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          aria-label="Mes siguiente"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: '1.5px solid var(--pwa-border)',
            background: 'transparent',
            color: 'var(--pwa-text)',
            fontSize: '20px', lineHeight: 1,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ›
        </button>
      </div>

      {/* Day-of-week labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
        {DAY_LABELS.map(label => (
          <div key={label} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--pwa-muted)', padding: '2px 0', letterSpacing: '0.03em' }}>
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;

          const dateStr = toDateStr(viewYear, viewMonth, day);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const hasSlots = availMap[dateStr] === true;
          const isSelected = dateStr === selected;
          const isDisabled = isPast || (!loading && availMap[dateStr] === false);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => { if (!isDisabled) onSelect(dateStr); }}
              disabled={isDisabled}
              style={{
                aspectRatio: '1',
                borderRadius: '50%',
                border: isToday && !isSelected
                  ? '1.5px solid var(--pwa-accent)'
                  : '1.5px solid transparent',
                background: isSelected ? 'var(--pwa-accent)' : 'transparent',
                color: isSelected
                  ? 'var(--pwa-accent-text, #fff)'
                  : isDisabled
                  ? 'var(--pwa-muted)'
                  : 'var(--pwa-text)',
                fontSize: '14px',
                fontWeight: isSelected || isToday ? 700 : 400,
                cursor: isDisabled ? 'default' : 'pointer',
                opacity: isPast ? 0.2 : !loading && !hasSlots && !isSelected ? 0.35 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.12s, opacity 0.12s',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
