const SEASON_LENGTH_DAYS = 28;
const SEASON_START = new Date("2025-01-01").getTime();

export function getCurrentSeasonId(): number {
  const diffDays = Math.floor((Date.now() - SEASON_START) / 86400000);
  return Math.floor(diffDays / SEASON_LENGTH_DAYS);
}

export function getSeasonStartDate(seasonId: number): Date {
  return new Date(SEASON_START + seasonId * SEASON_LENGTH_DAYS * 86400000);
}
