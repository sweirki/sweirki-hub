import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { safeFirestoreCall } from "../src/utils/firestoreSafe";

export async function loadAllPlayers() {
  const snap = await safeFirestoreCall(
    () => getDocs(collection(db, "users")),
    null
  );

  // 🔒 Offline or failed → return empty list
  if (!snap) return [];

  return snap.docs
    .map((doc) => {
      const data = doc.data();
      const stats = data.stats;

      // ❌ Skip users with no real gameplay
      if (!stats || !stats.totalGames || stats.totalGames <= 0) {
        return null;
      }

      return {
        id: doc.id,
        name: data.username || data.displayName || null,
        country: data.country ?? "US",

        xp: stats.totalPoints ?? 0,
        seasonXP: stats.seasonXP ?? 0,
        wins: stats.totalWins ?? 0,
        streak: stats.currentStreak ?? 0,
        bestStreak: stats.bestStreak ?? 0,
        lastPlayed: stats.lastPlayedAt ?? 0,
      };
    })
    .filter(Boolean); // 🔒 removes nulls safely
}
