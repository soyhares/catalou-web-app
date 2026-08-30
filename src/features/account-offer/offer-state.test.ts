import { describe, it, expect, beforeEach } from 'vitest';
import { canOffer, readOffer, recordOffer } from './offer-state';

describe('account offer state (SPEC-022 T038)', () => {
  beforeEach(() => localStorage.clear());

  it('offers a shopper who has never answered', () => {
    expect(canOffer('demo')).toBe(true);
  });

  it('keeps state per slug: answering in one business does not silence another', () => {
    recordOffer('demo', 'declined');
    expect(canOffer('demo')).toBe(false);
    expect(canOffer('otro')).toBe(true);
  });

  it('never offers again after activating or declining', () => {
    recordOffer('demo', 'activated');
    expect(canOffer('demo')).toBe(false);
  });

  it('counts postponements instead of storing a boolean, and stops after three', () => {
    recordOffer('demo', 'postponed');
    recordOffer('demo', 'postponed');
    expect(readOffer('demo')?.count).toBe(2);
    recordOffer('demo', 'postponed');
    expect(canOffer('demo')).toBe(false);
  });

  it('offers again once the postponement is old enough', () => {
    const old = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(
      'catalou_account_offer_demo',
      JSON.stringify({ state: 'postponed', count: 1, at: old }),
    );
    expect(canOffer('demo')).toBe(true);
  });

  it('treats unreadable storage as "never answered" rather than crashing', () => {
    localStorage.setItem('catalou_account_offer_demo', 'not json');
    expect(readOffer('demo')).toBeNull();
    expect(canOffer('demo')).toBe(true);
  });
});
