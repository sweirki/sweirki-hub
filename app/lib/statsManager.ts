// @ts-expect-error
// /lib/statsManager.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

/* ============================
   DATA STRUCTURE
============================ */

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

  // Ladder (READ ONLY here)
  ladderXP?: number;        // lifetime XP
  seasonLeague?: string;   // Bronze / Silver / Gold / ...
}

/* ============================
   LOCAL STORAGE
============================ */

export const getLocalStats = async (): Promise<PlayerStats | null> => {
  const raw = await AsyncStorage.getItem("playerStats");
  return raw ? JSON.parse(raw) : null;
};

export const saveLocalStats = async (stats: PlayerStats) => {
  await AsyncStorage.setItem("playerStats", JSON.stringify(stats));
};

/* ============================
   UPDATE STATS AFTER WIN
============================ */

export const updateStatsOnWin = async (
  mode: string,
  time: number,
  errors: number,
  hints: number,
  username: string
) => {
  try {
    const current =
      (await getLocalStats()) || {
        totalGames: 0,
        totalWins: 0,
        fastestTime: 999999,
        totalErrors: 0,
        totalHints: 0,
        streak: 0,
        bestStreak: 0,
        lastPlay: 0,
        modeBreakdown: {},
      };

    const now = Date.now();

    current.totalGames += 1;
    current.totalWins += 1;
    current.totalErrors += errors;
    current.totalHints += hints;
    current.lastPlay = now;
    current.modeBreakdown[mode] =
      (current.modeBreakdown[mode] || 0) + 1;

    if (time < current.fastestTime) current.fastestTime = time;

    await saveLocalStats(current);

    const userRef = doc(db, "players", username);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      await updateDoc(userRef, {
        totalGames: increment(1),
        totalWins: increment(1),
        totalErrors: increment(errors),
        totalHints: increment(hints),
        fastestTime:
          time < snap.data().fastestTime
            ? time
            : snap.data().fastestTime,
        [`modeBreakdown.${mode}`]: increment(1),
        lastPlay: now,
      });
    } else {
      await setDoc(userRef, {
        username,
        ...current,
      });
    }
  } catch (err) {
    console.warn("⚠️ Stats update failed:", err);
  }
};

/* ============================
   READ PLAYER STATS
============================ */

export const getPlayerStats = async (
  username: string
): Promise<PlayerStats | null> => {
  try {
    const userRef = doc(db, "players", username);
    const snap = await getDoc(userRef);

    let stats: PlayerStats;

    if (snap.exists()) {
      stats = snap.data() as PlayerStats;
    } else {
      stats =
        (await getLocalStats()) || {
          totalGames: 0,
          totalWins: 0,
          fastestTime: 999999,
          totalErrors: 0,
          totalHints: 0,
          streak: 0,
          bestStreak: 0,
          lastPlay: 0,
          modeBreakdown: {},
        };
    }

    // 🔹 Load ladder lifetime XP (display only)
    try {
      const uid = (await AsyncStorage.getItem("ladderUid")) || null;
      if (uid) {
        const ladderRef = doc(db, "ladderUsers", uid);
        const ladderSnap = await getDoc(ladderRef);
        if (ladderSnap.exists()) {
          stats.ladderXP = ladderSnap.data()?.xp ?? 0;
          stats.seasonLeague =
            ladderSnap.data()?.seasonLeague ?? "Bronze";
        }
      }
    } catch {}

    return stats;
  } catch (err) {
    console.warn("⚠️ Failed to fetch player stats:", err);
    return await getLocalStats();
  }
};
