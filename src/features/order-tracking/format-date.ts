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
  return DATE_TIME.format(date).replace('.', '');
}
