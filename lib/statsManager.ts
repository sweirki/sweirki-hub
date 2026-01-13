import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase";
import { DeviceEventEmitter } from "react-native";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { safeFirestoreCall } from "../src/utils/firestoreSafe";

export interface PlayerStats {
  totalWins: number;
  totalGames: number;
  bestStreak: number;
  currentStreak: number;
  totalTime: number;
  totalHints: number;
  totalErrors?: number;
  totalPoints?: number;
  achievements?: any[];
  lastMode?: string;
  lastPlayedAt?: number;
}

/**
 * 🧠 Called every time the player wins a puzzle.
 * Updates Firestore summary and logs game history.
 */
export async function updateStatsOnWin(
  mode: string,
  timeTaken: number,
  errors: number,
  hintsUsed: number,
  userId: string,
  points: number = 0,
  achievements: any[] = []
) {
  if (!userId) {
    console.warn("⚠️ updateStatsOnWin called without userId");
    return null;
  }

  try {
    const userRef = doc(db, "users", userId);

    const snap = await safeFirestoreCall(
      () => getDoc(userRef),
      null
    );

    let stats: PlayerStats;

    if (snap && snap.exists() && snap.data().stats) {
      stats = snap.data().stats as PlayerStats;
    } else {
      stats = {
        totalWins: 0,
        totalGames: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalTime: 0,
        totalHints: 0,
        totalErrors: 0,
      };
    }

    // --- 🧮 Update summary values ---
    stats.totalWins += 1;
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    stats.totalTime += timeTaken;
    stats.totalHints += hintsUsed;
    stats.totalErrors = (stats.totalErrors || 0) + errors;
    stats.lastMode = mode;
    stats.lastPlayedAt = Date.now();

    // --- 🧾 Log the individual game ---
    console.log("🧩 Writing game for user:", userId, "mode:", mode);
    const gamesRef = collection(db, "users", userId, "games");
    await addDoc(gamesRef, {
      mode,
      timeTaken,
      errors,
      hintsUsed,
      createdAt: serverTimestamp(),
    });

    // --- 💾 Save updated summary ---
    if ((stats.totalGames || 0) < (stats.totalWins || 0)) {
      stats.totalGames = stats.totalWins;
    }

    stats.totalPoints = (stats.totalPoints || 0) + points;
    stats.achievements = achievements;

    await setDoc(userRef, { stats: { ...stats } }, { merge: true });

    // ===============================
    // 🏆 GLOBAL + WEEKLY LEADERBOARD WRITE (CANONICAL)
    // ===============================
    const username =
      snap && snap.exists() && snap.data()?.username
        ? snap.data().username
        : userId.slice(0, 6); // fallback ONLY if missing

    const leaderboardRow = {
      uid: userId,
      username,
      xp: stats.totalPoints || 0,
      wins: stats.totalWins || 0,
      streak: stats.currentStreak || 0,
      updatedAt: serverTimestamp(),
    };

    // Global leaderboard
    await setDoc(
      doc(db, "leaderboard", userId),
      leaderboardRow,
      { merge: true }
    );

    // Weekly leaderboard
    await setDoc(
      doc(db, "weeklyLeaderboard", userId),
      leaderboardRow,
      { merge: true }
    );

    await AsyncStorage.setItem(`userStats:${userId}`, JSON.stringify(stats));
    DeviceEventEmitter.emit("statsUpdated", stats);

    console.log(
      "📊 [Stats Debug]",
      "Mode:", mode,
      "TotalGames:", stats.totalGames,
      "TotalWins:", stats.totalWins,
      "TotalPoints:", stats.totalPoints,
      "Hints:", stats.totalHints
    );

    console.log(`✅ Stats + game saved for ${userId}`, stats);
    return stats;
  } catch (err) {
    console.warn("⚠️ Failed to update stats:", err);
    return null;
  }
}

/**
 * 🎮 Called when a new Sudoku game starts.
 * Increments totalGames even if the player doesn’t win.
 */
export async function recordGameStart(userId: string) {
  console.log("🎮 Game start (local only) for", userId);
  return;
}
