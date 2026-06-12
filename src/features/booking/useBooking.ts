import { useState } from 'react';
import { publicFetch } from '@shared/lib/api';
import type { components } from '@generated/bookings';

export interface BookingFormData {
  visitorName: string;
  visitorContact: string;
  visitorContactType: 'email' | 'phone';
  preferredDate: string;   // YYYY-MM-DD
  preferredTime: string;   // HH:MM
  message?: string;
}

export type BookingConfirmation = components['schemas']['BookingPublicResponse'];

interface UseBookingReturn {
  submit: (formData: BookingFormData) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  confirmation: BookingConfirmation | null;
  reset: () => void;
}

export function useBooking(slug: string): UseBookingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  async function submit(formData: BookingFormData): Promise<void> {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await publicFetch<BookingConfirmation>(
        `/companies/${slug}/bookings`,
        {
          method: 'POST',
          body: JSON.stringify({
            visitorName: formData.visitorName,
            visitorContact: formData.visitorContact,
            visitorContactType: formData.visitorContactType,
            preferredDate: formData.preferredDate,
            preferredTime: formData.preferredTime,
            message: formData.message ?? null,
          }),
        },
      );
      setConfirmation(result);
      setIsSuccess(true);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  }

  function reset(): void {
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
    setConfirmation(null);
  }

  return { submit, isLoading, isSuccess, isError, error, confirmation, reset };
}
