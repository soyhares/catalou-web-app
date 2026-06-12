import { useState, useEffect, useCallback } from 'react';
import { publicFetch, ApiError } from '@shared/lib/api';
import { getBookingRefs } from '@shared/lib/bookings-storage';

export interface AppointmentItem {
  id: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'rejected' | 'completed';
  preferredDate: string;
  preferredTime: string;
  proposedDate: string | null;
  proposedTime: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface UseAppointmentsReturn {
  bookings: AppointmentItem[];
  isLoading: boolean;
  refetch: () => void;
}

export function useAppointments(slug: string): UseAppointmentsReturn {
  const [bookings, setBookings] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refs = getBookingRefs(slug);

    if (refs.length === 0) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void Promise.all(
      refs.map(async (ref) => {
        try {
          return await publicFetch<AppointmentItem>(
            `/companies/${slug}/bookings/${ref.id}`,
          );
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setBookings(results.filter((r): r is AppointmentItem => r !== null));
      setIsLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, tick]);

  return { bookings, isLoading, refetch };
}
