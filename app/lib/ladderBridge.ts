// @ts-expect-error
// @expo-router-ignore

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

import {
  getPlayerStats,
  type PlayerStats,
  getLocalStats,
  saveLocalStats,
} from "./statsManager";

/* ============================
   SEASON CONFIG (PHASE 5)
============================ */

const SEASON_LENGTH_DAYS = 28;
const SEASON_START = new Date("2025-01-01").getTime();

function getCurrentSeasonId(): number {
  const diffDays = Math.floor((Date.now() - SEASON_START) / 86400000);
  return Math.floor(diffDays / SEASON_LENGTH_DAYS);
}

/* ============================
   LADDER DATA SYNC
============================ */

/**
 * Sync latest ladder stats from Firestore into AsyncStorage
 * so the hub / legend / leaderboard can read them quickly.
 */
export const refreshLadderData = async (username: string) => {
  try {
    const stats = await getPlayerStats(username);
    if (stats) {
      await AsyncStorage.setItem(
        "ladderStats",
        JSON.stringify({ username, stats })
      );
      console.log("✅ Ladder data synced for", username);
    }
  } catch (err) {
    console.warn("⚠️ Ladder sync failed:", err);
  }
};

/* ============================
   XP AWARD (PHASE 5 SAFE)
============================ */

/**
 * Award ladder XP to the current Firebase user.
 * Used by all Sudoku boards after a WIN.
 */
export const awardLadderXP = async (xp: number) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ awardLadderXP: no authenticated user");
      return;
    }

    const uid = user.uid;

    // Use local username instead of Firebase email
    let username = await AsyncStorage.getItem("username");
    if (!username) {
      username = user.displayName || user.email || "Guest";
    }

    const seasonId = getCurrentSeasonId();

    // Read previous lifetime XP
    const ref = doc(db, "ladderUsers", uid);
    const snap = await getDoc(ref);
    const rawXP = snap.exists() ? snap.data()?.xp ?? 0 : 0;
    const previousXP =
      typeof rawXP === "number" ? rawXP : parseInt(rawXP, 10) || 0;

    const newXP = previousXP + xp;

    // Write lifetime XP + season marker
    await setDoc(
      ref,
      {
        uid,
        username,
        xp: newXP, // lifetime XP (unchanged meaning)
        lastUpdated: Date.now(),
        currentSeason: seasonId,
      },
      { merge: true }
    );

    // ✅ Season XP (scoped to current season)
const seasonRef = doc(db, "seasonUsers", `${seasonId}_${uid}`);

await setDoc(
  seasonRef,
  {
    uid,
    username,
    seasonId,
    xp: increment(xp),
    updatedAt: Date.now(),
  },
  { merge: true }
);

   

    // Update global player stats (leaderboard support)
    try {
      const statsRef = doc(db, "players", username);
      await updateDoc(statsRef, {
        totalWins: increment(1),
        totalGames: increment(1),
      });
      console.log("🔥 Player stats updated for leaderboard");
    } catch (err) {
      console.log("⚠️ Could not update player stats:", err);
    }

    // Update local stats cache
    try {
      const local = await getLocalStats();
      if (local) {
        local.totalGames += 1;
        local.totalWins += 1;
        await saveLocalStats(local);
      }
    } catch (e) {
      console.log("⚠️ Local stats update failed:", e);
    }

    console.log(`🔥 XP awarded: +${xp} → total: ${newXP}`);
  } catch (err) {
    console.error("❌ awardLadderXP failed:", err);
  }
};

/* ============================
   CACHED READ
============================ */

/**
 * Read cached ladder stats for UI (legend / profile / ladder screens).
 */
export const getCachedLadderData = async (): Promise<PlayerStats | null> => {
  try {
    const raw = await AsyncStorage.getItem("ladderStats");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && parsed.stats) return parsed.stats as PlayerStats;
    return parsed as PlayerStats;
  } catch {
    return null;
  }
  
};