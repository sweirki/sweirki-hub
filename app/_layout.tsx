import { Stack, useRouter } from "expo-router";
import { initRevenueCat } from "../src/lib/revenuecat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { onAuthStateChanged } from "firebase/auth";
import Purchases from "react-native-purchases";
import { AppState } from "react-native";
import {
  getAnalytics,
} from "../src/analytics/playerAnalytics";

import { auth } from "../firebase";
import { handleReferral } from "../utils/inviteUtils";
import { safeFirestoreCall } from "../src/utils/firestoreSafe";
import RankUpPopup from "./components/RankUpPopup";
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);

  const [user, setUser] = useState(auth.currentUser);
 const sessionStartRef = useRef<number | null>(null);
  const router = useRouter();
  // 📅 Normalize timestamps into calendar-day keys
const getDayKey = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};


  /* ================= FONT LOADING ================= */
useEffect(() => {
  (async () => {
    try {
      await Font.loadAsync({
        BalooBold: require("../assets/fonts/Baloo2-Bold.ttf"),
        BalooRegular: require("../assets/fonts/Baloo2-Regular.ttf"),
      });
    } catch (e) {
      console.warn("Font load failed", e);
    } finally {
      setFontsReady(true);
      await SplashScreen.hideAsync();
    }
  })();
}, []);

  /* ================= AUTH LISTENER ================= */
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);

    if (u) {
      // Phase 2: bind RevenueCat identity to Firebase user
      Purchases.logIn(u.uid).catch(() => {});
    }
  });

  return unsubscribe;
}, []);

/* ================= SESSION TRACKING (PHASE 8B) ================= */
useEffect(() => {
  if (!user) return;

  let active = true;

  const startSession = async () => {
   sessionStartRef.current = Date.now();

    try {
      
   const analytics = await safeFirestoreCall(
  () => getAnalytics(user.uid),
  null
);

if (!analytics) return;

      // 🔁 Phase 8B — activity & streak logic
const now = Date.now();
const todayKey = getDayKey(now);
const lastActiveKey = analytics.identity.lastActiveAt
  ? getDayKey(analytics.identity.lastActiveAt)
  : null;

if (todayKey !== lastActiveKey) {
  // if last activity was yesterday → continue streak
  if (
    analytics.identity.lastActiveAt &&
    now - analytics.identity.lastActiveAt < 1000 * 60 * 60 * 24 * 2
  ) {
    analytics.streaks.activityCurrent += 1;
  } else {
    analytics.streaks.activityCurrent = 1;
  }

  analytics.streaks.activityBest = Math.max(
    analytics.streaks.activityBest,
    analytics.streaks.activityCurrent
  );
}

// update last active timestamp
analytics.identity.lastActiveAt = now;

      await AsyncStorage.setItem(
        `analytics:${user.uid}`,
        JSON.stringify(analytics)
      );
    } catch {
      // silent — analytics must never block app
    }
  };

  const endSession = async () => {
    if (!sessionStartRef.current) return;

    const durationSec = Math.floor(
   (Date.now() - sessionStartRef.current) / 1000
    );

    try {
     const analytics = await safeFirestoreCall(
  () => getAnalytics(user.uid),
  null
);

if (!analytics) return;


      const prevAvg = analytics.sessions.avgSessionTimeSec;
      const n = analytics.sessions.totalSessions;

      analytics.sessions.avgSessionTimeSec =
        (prevAvg * (n - 1) + durationSec) / n;

      await AsyncStorage.setItem(
        `analytics:${user.uid}`,
        JSON.stringify(analytics)
      );
    } catch {
      // silent
    }
  };

  startSession();

  const sub = AppState.addEventListener("change", (state) => {
    if (state === "background") {
      endSession();
    }
    if (state === "active") {
      startSession();
    }
  });

  return () => {
    active = false;
    sub.remove();
    endSession();
  };
}, [user]);



  /* ================= REVENUECAT INIT ================= */
  useEffect(() => {
    initRevenueCat();
  }, []);

  /* ================= SAFETY TIMEOUT ================= */


  /* ================= REFERRAL CHECK ================= */
  useEffect(() => {
    if (!user) return;

    const checkReferral = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url && url.includes("?ref=")) {
          const refUid = url.split("?ref=")[1];
          if (refUid && refUid !== user.uid) {
        await safeFirestoreCall(
  () => handleReferral(refUid, user.uid),
  null
);

          }
        }
      } catch (err) {
        console.error("Referral check error:", err);
      }
    };

    checkReferral();
  }, [user]);

 /* ================= LOADING ================= */
if (loading || !fontsReady) {
  // 🧪 DEV ONLY: allow UI shell while auth resolves on Android emulator
  if (__DEV__ && Platform.OS === "android") {
    console.warn("🧪 DEV bypass: rendering shell while auth resolves");
  } else {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#061B3A",
        }}
      >
        <ActivityIndicator size="large" color="#F6C76B" />
      </View>
    );
  }
}


  /* ================= LOGGED OUT STACK ================= */
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    );
  }

  /* ================= LOGGED IN STACK ================= */
  return (
    <View style={{ flex: 1 }}>
      <RankUpPopup />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="sudokuIntro" />
        <Stack.Screen name="sudoku" />
        <Stack.Screen name="chooseDifficulty" />
        <Stack.Screen name="daily" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="testConfetti" />
      </Stack>
    </View>
  );
}
