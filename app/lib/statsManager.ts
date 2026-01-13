// @ts-expect-error expo-router-ignore
// /lib/statsManager.ts

// ðŸ§© STEP 1 â€” Imports
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";



// STEP 2 â€” Data structure
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

  // ⭐ NEW LADDER FIELDS ⭐
  ladderXP?: number;
  ladderRank?: string;
}


// ðŸ§© STEP 3 â€” Local storage helpers
export const getLocalStats = async (): Promise<PlayerStats | null> => {
  const raw = await AsyncStorage.getItem("playerStats");
  return raw ? JSON.parse(raw) : null;
};

export const saveLocalStats = async (stats: PlayerStats) => {
  await AsyncStorage.setItem("playerStats", JSON.stringify(stats));
};

// ðŸ§© STEP 4 â€” Update stats after a win
export const updateStatsOnWin = async (
  mode: string,
  time: number,
  errors: number,
  hints: number,
  username: string
) => {
  try {
    const current = (await getLocalStats()) || {
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
    current.modeBreakdown[mode] = (current.modeBreakdown[mode] || 0) + 1;

    const oneDay = 24 * 60 * 60 * 1000;
    if (now - current.lastPlay < oneDay) {
      current.streak += 1;
    } else {
      current.streak = 1;
    }
    current.bestStreak = Math.max(current.bestStreak, current.streak);

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
        streak: current.streak,
        bestStreak:
          current.bestStreak > snap.data().bestStreak
            ? current.bestStreak
            : snap.data().bestStreak,
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
    console.warn("âš ï¸ Stats update failed:", err);
  }
};

// STEP 5  Read stats (for profile/legend)
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
  stats = (await getLocalStats()) || {
    totalGames: 0,
    totalWins: 0,
    fastestTime: 999999,
    totalErrors: 0,
    totalHints: 0,
    streak: 0,
    bestStreak: 0,
    lastPlay: 0,
    modeBreakdown: {},
    ladderXP: 0,
    ladderRank: "Bronze",
  };
}

// ⭐ NEW — Load Ladder XP from ladderUsers collection
try {
  const user = await AsyncStorage.getItem("username");
  if (user) {
    const xpRef = doc(db, "ladderUsers", user);
    const xpSnap = await getDoc(xpRef);

    if (xpSnap.exists()) {
      const xp = xpSnap.data()?.xp || 0;
      stats.ladderXP = xp;

      // ⭐ Ladder Rank Calculation
      if (xp >= 2000) stats.ladderRank = "Master";
      else if (xp >= 1500) stats.ladderRank = "Diamond";
      else if (xp >= 1000) stats.ladderRank = "Platinum";
      else if (xp >= 600) stats.ladderRank = "Gold";
      else if (xp >= 300) stats.ladderRank = "Silver";
      else stats.ladderRank = "Bronze";
    }
  }
} catch (e) {
  console.log("⚠️ Ladder XP load error:", e);
}

return stats;

    return await getLocalStats();
  } catch (err) {
    console.warn("âš ï¸ Failed to fetch player stats:", err);
    return await getLocalStats();
  }
};

