const CURRENCY_SYMBOLS: Record<'USD' | 'CRC', string> = {
  USD: '$',
  CRC: '₡',
};

export function formatPrice(amount: number | string, currency: 'USD' | 'CRC' = 'CRC'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${num.toLocaleString('es-CR')}`;
}
