import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableSlots } from '@entities/booking/api';
import type { SelectedService } from '@entities/booking/types';
import { NextSlotBanner } from './NextSlotBanner';
import { DayScrubber } from './DayScrubber';
import { SlotGrid } from './SlotGrid';
import { MonthCalendar } from './MonthCalendar';

interface Props {
  slug: string;
  services: SelectedService[];
  bookingNoun: string;
  onSelect: (date: string, time: string) => void;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function nextNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });
}

function dayChipLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.toLocaleDateString('es', { weekday: 'narrow' })} ${d.getDate()} ${d.toLocaleDateString('es', { month: 'short' })}`;
}

export function Step2DateTimePicker({ slug, services, bookingNoun, onSelect }: Props) {
  const { t } = useTranslation();
  const totalDuration  = useMemo(() => services.reduce((sum, s) => sum + s.durationMinutes * s.quantity, 0), [services]);
  const candidateDates = useMemo(() => nextNDays(14), []);

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedDate, setSelectedDate]        = useState<string | null>(null);
  const [selectedTime, setSelectedTime]        = useState<string | null>(null);
  const [showCalendar, setShowCalendar]        = useState(false);
  const [nextSlot, setNextSlot]                = useState<{ date: string; time: string } | null>(null);
  const [daySlots, setDaySlots]                = useState<{ time: string; available: boolean }[]>([]);
  const [dayChips, setDayChips]                = useState<{ date: string; label: string; hasSlots: boolean }[]>([]);
  const [loading, setLoading]                  = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(candidateDates.map(date => getAvailableSlots(slug, date, totalDuration).catch(() => null)))
      .then(results => {
        if (cancelled) return;
        const chips = candidateDates.map((date, i) => ({
          date,
          label: dayChipLabel(date),
          hasSlots: results[i]?.slots.some(s => s.available) ?? false,
        }));
        setDayChips(chips);
        for (let i = 0; i < results.length; i++) {
          const first = results[i]?.slots.find(s => s.available);
          if (first) { setNextSlot({ date: candidateDates[i], time: first.time }); break; }
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, totalDuration]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    getAvailableSlots(slug, selectedDate, totalDuration)
      .then(res => { if (!cancelled) setDaySlots(res.slots); })
      .catch(() => { if (!cancelled) setDaySlots([]); });
    return () => { cancelled = true; };
  }, [selectedDate, slug, totalDuration]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--pwa-muted)', fontSize: '14px' }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '20px 20px 4px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pwa-text)', margin: 0 }}>
          {t('booking.step2Title', { noun: bookingNoun })}
        </h2>
      </div>

      {!bannerDismissed && nextSlot && (
        <NextSlotBanner
          date={nextSlot.date}
          time={nextSlot.time}
          endTime={addMinutes(nextSlot.time, totalDuration)}
          onAccept={() => onSelect(nextSlot.date, nextSlot.time)}
          onExpand={() => setBannerDismissed(true)}
        />
      )}

      {(bannerDismissed || !nextSlot) && (
        <>
          <DayScrubber
            days={dayChips}
            selected={selectedDate}
            onSelect={date => { setSelectedDate(date); setSelectedTime(null); }}
            onMoreDates={() => setShowCalendar(true)}
          />
          {selectedDate && (
            <SlotGrid
              slots={daySlots}
              selected={selectedTime}
              totalDuration={totalDuration}
              onSelect={time => { setSelectedTime(time); onSelect(selectedDate, time); }}
            />
          )}
          {showCalendar && (
            <MonthCalendar
              slug={slug}
              totalDuration={totalDuration}
              selected={selectedDate}
              onSelect={date => { setSelectedDate(date); setSelectedTime(null); setShowCalendar(false); }}
            />
          )}
        </>
      )}
    </div>
  );
}
