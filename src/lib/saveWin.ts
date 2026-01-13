import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../../firebase";
import { safeFirestoreCall } from "../utils/firestoreSafe";

/**
 * Single source of truth for ALL leaderboard writes
 * - Daily  -> dailyLeaderboard
 * - Normal -> leaderboard
 * - Daily lock is set ONLY after successful Firestore write
 */
export async function saveWin(
  username: string,
  difficulty: string,
  time: number,
  errors: number = 0,
  isDaily: boolean = false
) {
  const uid = auth.currentUser?.uid ?? null;
  const today = new Date().toISOString().slice(0, 10);

  // 🔓 Always clear dailyPlayed first (re-locked only after success)
  await AsyncStorage.removeItem("dailyPlayed");

  console.log("🚨 saveWin CALLED", {
    username,
    difficulty,
    time,
    errors,
    isDaily,
  });

  const winData = {
    uid,
    username,
    difficulty,
    time,
    errors,
    points: Math.max(0, 1000 - time - errors * 50), // simple deterministic score
    period: isDaily ? "daily" : "weekly",
    createdAt: serverTimestamp(),
  };

  console.log("🟡 saveWin reached guarded block", winData);

  // 🔒 HARD FIRESTORE GUARD — NOTHING BELOW CAN CRASH UI
  await safeFirestoreCall(async () => {
    try {
      // 1️⃣ Drop legacy pending wins (old schema)
      await AsyncStorage.removeItem("pendingWins");

      // 2️⃣ Write THIS win (creates collection if missing)
      console.log("🟠 about to write leaderboard doc");

      await addDoc(
        collection(db, "leaderboard"),
        winData
      );

      console.log("🟢 addDoc resolved");

      console.log(
        "🔥 Firestore write OK:",
        isDaily ? "dailyLeaderboard" : "leaderboard",
        winData
      );

      // 3️⃣ Lock Daily ONLY after successful write
      if (isDaily) {
        await AsyncStorage.setItem("dailyPlayed", today);
        console.log("🔒 Daily locked for", today);
      }

      // 4️⃣ Update profile streak / win counters (NOT leaderboard logic)
      if (username) {
        const userRef = doc(db, "users", username);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          const nextStreak =
            data.streakDate === today
              ? data.streakCount
              : (data.streakCount || 0) + 1;

          await setDoc(
            userRef,
            {
              winCount: (data.winCount || 0) + 1,
              streakCount: nextStreak,
              streakDate: today,
            },
            { merge: true }
          );
        } else {
          await setDoc(
            userRef,
            {
              winCount: 1,
              streakCount: 1,
              streakDate: today,
            },
            { merge: true }
          );
        }
      }

      console.log(isDaily ? "✅ Daily win saved" : "✅ Win saved");
    } catch (error) {
      // ⚠️ This catch is INSIDE the guard — never reaches UI
      console.error("🔴 saveWin FAILED (guarded)", error);

      console.warn("⚠️ Offline or Firestore error — queueing win");

      try {
        const existing = (await AsyncStorage.getItem("pendingWins")) || "[]";
        const updated = JSON.parse(existing);
        updated.push(winData);
        await AsyncStorage.setItem("pendingWins", JSON.stringify(updated));
      } catch (err) {
        console.error("❌ Failed to queue win:", err);
      }
    }
  }, null);
}
