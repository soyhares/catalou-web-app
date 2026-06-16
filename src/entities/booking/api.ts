import { publicFetch } from '@shared/lib/api';

import type { AvailableSlotsResponse, BookingPublicResponse, CreateBookingPayload } from './types';

export async function getAvailableSlots(
  slug: string,
  date: string,
  totalDuration: number,
): Promise<AvailableSlotsResponse> {
  const qs = new URLSearchParams({ date, totalDuration: String(totalDuration) });
  return publicFetch(`/companies/${slug}/availability/slots?${qs.toString()}`);
}

export async function createBooking(
  slug: string,
  payload: CreateBookingPayload,
): Promise<BookingPublicResponse> {
  return publicFetch(`/companies/${slug}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
