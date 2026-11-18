const DATE_TIME = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

/** "12 nov, 9:42". Una fecha inválida no se muestra. */
export function formatStepDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  // Algunos motores abrevian el mes con punto ("nov."): se quita solo ahí, nunca de "a. m.".
  return DATE_TIME.formatToParts(date)
    .map((part) => (part.type === 'month' ? part.value.replace(/\.$/, '') : part.value))
    .join('');
}

const CLOCK = new Intl.DateTimeFormat('es-CR', { hour: 'numeric', minute: '2-digit' });

/** "9:41 a. m.": la hora local, para "Última actualización". */
export function formatClockTime(timestamp: number): string {
  return CLOCK.format(new Date(timestamp));
}
