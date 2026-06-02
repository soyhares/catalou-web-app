const CURRENCY_SYMBOLS: Record<'USD' | 'CRC', string> = {
  USD: '$',
  CRC: '₡',
};

export function formatPrice(amount: number | string, currency: 'USD' | 'CRC' = 'CRC'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isFinite(num)) return `${CURRENCY_SYMBOLS[currency]}0`;
  return `${CURRENCY_SYMBOLS[currency]}${num.toLocaleString('es-CR')}`;
}
