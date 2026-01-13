// @ts-expect-error expo-router-ignore
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
   // 🔹 Use local app username instead of Firebase email
let username = await AsyncStorage.getItem("username");
if (!username) username = user.displayName || user.email || "Guest";


    // 🔹 Read previous ladder XP
    const ref = doc(db, "ladderUsers", uid);
    const snap = await getDoc(ref);
    const rawXP = snap.exists() ? snap.data()?.xp ?? 0 : 0;
const previousXP = typeof rawXP === "number" ? rawXP : parseInt(rawXP, 10) || 0;

    const newXP = previousXP + xp;

    // 🔹 Write ladder XP
    await setDoc(
      ref,
      {
        uid,
        username,
        xp: newXP,
        lastUpdated: Date.now(),
      },
      { merge: true }
    );

    // 🔹 Update player stats so leaderboard has wins/games
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

    // 🔹 Update local stats cache (AsyncStorage)
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

/**
 * Read cached ladder stats for UI (legend / profile / ladder screens).
 */
export const getCachedLadderData = async (): Promise<PlayerStats | null> => {
  try {
    const raw = await AsyncStorage.getItem("ladderStats");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // can be either PlayerStats or { username, stats }
    if (parsed && parsed.stats) return parsed.stats as PlayerStats;
    return parsed as PlayerStats;
  } catch {
    return null;
  }
};
