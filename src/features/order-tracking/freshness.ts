/** Cada cuánto se recalcula "Actualizado hace X min" en pantalla. */
export const FRESHNESS_TICK_MS = 30_000;

/**
 * Antigüedad de la última respuesta buena, en palabras: "Actualizado recién" el primer minuto,
 * después minutos y, pasada la hora, horas. Vacío si todavía no hubo ninguna.
 */
export function freshnessLabel(lastUpdatedAt: number | null, now: number): string {
  if (lastUpdatedAt === null) return '';
  const minutes = Math.floor(Math.max(0, now - lastUpdatedAt) / 60_000);
  if (minutes < 1) return 'Actualizado recién';
  if (minutes < 60) return `Actualizado hace ${minutes} min`;
  return `Actualizado hace ${Math.floor(minutes / 60)} h`;
}
