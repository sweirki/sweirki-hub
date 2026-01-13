import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { checkSeasonReset } from "../utils/ladder/seasonManager";
import { getSeasonRank } from "../utils/ladder/scoreEngine";
import { useRankUpStore } from "../app/stores/useRankUpStore";



/**
 * 🎯 Canonical ladder stats shape (cached only)
 */
export interface LadderStats {
  ladderXP: number;
  ladderRank: string;
}

/**
 * 🏆 Canonical ladder XP + leaderboard writer
 * Called ONLY on verified puzzle wins
 */
export async function awardLadderXP(xp: number) {
  const user = auth.currentUser;
  if (!user) {
    console.warn("awardLadderXP called without authenticated user");
    return;
  }

  const uid = user.uid;
await checkSeasonReset();

  // --- Load existing ladder XP ---
const ladderRef = doc(db, "ladderUsers", uid);
const ladderSnap = await getDoc(ladderRef);

const prev = ladderSnap.exists() ? ladderSnap.data() : {};
const prevLeague = prev.seasonLeague ?? null;

const currentXP = prev.xp ?? 0;
const newXP = currentXP + xp;

// season info
const season = prev.season ?? null;
const seasonXP =
  season === prev.season
    ? (prev.seasonXP ?? 0) + xp
    : xp;
const seasonLeague = getSeasonRank(seasonXP);
  // --- Persist ladder XP (single source of truth) ---
 await setDoc(
  ladderRef,
  {
    xp: newXP,
    seasonXP,
    seasonLeague,
    updatedAt: serverTimestamp(),
  },
  { merge: true }
);

if (prevLeague && prevLeague !== seasonLeague) {
  try {
    const { showRankUp } = useRankUpStore.getState();
    showRankUp("League Promotion", `You reached ${seasonLeague} League`);
  } catch {}
}

  // --- Resolve username safely ---
  const userSnap = await getDoc(doc(db, "users", uid));
  const username =
    userSnap.exists() && typeof userSnap.data().username === "string"
      ? userSnap.data().username
      : uid.slice(0, 6);

  const row = {
    uid,
    username,
    xp: newXP,
    updatedAt: serverTimestamp(),
  };

  // --- Global leaderboard ---
  await setDoc(doc(db, "leaderboard", uid), row, { merge: true });

  // --- Weekly leaderboard ---
  await setDoc(doc(db, "weeklyLeaderboard", uid), row, { merge: true });

  // --- Cache locally for hub/profile ---
  await AsyncStorage.setItem(
    "ladderStats",
    JSON.stringify({
      ladderXP: newXP,
      ladderRank: "computed-in-ui",
    })
  );

  console.log("Ladder XP awarded:", {
    uid,
    username,
    gained: xp,
    total: newXP,
  });
}

/**
 * 🔄 Refresh ladder data from Firestore into AsyncStorage
 * Used by hub / profile screens
 */
export async function refreshLadderData() {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await getDoc(doc(db, "ladderUsers", user.uid));
  if (!snap.exists()) return;

  const xp = snap.data().xp ?? 0;

  await AsyncStorage.setItem(
    "ladderStats",
    JSON.stringify({
      ladderXP: xp,
      ladderRank: "computed-in-ui",
    })
  );

  console.log("Ladder data refreshed for", user.uid);
}

/**
 * 📦 Read cached ladder data (offline-safe)
 */
export async function getCachedLadderData(): Promise<LadderStats | null> {
  const raw = await AsyncStorage.getItem("ladderStats");
  return raw ? JSON.parse(raw) : null;
}