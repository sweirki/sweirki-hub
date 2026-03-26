// app/lib/statsManager.ts
// Legacy stats system — disabled
// Cloud analytics now handled in src/analytics/playerAnalytics.ts

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  fastestTime: number;
  totalErrors: number;
  totalHints: number;
  streak: number;
  bestStreak: number;
  lastPlay: number;
  modeBreakdown: Record<string, number>;
  ladderXP?: number;
  seasonLeague?: string;
}

export const updateStatsOnWin = async () => {
  // Disabled — handled by recordGameResult
  return;
};

export const getPlayerStats = async (): Promise<PlayerStats | null> => {
  // Disabled — analytics now in Firestore
  return null;
};
