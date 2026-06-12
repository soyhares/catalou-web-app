const KEY = (slug: string) => `catalou_bookings_${slug}`;

export interface StoredBookingRef {
  id: string;
  createdAt: string;
}

export function saveBookingRef(slug: string, ref: StoredBookingRef): void {
  const existing = getBookingRefs(slug);
  const updated = [ref, ...existing.filter((b) => b.id !== ref.id)].slice(0, 20);
  localStorage.setItem(KEY(slug), JSON.stringify(updated));
}

export function getBookingRefs(slug: string): StoredBookingRef[] {
  try {
    const raw = localStorage.getItem(KEY(slug));
    return raw ? (JSON.parse(raw) as StoredBookingRef[]) : [];
  } catch {
    return [];
  }
}
