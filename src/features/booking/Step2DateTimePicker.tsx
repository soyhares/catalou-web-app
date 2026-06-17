import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableSlots } from '@entities/booking/api';
import type { SelectedService } from '@entities/booking/types';
import { NextSlotBanner } from './NextSlotBanner';
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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 640);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export function Step2DateTimePicker({ slug, services, bookingNoun, onSelect }: Props) {
  const { t } = useTranslation();
  const totalDuration = useMemo(
    () => services.reduce((sum, s) => sum + s.durationMinutes * s.quantity, 0),
    [services],
  );
  const isDesktop = useIsDesktop();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [nextSlot, setNextSlot]               = useState<{ date: string; time: string } | null>(null);
  const [selectedDate, setSelectedDate]       = useState<string | null>(null);
  const [selectedTime, setSelectedTime]       = useState<string | null>(null);
  const [daySlots, setDaySlots]               = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading]       = useState(false);

  // Find next available slot in background (for NextSlotBanner)
  useEffect(() => {
    const dates = nextNDays(14);
    let cancelled = false;
    void Promise.all(
      dates.map(date => getAvailableSlots(slug, date, totalDuration).catch(() => null)),
    ).then(results => {
      if (cancelled) return;
      for (let i = 0; i < results.length; i++) {
        const first = results[i]?.slots.find(s => s.available);
        if (first) { setNextSlot({ date: dates[i], time: first.time }); break; }
      }
    });
    return () => { cancelled = true; };
  }, [slug, totalDuration]);

  // Load slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    setDaySlots([]);
    void getAvailableSlots(slug, selectedDate, totalDuration)
      .then(res => { if (!cancelled) { setDaySlots(res.slots); setSlotsLoading(false); } })
      .catch(() => { if (!cancelled) { setDaySlots([]); setSlotsLoading(false); } });
    return () => { cancelled = true; };
  }, [selectedDate, slug, totalDuration]);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  const banner = !bannerDismissed && nextSlot ? (
    <NextSlotBanner
      date={nextSlot.date}
      time={nextSlot.time}
      endTime={addMinutes(nextSlot.time, totalDuration)}
      onAccept={() => onSelect(nextSlot.date, nextSlot.time)}
      onExpand={() => setBannerDismissed(true)}
    />
  ) : null;

  const calendar = (
    <MonthCalendar
      slug={slug}
      totalDuration={totalDuration}
      selected={selectedDate}
      onSelect={handleDateSelect}
    />
  );

  const slotsPanel = (() => {
    if (!selectedDate) {
      if (!isDesktop) return null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', gap: '10px', color: 'var(--pwa-muted)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p style={{ fontSize: '14px', margin: 0 }}>Selecciona una fecha</p>
        </div>
      );
    }

    if (slotsLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', color: 'var(--pwa-muted)', fontSize: '14px' }}>
          {t('common.loading')}
        </div>
      );
    }

    const available = daySlots.filter(s => s.available);
    if (available.length === 0 && daySlots.length > 0) {
      return (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--pwa-muted)', fontSize: '14px' }}>
          Sin horarios disponibles para este día.
        </div>
      );
    }

    return (
      <SlotGrid
        slots={daySlots}
        selected={selectedTime}
        totalDuration={totalDuration}
        onSelect={time => { setSelectedTime(time); onSelect(selectedDate, time); }}
      />
    );
  })();

  // ── Desktop: two-column layout ──────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div>
        <div style={{ padding: '20px 20px 12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pwa-text)', margin: 0 }}>
            {t('booking.step2Title', { noun: bookingNoun })}
          </h2>
        </div>

        {banner}

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', borderTop: '1px solid var(--pwa-border)' }}>
          {/* Calendar column */}
          <div style={{ borderRight: '1px solid var(--pwa-border)', paddingTop: '8px' }}>
            {calendar}
          </div>

          {/* Slots column */}
          <div style={{ paddingTop: '16px' }}>
            {selectedDate && (
              <p style={{ padding: '0 20px 10px', fontSize: '12px', fontWeight: 600, color: 'var(--pwa-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Horarios disponibles
              </p>
            )}
            {slotsPanel}
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: stacked layout ──────────────────────────────────────────────────
  return (
    <div>
      <div style={{ padding: '20px 20px 4px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pwa-text)', margin: 0 }}>
          {t('booking.step2Title', { noun: bookingNoun })}
        </h2>
      </div>

      {banner}
      {calendar}
      {slotsPanel}
    </div>
  );
}
