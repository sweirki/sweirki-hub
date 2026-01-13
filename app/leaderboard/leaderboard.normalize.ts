// leaderboard.normalize.ts
// PHASE 4 — TRUST NORMALIZATION LAYER
// Converts ANY raw leaderboard data into a safe, trusted structure.

import { LeaderboardRow, RawLeaderboardRow } from "./leaderboard.types";

/**
 * Safe number conversion.
 */
const toNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Safe string conversion.
 */
const toStringSafe = (
  value: unknown,
  fallback: string = "Unknown"
): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

/**
 * Normalize raw leaderboard rows into trusted rows.
 * - Filters invalid entries
 * - Enforces numeric sanity
 * - Assigns rank AFTER sorting
 */
export function normalizeLeaderboard(
  rawRows: RawLeaderboardRow[]
): LeaderboardRow[] {
  // 1️⃣ Sanitize
  const cleaned: LeaderboardRow[] = rawRows
    .map((row): LeaderboardRow | null => {
      const uid = toStringSafe(row.uid, "");
      if (!uid) return null; // ❌ invalid row

      const username = toStringSafe(row.username, "Unknown");

      // Score priority: seasonXP → xp → score
      const score =
        toNumber(row.seasonXP) ||
        toNumber(row.xp) ||
        toNumber(row.score);

      return {
        uid,
        username,
        rank: 0, // assigned later
        score,
        meta: {
          time: toNumber(row.time),
          streak: toNumber(row.streak),
          wins: toNumber(row.wins),
          achievements: Array.isArray(row.achievements)
            ? row.achievements.filter(
                (a): a is string => typeof a === "string"
              )
            : [],
          country:
            typeof row.country === "string"
              ? row.country
              : undefined,
        },
      };
    })
    .filter(Boolean) as LeaderboardRow[];

  // 2️⃣ Sort by score DESC
  cleaned.sort((a, b) => b.score - a.score);

  // 3️⃣ Assign ranks (1-based)
  cleaned.forEach((row, index) => {
    row.rank = index + 1;
  });

  return cleaned;
}
