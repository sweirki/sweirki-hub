import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ======================================
 * Phase 8A — Player Analytics (Canonical)
 * ======================================
 * Local-only, per-user, versioned.
 */

const ANALYTICS_VERSION = 1;

export type GameMode = "classic" | "daily" | "hyper" | "killer" | "x";

type ModeStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestTimeSec: number | null;
  avgTimeSec: number;
  avgErrors: number;
  avgHintsUsed: number;
};

export type PlayerAnalytics = {
  version: number;

  identity: {
    username: string;
    createdAt: number;
    lastActiveAt: number;
  };

  totals: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalTimeSec: number;
  };

  modes: Record<GameMode, ModeStats>;

  streaks: {
    dailyCurrent: number;
    dailyBest: number;
    activityCurrent: number;
    activityBest: number;
  };

  sessions: {
    totalSessions: number;
    lastSessionAt: number;
    avgGamesPerSession: number;
    avgSessionTimeSec: number;
  };
};

const emptyMode = (): ModeStats => ({
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  bestTimeSec: null,
  avgTimeSec: 0,
  avgErrors: 0,
  avgHintsUsed: 0,
});

const createEmptyAnalytics = (username: string): PlayerAnalytics => ({
  version: ANALYTICS_VERSION,

  identity: {
    username,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },

  totals: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalTimeSec: 0,
  },

  modes: {
    classic: emptyMode(),
    daily: emptyMode(),
    hyper: emptyMode(),
    killer: emptyMode(),
    x: emptyMode(),
  },

  streaks: {
    dailyCurrent: 0,
    dailyBest: 0,
    activityCurrent: 0,
    activityBest: 0,
  },

  sessions: {
    totalSessions: 0,
    lastSessionAt: 0,
    avgGamesPerSession: 0,
    avgSessionTimeSec: 0,
  },
});

const keyFor = (userId?: string) =>
  `analytics:${userId || "guest"}`;

/**
 * -------- READ --------
 */
export async function getAnalytics(
  username?: string
): Promise<PlayerAnalytics> {
  const key = keyFor(username);

  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      const fresh = createEmptyAnalytics(username || "guest");
      await AsyncStorage.setItem(key, JSON.stringify(fresh));
      return fresh;
    }

    const parsed = JSON.parse(raw);
    if (parsed.version !== ANALYTICS_VERSION) {
      const migrated = createEmptyAnalytics(username || "guest");
      await AsyncStorage.setItem(key, JSON.stringify(migrated));
      return migrated;
    }

    return parsed as PlayerAnalytics;
  } catch {
    const fallback = createEmptyAnalytics(username || "guest");
    await AsyncStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

/**
 * -------- WRITE --------
 */
async function saveAnalytics(
  username: string | undefined,
  analytics: PlayerAnalytics
) {
  analytics.identity.lastActiveAt = Date.now();
  await AsyncStorage.setItem(
    keyFor(username),
    JSON.stringify(analytics)
  );
}

/**
 * -------- PUBLIC API (GAMES) --------
 */
export async function recordGameResult(params: {
  username?: string;
  mode: GameMode;
  win: boolean;
  timeSec: number;
  errors: number;
  hintsUsed: number;
}) {
  const { username, mode, win, timeSec, errors, hintsUsed } = params;

  const analytics = await getAnalytics(username);
  const modeStats = analytics.modes[mode];

  analytics.totals.gamesPlayed += 1;
  analytics.totals.totalTimeSec += timeSec;
  win ? analytics.totals.wins++ : analytics.totals.losses++;

  modeStats.gamesPlayed += 1;
  win ? modeStats.wins++ : modeStats.losses++;

  if (win) {
    if (
      modeStats.bestTimeSec === null ||
      timeSec < modeStats.bestTimeSec
    ) {
      modeStats.bestTimeSec = timeSec;
    }
  }

  const n = modeStats.gamesPlayed;

  modeStats.avgTimeSec =
    (modeStats.avgTimeSec * (n - 1) + timeSec) / n;
  modeStats.avgErrors =
    (modeStats.avgErrors * (n - 1) + errors) / n;
  modeStats.avgHintsUsed =
    (modeStats.avgHintsUsed * (n - 1) + hintsUsed) / n;

  await saveAnalytics(username, analytics);
}
/**
 * ============================
 * Phase 8C — Progress Selectors
 * ============================
 * Read-only helpers for UI
 */

export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function getProgressSummary(analytics: PlayerAnalytics) {
  return {
    totalGames: analytics.totals.gamesPlayed,
    totalWins: analytics.totals.wins,
    totalLosses: analytics.totals.losses,
    winRate: calculateWinRate(
      analytics.totals.wins,
      analytics.totals.losses
    ),
    totalTime: formatTime(analytics.totals.totalTimeSec),
    currentStreak: analytics.streaks.activityCurrent,
    bestStreak: analytics.streaks.activityBest,
    totalSessions: analytics.sessions.totalSessions,
    avgSessionTime: formatTime(
      Math.round(analytics.sessions.avgSessionTimeSec)
    ),
  };
}

export function getModeProgress(
  analytics: PlayerAnalytics,
  mode: GameMode
) {
  const m = analytics.modes[mode];

  return {
    gamesPlayed: m.gamesPlayed,
    wins: m.wins,
    losses: m.losses,
    winRate: calculateWinRate(m.wins, m.losses),
    bestTime: m.bestTimeSec
      ? formatTime(m.bestTimeSec)
      : "—",
    avgTime: formatTime(Math.round(m.avgTimeSec)),
    avgErrors: Math.round(m.avgErrors),
    avgHintsUsed: Math.round(m.avgHintsUsed),
  };
}
