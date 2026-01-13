// src/utils/statsUtils.ts

/**
 * Rank helper
 */
export function getRank(points: number): string {
  if (points >= 35000) return "Grandmaster";
  if (points >= 20000) return "Master";
  if (points >= 10000) return "Diamond";
  if (points >= 5000) return "Platinum";
  if (points >= 2500) return "Gold";
  if (points >= 1000) return "Silver";
  if (points > 0) return "Bronze";
  return "Unranked";
}

export function getBadges(stats: {
  games: any[];
  points: number;
  streak: number;
  avgErrors?: number;
}) {
  const badges: string[] = [];
  const { games, points, streak, avgErrors = 0 } = stats;

  if (streak >= 5) badges.push("🔥 Streak Master");
  if (points >= 10000) badges.push("💎 High Roller");
  if (avgErrors < 1 && games.length >= 5) badges.push("✨ Flawless");

  if (games.some((g) => g.difficulty === "Hard")) badges.push("💪 Hard Solver");
  if (games.some((g) => g.errors === 0)) badges.push("Perfect Win");
  if (games.some((g) => (g.time || 9999) < 120)) badges.push("⚡ Speed Demon");

  if (games.length >= 50) badges.push("🏅 Veteran");
  if (games.length >= 100) badges.push("🌟 Legend");

  return Array.from(new Set(badges));
}


/**
 * Streak helper
 * - Calculates the longest streak of consecutive days played
 * - Accepts both Firestore Timestamps and ISO date strings
 */
export function calculateStreak(games: any[]): number {
  if (!games || games.length === 0) return 0;

  const dates = [
    ...new Set(
      games
        .map((g) => {
          if (!g.date) return null;

          if (typeof g.date === "string") {
            return g.date.split("T")[0];
          }

          if (g.date.toDate) {
            return g.date.toDate().toISOString().split("T")[0];
          }

          return null;
        })
        .filter(Boolean)
    ),
  ].sort();

  let streak = 1;
  let best = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);

    if (diff === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return best;
}

