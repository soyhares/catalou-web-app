import { useState, useEffect, useRef, useMemo } from 'react';
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
  const slotsRef  = useRef<HTMLDivElement>(null);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [nextSlot, setNextSlot]           = useState<{ date: string; time: string } | null>(null);
  const [showCalendar, setShowCalendar]   = useState(false);
  const [selectedDate, setSelectedDate]   = useState<string | null>(null);
  const [selectedTime, setSelectedTime]   = useState<string | null>(null);
  const [daySlots, setDaySlots]           = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading]   = useState(false);

  // Find the next available slot
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
      setBannerLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug, totalDuration]);

  // Load time slots for the selected date
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

  // Scroll slots into view on mobile after a date is selected
  useEffect(() => {
    if (!selectedDate || isDesktop) return;
    const id = setTimeout(() => {
      slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => clearTimeout(id);
  }, [selectedDate, isDesktop]);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleShowCalendar() {
    setShowCalendar(true);
    // Pre-select the suggested date so slots load immediately
    if (nextSlot && !selectedDate) {
      handleDateSelect(nextSlot.date);
    }
  }

  // ── Banner ──────────────────────────────────────────────────────────────────

  const bannerSection = (() => {
    if (bannerLoading) {
      return (
        <div style={{ margin: '16px 20px 0', borderRadius: '14px', border: '1.5px solid var(--pwa-border)', padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="var(--pwa-border)" strokeWidth="3"/>
            <path d="M22 12a10 10 0 0 0-10-10" stroke="var(--pwa-accent)" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
            </path>
          </svg>
          <span style={{ fontSize: '14px', color: 'var(--pwa-muted)' }}>Buscando disponibilidad…</span>
        </div>
      );
    }

    if (!showCalendar && nextSlot) {
      return (
        <NextSlotBanner
          date={nextSlot.date}
          time={nextSlot.time}
          endTime={addMinutes(nextSlot.time, totalDuration)}
          onAccept={() => onSelect(nextSlot.date, nextSlot.time)}
          onExpand={handleShowCalendar}
        />
      );
    }

    if (!showCalendar && !nextSlot) {
      // No availability found — go straight to calendar
      return (
        <div style={{ margin: '16px 20px 0' }}>
          <button
            type="button"
            onClick={handleShowCalendar}
            style={{ width: '100%', maxWidth: '480px', display: 'block', padding: '14px', borderRadius: '14px', border: '1.5px dashed var(--pwa-border)', background: 'transparent', color: 'var(--pwa-accent)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Ver fechas disponibles →
          </button>
        </div>
      );
    }

    return null;
  })();

  // ── Slots panel ─────────────────────────────────────────────────────────────

  const slotsPanel = (() => {
    if (!selectedDate) {
      return isDesktop ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', gap: '10px', color: 'var(--pwa-muted)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p style={{ fontSize: '14px', margin: 0 }}>Selecciona una fecha</p>
        </div>
      ) : null;
    }

    if (slotsLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', color: 'var(--pwa-muted)', fontSize: '14px' }}>
          {t('common.loading')}
        </div>
      );
    }

    if (daySlots.length > 0 && !daySlots.some(s => s.available)) {
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

  const title = (
    <div style={{ padding: '20px 20px 4px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pwa-text)', margin: 0 }}>
        {t('booking.step2Title', { noun: bookingNoun })}
      </h2>
    </div>
  );

  // ── Desktop two-column (calendar open) ──────────────────────────────────────

  if (isDesktop && showCalendar) {
    return (
      <div>
        {title}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', borderTop: '1px solid var(--pwa-border)', marginTop: '16px' }}>
          <div style={{ borderRight: '1px solid var(--pwa-border)', paddingTop: '8px' }}>
            <MonthCalendar
              slug={slug}
              totalDuration={totalDuration}
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>
          <div style={{ paddingTop: '16px' }}>
            {selectedDate && !slotsLoading && daySlots.some(s => s.available) && (
              <p style={{ padding: '0 20px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--pwa-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Horarios disponibles
              </p>
            )}
            {slotsPanel}
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile / stacked ────────────────────────────────────────────────────────

  return (
    <div>
      {title}
      {bannerSection}
      {showCalendar && (
        <MonthCalendar
          slug={slug}
          totalDuration={totalDuration}
          selected={selectedDate}
          onSelect={handleDateSelect}
        />
      )}
      <div ref={slotsRef}>
        {slotsPanel}
      </div>
    </div>
  );
}
