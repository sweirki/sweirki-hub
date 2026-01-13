// leaderboard.types.ts
// PHASE 4 — LEADERBOARD TRUST CORE
// This file defines the ONLY shapes the leaderboard UI is allowed to render.

/**
 * Final trusted row shape used by the UI.
 * All leaderboard data MUST be normalized into this.
 */
export interface LeaderboardRow {
  uid: string;
  username: string;

  // Derived AFTER sorting (1-based)
  rank: number;

  // Primary sortable value (XP / Season XP / Daily score)
  score: number;

  // Optional metadata — always guarded
  meta?: {
    time?: number;
    streak?: number;
    wins?: number;
    achievements?: string[];
    country?: string;
  };
}

/**
 * Raw untrusted data shape (Firestore / Async / legacy).
 * NEVER render this directly.
 */
export interface RawLeaderboardRow {
  uid?: unknown;
  username?: unknown;

  score?: unknown;
  xp?: unknown;
  seasonXP?: unknown;

  time?: unknown;
  streak?: unknown;
  wins?: unknown;
  achievements?: unknown;
  country?: unknown;
}
