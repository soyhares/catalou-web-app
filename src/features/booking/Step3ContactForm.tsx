import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectedService } from '@entities/booking/types';

interface FormValues {
  visitorName: string;
  visitorContact: string;
  visitorContactType: 'email' | 'phone';
  message: string;
}

interface Props {
  services: SelectedService[];
  date: string;
  time: string;
  showPrices: boolean;
  bookingNoun: string;
  isLoading: boolean;
  onSubmit: (values: FormValues) => void;
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function Step3ContactForm({ services, date, time, showPrices, bookingNoun, isLoading, onSubmit }: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<FormValues>({
    visitorName: '', visitorContact: '', visitorContactType: 'email', message: '',
  });

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes * s.quantity, 0);
  const totalPrice    = services.reduce((sum, s) => sum + (s.basePrice ?? 0) * s.quantity, 0);
  const canSubmit     = values.visitorName.trim().length > 0 && values.visitorContact.trim().length > 0;

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues(prev => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(values); }} style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pwa-text)', margin: '0 0 20px' }}>
        {t('booking.step3Title')}
      </h2>

      {/* Summary card */}
      <div style={{ borderRadius: '12px', border: '1.5px solid var(--pwa-border)', padding: '14px 16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pwa-muted)' }}>
          {t('booking.summaryTitle', { noun: bookingNoun })}
        </p>
        {services.map(s => (
          <div key={s.itemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--pwa-text)' }}>{s.quantity > 1 ? `${s.quantity}× ` : ''}{s.name}</span>
            <span style={{ color: 'var(--pwa-muted)' }}>{s.durationMinutes * s.quantity} min</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--pwa-border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--pwa-muted)' }}>{t('booking.summaryDuration')}</span>
          <span style={{ fontWeight: 600, color: 'var(--pwa-text)' }}>{totalDuration} {t('booking.minutesSuffix')}</span>
        </div>
        {showPrices && totalPrice > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--pwa-muted)' }}>{t('booking.summaryTotal')}</span>
            <span style={{ fontWeight: 700, color: 'var(--pwa-text)' }}>${totalPrice.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--pwa-muted)' }}>{t('booking.summaryDateTime')}</span>
          <span style={{ fontWeight: 600, color: 'var(--pwa-text)', textTransform: 'capitalize' }}>{formatDate(date)}, {time}</span>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pwa-text)' }}>{t('booking.fieldName')}</span>
          <input type="text" required value={values.visitorName} onChange={e => set('visitorName', e.target.value)}
            style={{ padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--pwa-border)', background: 'var(--pwa-bg)', color: 'var(--pwa-text)', fontSize: '15px' }} />
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pwa-text)' }}>{t('booking.fieldContactType')}</span>
          <div style={{ display: 'flex', gap: '4px', background: 'color-mix(in srgb, var(--pwa-muted) 15%, var(--pwa-bg))', borderRadius: '10px', padding: '3px' }}>
            {(['email', 'phone'] as const).map(type => {
              const active = values.visitorContactType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => { set('visitorContactType', type); set('visitorContact', ''); }}
                  style={{
                    flex: 1, padding: '9px 8px', borderRadius: '8px', border: 'none',
                    background: active ? 'var(--pwa-accent)' : 'transparent',
                    color: active ? 'var(--pwa-accent-text, #fff)' : 'var(--pwa-muted)',
                    fontWeight: active ? 700 : 500, fontSize: '13px', cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {type === 'email' ? t('booking.contactEmail') : t('booking.contactPhone')}
                </button>
              );
            })}
          </div>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pwa-text)' }}>
            {values.visitorContactType === 'email' ? t('booking.contactEmail') : t('booking.contactPhone')}
          </span>
          <input
            type={values.visitorContactType === 'email' ? 'email' : 'tel'}
            required
            value={values.visitorContact}
            onChange={e => set('visitorContact', e.target.value)}
            placeholder={values.visitorContactType === 'email' ? 'nombre@ejemplo.com' : '+506 8888 0000'}
            style={{ padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--pwa-border)', background: 'var(--pwa-bg)', color: 'var(--pwa-text)', fontSize: '15px' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pwa-text)' }}>{t('booking.fieldMessage')}</span>
          <textarea value={values.message} onChange={e => set('message', e.target.value)} rows={3}
            style={{ padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--pwa-border)', background: 'var(--pwa-bg)', color: 'var(--pwa-text)', fontSize: '15px', resize: 'none' }} />
        </label>
      </div>

      <button type="submit" disabled={!canSubmit || isLoading}
        style={{ marginTop: '24px', width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: canSubmit && !isLoading ? 'var(--pwa-accent)' : 'var(--pwa-border)', color: canSubmit && !isLoading ? 'var(--pwa-accent-text, #fff)' : 'var(--pwa-muted)', fontWeight: 700, fontSize: '15px', cursor: canSubmit && !isLoading ? 'pointer' : 'default' }}>
        {isLoading ? t('common.loading') : t('booking.confirmCta', { noun: bookingNoun })}
      </button>
    </form>
  );
}
