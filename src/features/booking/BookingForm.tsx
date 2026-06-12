import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicFetch } from '@shared/lib/api';
import type { BookingConfirmation, BookingFormData } from './useBooking';

interface AvailabilityConfig {
  enabledDays: number[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  timezone: string;
}

function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (current <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += slotDuration;
  }
  return slots;
}

function isDateOnEnabledDay(dateStr: string, enabledDays: number[]): boolean {
  if (!dateStr) return true;
  const date = new Date(`${dateStr}T12:00:00`);
  return enabledDays.includes(date.getDay());
}

interface BookingFormProps {
  slug: string;
  onSuccess: (booking: BookingConfirmation) => void;
  onCancel: () => void;
}

interface FormErrors {
  visitorName?: string;
  visitorContact?: string;
  preferredDate?: string;
  preferredTime?: string;
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--pwa-text)' }}>
        {label}
        {required && <span style={{ color: 'var(--pwa-accent)' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 4V6.5M6 8.5H6.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function todayISOString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function BookingForm({ slug, onSuccess, onCancel }: BookingFormProps) {
  const [visitorName, setVisitorName] = useState('');
  const [visitorContactType, setVisitorContactType] = useState<'email' | 'phone'>('email');
  const [visitorContact, setVisitorContact] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityConfig | null>(null);

  useEffect(() => {
    void publicFetch<AvailabilityConfig | null>(`/companies/${slug}/availability`)
      .then((config) => setAvailability(config))
      .catch(() => setAvailability(null));
  }, [slug]);

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!visitorName.trim()) {
      errs.visitorName = 'El nombre es requerido';
    }

    if (!visitorContact.trim()) {
      errs.visitorContact = visitorContactType === 'email' ? 'El correo es requerido' : 'El teléfono es requerido';
    } else if (visitorContactType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorContact)) {
      errs.visitorContact = 'Ingresa un correo válido';
    }

    if (!preferredDate) {
      errs.preferredDate = 'La fecha es requerida';
    } else if (availability && !isDateOnEnabledDay(preferredDate, availability.enabledDays)) {
      errs.preferredDate = 'El negocio no atiende ese día de la semana';
    }

    if (!preferredTime) {
      errs.preferredTime = 'La hora es requerida';
    }

    return errs;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ visitorName: true, visitorContact: true, preferredDate: true, preferredTime: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const formData: BookingFormData = {
      visitorName: visitorName.trim(),
      visitorContact: visitorContact.trim(),
      visitorContactType,
      preferredDate,
      preferredTime,
      message: message.trim() || undefined,
    };

    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await publicFetch<BookingConfirmation>(`/companies/${slug}/bookings`, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          message: formData.message ?? null,
        }),
      });
      onSuccess(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = 'pwa-input';
  const inputErrorClass = 'pwa-input pwa-input--error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
        <div className="flex flex-col gap-4">
          {/* Name */}
          <FormField label="Nombre completo" error={touched.visitorName ? errors.visitorName : undefined} required>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              onBlur={() => handleBlur('visitorName')}
              className={touched.visitorName && errors.visitorName ? inputErrorClass : inputClass}
              autoComplete="name"
              placeholder="Tu nombre completo"
            />
          </FormField>

          {/* Contact type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--pwa-text)' }}>
              Tipo de contacto<span style={{ color: 'var(--pwa-accent)' }}> *</span>
            </label>
            <div className="flex gap-4">
              {(['email', 'phone'] as const).map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  style={{ color: 'var(--pwa-text)' }}
                >
                  <input
                    type="radio"
                    name="contactType"
                    value={type}
                    checked={visitorContactType === type}
                    onChange={() => {
                      setVisitorContactType(type);
                      setVisitorContact('');
                    }}
                    className="accent-[var(--pwa-accent)]"
                  />
                  {type === 'email' ? 'Correo electrónico' : 'Teléfono'}
                </label>
              ))}
            </div>
          </div>

          {/* Contact */}
          <FormField
            label={visitorContactType === 'email' ? 'Correo electrónico' : 'Teléfono'}
            error={touched.visitorContact ? errors.visitorContact : undefined}
            required
          >
            <input
              type={visitorContactType === 'email' ? 'email' : 'tel'}
              value={visitorContact}
              onChange={(e) => setVisitorContact(e.target.value)}
              onBlur={() => handleBlur('visitorContact')}
              className={touched.visitorContact && errors.visitorContact ? inputErrorClass : inputClass}
              autoComplete={visitorContactType === 'email' ? 'email' : 'tel'}
              placeholder={visitorContactType === 'email' ? 'correo@ejemplo.com' : '+506 8888 0000'}
            />
          </FormField>

          {/* Date */}
          <FormField label="Fecha preferida" error={touched.preferredDate ? errors.preferredDate : undefined} required>
            <input
              type="date"
              value={preferredDate}
              min={todayISOString()}
              onChange={(e) => setPreferredDate(e.target.value)}
              onBlur={() => handleBlur('preferredDate')}
              className={touched.preferredDate && errors.preferredDate ? inputErrorClass : inputClass}
            />
          </FormField>

          {/* Time */}
          <FormField label="Hora preferida" error={touched.preferredTime ? errors.preferredTime : undefined} required>
            {availability ? (
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                onBlur={() => handleBlur('preferredTime')}
                className={touched.preferredTime && errors.preferredTime ? inputErrorClass : inputClass}
              >
                <option value="">Selecciona una hora</option>
                {generateTimeSlots(availability.startTime, availability.endTime, availability.slotDuration).map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            ) : (
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                onBlur={() => handleBlur('preferredTime')}
                className={touched.preferredTime && errors.preferredTime ? inputErrorClass : inputClass}
              />
            )}
          </FormField>

          {/* Message */}
          <FormField label="Mensaje (opcional)">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={inputClass}
              style={{ resize: 'none' }}
              placeholder="¿Hay algo que quieras que sepamos?"
            />
          </FormField>
        </div>

        {submitError && (
          <p className="mt-4 text-sm" style={{ color: '#EF4444' }}>
            {submitError}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-semibold border transition-opacity hover:opacity-80"
            style={{
              borderColor: 'var(--pwa-border)',
              color: 'var(--pwa-text-secondary)',
              backgroundColor: 'transparent',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--pwa-accent)',
              borderRadius: 'var(--pwa-radius-button)',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar solicitud'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
