// Season configuration — Phase 5
// Boring and correct by design

export const SEASON_LENGTH_DAYS = 30;

/**
 * Returns season identifier in YYYY-MM format
 * Example: "2026-01"
 */
export function getSeasonId(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}
