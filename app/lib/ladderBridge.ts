// @ts-expect-error
// @expo-router-ignore

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getXpMultiplier } from "../../src/analytics/playerAnalytics";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  increment,
} from "firebase/firestore";

import {
  getPlayerStats,
  type PlayerStats,
} from "./statsManager";

/* ============================
   SEASON CONFIG
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
   XP AWARD
============================ */

export const awardLadderXP = async (xp: number) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ awardLadderXP: no authenticated user");
      return;
    }

    const uid = user.uid;

    let username = await AsyncStorage.getItem("username");
    if (!username) {
      username = user.displayName || user.email || "Guest";
    }

    const seasonId = getCurrentSeasonId();

    // Lifetime XP
    const ladderRef = doc(db, "ladderUsers", uid);
    const ladderSnap = await getDoc(ladderRef);

    const previousXP =
      ladderSnap.exists() && typeof ladderSnap.data()?.xp === "number"
        ? ladderSnap.data()?.xp
        : 0;
const { mult, streak } = await getXpMultiplier();
const boostedXp = Math.round(xp * mult);

console.log(`🔥 XP Multiplier: x${mult} (streak ${streak})  base=${xp}  boosted=${boostedXp}`);
    const newXP = previousXP + boostedXp;

    await setDoc(
      ladderRef,
      {
        uid,
        username,
        xp: newXP,
        lastUpdated: Date.now(),
        currentSeason: seasonId,
      },
      { merge: true }
    );

    // Season XP
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

    console.log(`🔥 XP awarded: +${xp} → total: ${newXP}`);
  } catch (err) {
    console.error("❌ awardLadderXP failed:", err);
  }
};

/* ============================
   CACHED READ
============================ */

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
