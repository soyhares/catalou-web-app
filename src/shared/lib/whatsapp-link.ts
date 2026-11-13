const WA_BASE_URL = 'https://wa.me/';

/**
 * Builds a `wa.me` deep link with a prefilled message. Pure: no I/O, no await, so the caller
 * can build it while rendering and the tap opens WhatsApp synchronously (iOS blocks
 * navigations that follow an await as popups).
 *
 * `phoneE164Digits` is the number in E.164 without the `+` (e.g. `50688001234`). Any
 * non-digit character is dropped, since `wa.me` only accepts digits.
 */
export function buildWaLink(phoneE164Digits: string, text: string): string {
  const digits = phoneE164Digits.replace(/\D/g, '');
  return `${WA_BASE_URL}${digits}?text=${encodeURIComponent(text)}`;
}
