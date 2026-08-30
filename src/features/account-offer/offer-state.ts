/**
 * SPEC-022 (T038) — memory of what the shopper already answered to the account offer.
 *
 * Stored per slug, and as a state with a count and a date, not a boolean: FR-003 asks not to
 * repeat the offer on every order, which is not the same as never asking again. A shopper who
 * postponed once should be offered again on a later visit; one who activated never should.
 *
 * `catalou_install_dismissed` is a separate key of the install prompt and is not touched here.
 */

export type OfferState = 'postponed' | 'declined' | 'activated';

export interface OfferRecord {
  state: OfferState;
  /** How many times the offer has been shown and dismissed. */
  count: number;
  /** ISO-8601 of the last answer. */
  at: string;
}

const key = (slug: string) => `catalou_account_offer_${slug}`;

/** After this many postponements the offer stops being shown by itself. */
const MAX_POSTPONEMENTS = 3;
/** How long a postponement silences the offer. */
const POSTPONE_MS = 30 * 24 * 60 * 60 * 1000;

export function readOffer(slug: string): OfferRecord | null {
  try {
    const raw = localStorage.getItem(key(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OfferRecord;
    return parsed?.state ? parsed : null;
  } catch {
    return null;
  }
}

export function recordOffer(slug: string, state: OfferState): void {
  const previous = readOffer(slug);
  try {
    localStorage.setItem(
      key(slug),
      JSON.stringify({
        state,
        count: (previous?.count ?? 0) + 1,
        at: new Date().toISOString(),
      } satisfies OfferRecord),
    );
  } catch {
    // ignore
  }
}

/** Whether the offer may be shown again, given what the shopper already answered. */
export function canOffer(slug: string): boolean {
  const record = readOffer(slug);
  if (!record) return true;
  if (record.state === 'activated' || record.state === 'declined') return false;
  if (record.count >= MAX_POSTPONEMENTS) return false;
  return Date.now() - Date.parse(record.at) > POSTPONE_MS;
}
