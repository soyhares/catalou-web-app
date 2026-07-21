import { describe, it, expect } from 'vitest';
import { businessCategoryLabel } from './businessCategoryLabels';

describe('businessCategoryLabel', () => {
  it('maps a known category to its Spanish label', () => {
    expect(businessCategoryLabel('BARBERSHOP')).toBe('Barbería');
    expect(businessCategoryLabel('RESTAURANT')).toBe('Restaurante');
    expect(businessCategoryLabel('PERSONAL_SHOPPER')).toBe('Personal Shopper');
  });

  it('returns null for null or an unrecognized value', () => {
    expect(businessCategoryLabel(null)).toBeNull();
    expect(businessCategoryLabel('NOT_A_REAL_CATEGORY')).toBeNull();
  });
});
