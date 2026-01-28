// DAILY FORCE RELOAD v1
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { awardLadderXP, refreshLadderData } from "./lib/ladderBridge";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { getAnalytics, recordGameResult } from "../src/analytics/playerAnalytics";
import { useFocusEffect } from "expo-router";
import { calculateXpForLadder } from "../utils/ladder/scoreEngine";
import { auth, db } from "../firebase";
import { generateSudoku } from "../utils/sudokuGen";
import { getColors } from "./theme/index";
import Sudoku from "./sudoku";
import * as Haptics from "expo-haptics";
import { useAchievementsStore } from "./stores/useAchievementsStore";
import { useRevenueCat } from "../src/hooks/useRevenueCat";
import { onGameFinished } from "../src/game/onGameFinished";

/* =========================
   Helpers
========================= */


function getDailyIdUTC() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

function dailyKey(key: string) {
  const uid = auth.currentUser?.uid || "guest";
  return `${key}:${uid}`;
}

function getWeekId(date: Date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - firstDay.getTime()) / 86400000
  );
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

/* =========================
   Screen
========================= */

export default function DailyChallenge() {
 
 const unlockAchievement = useAchievementsStore((s) => s.unlock);
const { isPremium } = useRevenueCat();

const premiumAtStartRef = useRef<boolean | null>(null);

useEffect(() => {
  if (premiumAtStartRef.current === null && isPremium !== undefined) {
    premiumAtStartRef.current = isPremium;
  }
}, [isPremium]);

const clearDailyDev = async () => {
  try {
   await AsyncStorage.multiRemove([
  dailyKey("dailyPlayed"),
  dailyKey("dailyStreak"),
  dailyKey("lastDailyDate"),
  dailyKey("weeklyGames"),
]);


    // 🔑 RESET LOCAL STATE
    setAlreadyPlayedToday(false);
    const storedStreak = await AsyncStorage.getItem(dailyKey("dailyStreak"));
setDailyStreak(storedStreak ? parseInt(storedStreak, 10) : 0);

    setPuzzle(null);
    setLoading(true);

    // 🔄 FORCE RELOAD DAILY
   devReloadTimeoutRef.current = setTimeout(() => {
  router.replace("/daily");
}, 0);


    // Alert.alert("DEV", "Daily AsyncStorage cleared");
    // console.log("🧹 Daily AsyncStorage cleared");
  } catch (e) {
    // Alert.alert("DEV ERROR", "Failed to clear AsyncStorage");
  }
};


  const router = useRouter();
  const colors = getColors();
const [ladderText, setLadderText] = useState<string | null>(null);
const [authPopup, setAuthPopup] = useState(false);

  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<any>(null);
  const [alreadyPlayedToday, setAlreadyPlayedToday] = useState(false);
  
  const [winVisible, setWinVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dailyStreak, setDailyStreak] = useState<number>(0);


  const commitInProgress = useRef(false);
  const devReloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  /* =========================
     Load Daily Puzzle
  ========================= */

 useFocusEffect(
  React.useCallback(() => {
    let cancelled = false;

    const loadDaily = async () => {
      try {
        const today = getDailyIdUTC();
        
const played = await AsyncStorage.getItem(dailyKey("dailyPlayed"));
const lastPlayed = await AsyncStorage.getItem(dailyKey("lastDailyDate"));

if (played === today || lastPlayed === today) {
  setAlreadyPlayedToday(true);
  setPuzzle(null);
  setLoading(false);
  return;
}


        setAlreadyPlayedToday(false);

        const ref = doc(db, "dailyPuzzles", today);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const raw = snap.data().puzzle;
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (!cancelled) setPuzzle(parsed);
        } else {
          const newPuzzle = generateSudoku("medium");
          await setDoc(ref, { puzzle: JSON.stringify(newPuzzle) });
          if (!cancelled) setPuzzle(newPuzzle);
        }

        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("❌ Daily load failed:", e);
        if (!cancelled) setLoading(false);
      }
    };

    loadDaily();

    return () => {
      cancelled = true;
    };
  }, [])
);


  /* =========================
     ATOMIC DAILY COMMIT
  ========================= */

  const commitDailyWin = async (result: any) => {
    console.log("🔥🔥 DAILY COMMIT ENTERED", {
  uid: auth.currentUser?.uid,
  premiumAtStart: premiumAtStartRef.current,
  isPremium,
});

    const today = getDailyIdUTC();
if (premiumAtStartRef.current === false) {
  await AsyncStorage.setItem(dailyKey("dailyPlayed"), getDailyIdUTC());
  setSaving(false);
  return;
}


await addDoc(collection(db, "leaderboard"), {
  period: "daily",
  dailyId: today,
  uid: auth.currentUser!.uid,
  time: result.time,
  errors: result.errors,
  createdAt: serverTimestamp(),
});

    if (commitInProgress.current) return;
    commitInProgress.current = true;
// 📊 Phase 8A — record Daily analytics (canonical)

recordGameResult({
  username: auth.currentUser?.uid,
  mode: "daily",
  win: true,
  timeSec: result.time,
  errors: result.errors,
  hintsUsed: result.hintsUsed ?? 0,
});

    setSaving(true);
    setSaveError(null);
const xp = calculateXpForLadder({
  mode: "daily",
  difficulty: result.difficulty,
  time: result.time,
  errors: result.errors,
});

    try {
      const today = getDailyIdUTC();

      /* ---------- DAILY LEADERBOARD ---------- */
      const dailyRef = doc(db, "dailyLeaderboard", today);
      const dailySnap = await getDoc(dailyRef);

      const scores = dailySnap.exists()
        ? dailySnap.data().scores || []
        : [];

      const userKey = result.user || "Guest";
      const alreadyIn = scores.some((s: any) => s?.user === userKey);
console.log("DAILY alreadyIn =", alreadyIn);

      if (!alreadyIn) {
        scores.push(result);
        await setDoc(dailyRef, { scores }, { merge: true });



        // ✅ compute daily placement (fastest time rank)
const sorted = [...scores].sort((a, b) => (a.time ?? 999999) - (b.time ?? 999999));
const dailyIndex = sorted.findIndex((s: any) => s?.user === userKey);
const dailyRank = dailyIndex >= 0 ? dailyIndex + 1 : null;

if (dailyRank && dailyRank <= 100) {
  const raw = await AsyncStorage.getItem("dailyTop100Count");
  const next = (raw ? parseInt(raw, 10) : 0) + 1;
  await AsyncStorage.setItem("dailyTop100Count", String(next));

  setLadderText(next === 1 ? "🏅 Top 100 — first achievement" : `🏅 Top 100 achieved — ${next} times`);
} else {
  setLadderText(null);
}

      }

    /* ---------- STREAK + LOCAL LOCK (LAST) ---------- */
      const lastPlayed = await AsyncStorage.getItem(dailyKey("lastDailyDate"));
      let streak = 1;

      if (lastPlayed) {
        const diff =
          (new Date(today).getTime() -
            new Date(lastPlayed).getTime()) /
          (1000 * 3600 * 24);

        if (diff === 1) {
         const prev = await AsyncStorage.getItem(dailyKey("dailyStreak"));
          streak = prev ? parseInt(prev, 10) + 1 : 1;
        }
      }

    // 🔒 Lock Daily ONLY after ladder + leaderboard success

await AsyncStorage.setItem(dailyKey("lastDailyDate"), today);
await AsyncStorage.setItem(dailyKey("dailyStreak"), String(streak));
setDailyStreak(streak);

await AsyncStorage.setItem(dailyKey("dailyPlayed"), today);

// 📈 Track weekly games locally (ladder UI helper)
const prevWeekly = await AsyncStorage.getItem(dailyKey("weeklyGames"));
const weeklyCount = prevWeekly ? parseInt(prevWeekly, 10) + 1 : 1;
await AsyncStorage.setItem(dailyKey("weeklyGames"), String(weeklyCount));

/* ---------- ACHIEVEMENTS ---------- */
unlockAchievement("first_win");
unlockAchievement("points_collector");

if (streak >= 3) {
  unlockAchievement("streak_keeper");
}

setSaving(false);

    } catch (e) {
      console.error("❌ Daily commit failed:", e);
      setSaveError("Failed to save Daily progress. Please try again.");
      setSaving(false);
      commitInProgress.current = false;
    }
  };

  const handleDailyLose = async () => {
  const today = getDailyIdUTC();

  await AsyncStorage.setItem(dailyKey("dailyPlayed"), today);
  await AsyncStorage.setItem(dailyKey("lastDailyDate"), today);

  setAlreadyPlayedToday(true);
  router.replace("/daily");
};



  /* =========================
     Handlers
  ========================= */
const pendingResult = useRef(null as any);
const handleDailyWin = async (result: any) => {
  if (!auth.currentUser) {
    setAuthPopup(true);
    return;
  }

  const today = getDailyIdUTC();
  // rest of the function…

  // 🔒 HARD LOCK DAILY IMMEDIATELY (CRITICAL)
 await AsyncStorage.setItem(dailyKey("dailyPlayed"), today);
  pendingResult.current = result;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// ✅ HISTORY (UNIFIED PATTERN — DAILY)
await onGameFinished({
  mode: "daily",
  win: true,
  time: result.time,
  errors: result.errors,
});


  setWinVisible(true);

  setLadderText(null);
  commitDailyWin(result);
};



  /* =========================
     Render
  ========================= */

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimaryBg} />
      </View>
    );
  }

  if (alreadyPlayedToday) {
    
    return (
      <ImageBackground
        source={require("../assets/bg.png")}
        style={{ flex: 1 }}
        blurRadius={4}
        resizeMode="cover"
      >
        <View style={styles.lockedWrap}>
          <View style={[styles.lockedCard, { backgroundColor: colors.card }]}>
            <Text style={styles.lockedTitle}>Daily Challenge</Text>
           <Text style={styles.lockedText}>
 Today’s Daily Challenge is complete.
{"\n"}Come back tomorrow for a fresh puzzle 🌅
</Text>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.buttonPrimaryBg },
              ]}
             onPress={async () => {
  setWinVisible(false);

  if (pendingResult.current) {
    await commitDailyWin(pendingResult.current);
    pendingResult.current = null;
  }

  router.replace("/sudokuIntro");
}}

            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    
    <>


  <Sudoku
  isDaily
  onDailyWin={handleDailyWin}
  onDailyLose={async () => {
    const today = getDailyIdUTC();

    await AsyncStorage.setItem(dailyKey("dailyPlayed"), today);
    await AsyncStorage.setItem(dailyKey("lastDailyDate"), today);

    setAlreadyPlayedToday(true);
    router.replace("/daily");
  }}
  initialPuzzle={puzzle}
/>



      <Modal transparent visible={winVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={styles.modalTitle}>
  {dailyStreak >= 3
    ? "🔥 Streak Maintained!"
    : "🎉 Daily Challenge Completed!"}
</Text>

           <Text style={[styles.modalSub, { marginBottom: 6 }]}>
  {isPremium
    ? "✨ Progress saved · Daily XP applied"
    : "✨ Daily completed · Practice mode"}
</Text>



{ladderText && (
  <Text style={[styles.modalSub, { fontWeight: "800", marginTop: 4 }]}>
    {ladderText}
  </Text>
)}

        {saving && <Text style={styles.modalSub}>⏳ Finalizing today’s results…</Text>}

            {saveError && (
              <Text style={[styles.modalSub, { color: "#E74C3C" }]}>
                {saveError}
              </Text>
            )}

         <TouchableOpacity
  style={[
    styles.button,
    { backgroundColor: colors.buttonPrimaryBg },
  ]}
  onPress={() => {
    setWinVisible(false);
    pendingResult.current = null;
    router.replace("/sudokuIntro");
  }}
>
  <Text style={styles.buttonText}>Back</Text>
</TouchableOpacity>

          </View>
        </View>
      </Modal>
      <Modal transparent visible={authPopup} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={styles.modalTitle}>Login Required</Text>

            <Text style={styles.modalSub}>
              Please log in to record Daily progress and ladder XP.
            </Text>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.buttonPrimaryBg },
              ]}
              onPress={() => {
                setAuthPopup(false);
                router.push("/login");
              }}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setAuthPopup(false)}
            >
              <Text style={[styles.modalSub, { opacity: 0.7 }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </>
  );
}

/* =========================
   Styles
========================= */

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  lockedWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10,10,30,0.65)",
  },

  lockedCard: {
    width: "80%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  lockedTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },

  lockedText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "75%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  modalSub: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 14,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
