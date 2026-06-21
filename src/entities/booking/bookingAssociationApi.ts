import { publicFetch } from '@shared/lib/api';

export interface BookingSummaryForAssociation {
  bookingId: string;
  status: string;
  visitorName: string;
  preferredDate: string;
  preferredTime: string;
  alreadyProcessed: boolean;
  services: Array<{ productName: string; durationMinutes: number; quantity: number }>;
}

export async function getBookingByToken(
  slug: string,
  token: string,
): Promise<BookingSummaryForAssociation> {
  return publicFetch<BookingSummaryForAssociation>(
    `/companies/${slug}/bookings/confirm-association?token=${encodeURIComponent(token)}`,
  );
}

export async function confirmBookingAssociation(
  slug: string,
  token: string,
): Promise<{ alreadyProcessed: boolean }> {
  return publicFetch<{ alreadyProcessed: boolean }>(
    `/companies/${slug}/bookings/confirm-association`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    },
  );
}

export async function rejectBookingAssociation(
  slug: string,
  token: string,
  reason: string,
): Promise<{ rejected: boolean }> {
  return publicFetch<{ rejected: boolean }>(
    `/companies/${slug}/bookings/reject-association`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, reason }),
    },
  );
}
