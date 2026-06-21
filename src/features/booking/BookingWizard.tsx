import { useState } from 'react';
import { createBooking } from '@entities/booking/api';
import type { PublicCategory, PublicProduct } from '@entities/catalog/api';
import type { SelectedService, BookingPublicResponse } from '@entities/booking/types';
import { useBranding } from '@app/BrandingContext';
import { Step1ServiceSelect } from './Step1ServiceSelect';
import { Step2DateTimePicker } from './Step2DateTimePicker';
import { Step3ContactForm } from './Step3ContactForm';
import { BookingConfirmation } from './BookingConfirmation';

type Step = 'services' | 'datetime' | 'contact' | 'confirmed';
const STEP_ORDER: Step[] = ['services', 'datetime', 'contact'];

interface Props {
  slug: string;
  categories: PublicCategory[];
  products: PublicProduct[];
  showPrices: boolean;
  bookingNoun: string;
  preselectedItemId?: string;
  onBack: () => void;
  onConfirmed: (booking: BookingPublicResponse) => void;
}

export function BookingWizard({ slug, categories, products, showPrices, bookingNoun, preselectedItemId, onBack, onConfirmed }: Props) {
  const { branding } = useBranding();
  const [step, setStep]           = useState<Step>('services');
  const [selected, setSelected]   = useState<SelectedService[]>(() => {
    if (!preselectedItemId) return [];
    const p = products.find(pr => pr.id === preselectedItemId);
    if (!p || p.type !== 'service' || !p.durationMinutes) return [];
    return [{ itemId: p.id, name: p.name, durationMinutes: p.durationMinutes, basePrice: p.basePrice ? Number(p.basePrice) : null, quantity: 1 }];
  });
  const [date, setDate]           = useState('');
  const [time, setTime]           = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<BookingPublicResponse | null>(null);

  async function handleSubmit(contact: { visitorName: string; visitorContact: string; visitorContactType: 'email' | 'phone'; message: string; affiliateNumber: string }) {
    setIsLoading(true);
    try {
      const booking = await createBooking(slug, {
        visitorName: contact.visitorName,
        visitorContact: contact.visitorContact,
        visitorContactType: contact.visitorContactType,
        message: contact.message,
        preferredDate: date,
        preferredTime: time,
        services: selected.map(s => ({ itemId: s.itemId, quantity: s.quantity })),
        affiliateNumber: contact.affiliateNumber || undefined,
      });
      setConfirmed(booking);
      setStep('confirmed');
      onConfirmed(booking);
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 'confirmed' && confirmed) {
    return (
      <BookingConfirmation
        bookingId={confirmed.id}
        preferredDate={confirmed.preferredDate}
        preferredTime={confirmed.preferredTime}
        services={selected}
        bookingNoun={bookingNoun}
        onClose={onBack}
      />
    );
  }

  function handleBack() {
    if (step === 'services') { onBack(); return; }
    if (step === 'datetime') { setStep('services'); return; }
    if (step === 'contact')  { setStep('datetime');  return; }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }}>
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '88px' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '4px', padding: '16px 20px 0' }}>
        {STEP_ORDER.map((s, i) => (
          <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: STEP_ORDER.indexOf(step) >= i ? 'var(--pwa-accent)' : 'var(--pwa-border)', transition: 'background 0.2s' }} />
        ))}
      </div>

      {/* Back button */}
      <button type="button" onClick={handleBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', border: 'none', background: 'transparent', color: 'var(--pwa-muted)', fontSize: '14px', cursor: 'pointer' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      {step === 'services' && (
        <Step1ServiceSelect
          categories={categories}
          products={products}
          showPrices={showPrices}
          bookingNoun={bookingNoun}
          selected={selected}
          onSelectionChange={setSelected}
          onContinue={() => setStep('datetime')}
        />
      )}
      {step === 'datetime' && (
        <Step2DateTimePicker
          slug={slug}
          services={selected}
          bookingNoun={bookingNoun}
          onSelect={(d, t) => { setDate(d); setTime(t); setStep('contact'); }}
        />
      )}
      {step === 'contact' && (
        <Step3ContactForm
          slug={slug}
          services={selected}
          date={date}
          time={time}
          showPrices={showPrices}
          bookingNoun={bookingNoun}
          isLoading={isLoading}
          businessModel={branding.businessModel as 'DIRECT' | 'ASSOCIATED' | 'BOTH' | undefined}
          associationName={branding.associationName ?? undefined}
          onSubmit={handleSubmit}
        />
      )}
    </div>
    </div>
  );
}
