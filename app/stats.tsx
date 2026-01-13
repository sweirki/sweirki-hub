import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { theme, getColors } from "../theme";
import { getRank, getBadges } from "../utils/statsUtils";
import RequireAuth from "./RequireAuth";

function StatsInner() {
  const colors = getColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalTime: 0,
    totalHints: 0,
    totalPoints: 0,
    bestStreak: 0,
    dailyStreak: 0,
    rank: "Unranked",
    achievements: [] as string[],
    badges: [] as string[],
  });

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userId = user.email || user.uid;
      const snap = await getDoc(doc(db, "users", userId));

      let data: any = {};
      if (snap.exists()) {
        const d = snap.data();
        data = d.stats ?? d;
      }

      const totalWins = Number(data.totalWins ?? 0);
      const bestStreak = Number(data.bestStreak ?? 0);
      const totalPoints = Number(data.totalPoints ?? 0);

      const storedDaily = await AsyncStorage.getItem("dailyStreak");
      const dailyStreak = storedDaily ? Number(storedDaily) : 0;

      setStats({
        totalGames: Number(data.totalGames ?? totalWins),
        totalWins,
        totalTime: Number(data.totalTime ?? 0),
        totalHints: Number(data.totalHints ?? 0),
        totalPoints,
        bestStreak,
        dailyStreak,
        rank: getRank(totalWins * 10 + bestStreak),
        achievements: data.achievements ?? [],
        badges: getBadges({
          games: [],
          points: totalPoints,
          streak: bestStreak,
          avgErrors: 0,
        }),
      });
    };

    load();
  }, []);

  const renderStreakBar = () => {
    const capped = Math.min(stats.dailyStreak, 30);
    const percent = (capped / 30) * 100;

    return (
      <View style={styles(colors).streakBar}>
        <View
          style={[styles(colors).streakFill, { width: `${percent}%` }]}
        />
        <Text style={styles(colors).streakText}>
          🔥 {stats.dailyStreak} days
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={[styles(colors).bg, { paddingBottom: insets.bottom }]}
      blurRadius={3}
    >
      <ScrollView
        contentContainerStyle={[
          styles(colors).scroll,
          { paddingTop: 80 }, // ⬅ pushes screen DOWN
        ]}
      >
        <View style={styles(colors).container}>
          <Text style={styles(colors).title}>Stats</Text>

          <View style={styles(colors).card}>
            <Text style={styles(colors).cardTitle}>Overview</Text>
            <Text style={styles(colors).line}>- Rank: {stats.rank}</Text>
            <Text style={styles(colors).line}>
              - Total Games: {stats.totalGames}
            </Text>
            <Text style={styles(colors).line}>
              - Total Wins: {stats.totalWins}
            </Text>
            <Text style={styles(colors).line}>
              - Total Playtime: {stats.totalTime} s
            </Text>
            <Text style={styles(colors).line}>
              - Total Hints Used: {stats.totalHints}
            </Text>
            <Text style={styles(colors).line}>
              - Total Points: {stats.totalPoints}
            </Text>
            <Text style={styles(colors).line}>
              - Best Streak: {stats.bestStreak} days
            </Text>
            <Text style={styles(colors).line}>
              - Daily Streak: {stats.dailyStreak} days
            </Text>
            {renderStreakBar()}
          </View>

          <View style={styles(colors).card}>
            <Text style={styles(colors).cardTitle}>Achievements</Text>
            {stats.achievements.length ? (
              <View style={styles(colors).badgeRow}>
                {stats.achievements.map((a, i) => (
                  <View key={i} style={styles(colors).badge}>
                    <Text style={styles(colors).badgeText}>{a}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles(colors).line}>No achievements yet.</Text>
            )}
          </View>

          <View style={styles(colors).card}>
            <Text style={styles(colors).cardTitle}>Badges</Text>
            {stats.badges.length ? (
              <View style={styles(colors).badgeRow}>
                {stats.badges.map((b, i) => (
                  <View key={i} style={styles(colors).badge}>
                    <Text style={styles(colors).badgeText}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles(colors).line}>No badges yet.</Text>
            )}
          </View>
<View style={styles(colors).card}>
  <Text style={styles(colors).cardTitle}>How Progress Works</Text>

  <Text style={styles(colors).line}>
    Progress is earned through valid game completions under fixed rules.
  </Text>

  <Text style={styles(colors).line}>
    Rank reflects long-term performance, not short-term spikes.
  </Text>

  <Text style={styles(colors).line}>
    Difficulty, accuracy, and consistency affect progress.
  </Text>

  <Text style={styles(colors).line}>
    Cosmetic actions, retries, and device speed do not.
  </Text>

  <Text style={styles(colors).line}>
    All players play by the same rules.
  </Text>
</View>

      
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

export default function StatsScreen() {
  return (
    <RequireAuth>
      <StatsInner />
    </RequireAuth>
  );
}

const styles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    bg: { flex: 1 },
    scroll: {
      paddingHorizontal: theme.spacing.padding,
      alignItems: "stretch",
    },
    container: { width: "100%" },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: "#FBE7A1",
      marginBottom: 20,
      textAlign: "left",
    },
    card: {
      backgroundColor: "rgba(0,0,30,0.65)",
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FBE7A1",
      marginBottom: 8,
    },
    line: {
      fontSize: 13,
      color: "#FFFFFF",
      marginVertical: 2,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
    },
    badge: {
      backgroundColor: "#FFD86A",
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 5,
      margin: 4,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#3B2A00",
    },
    button: {
      marginTop: 14,
      backgroundColor: "#FFD86A",
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: "center",
    },
    buttonText: {
      color: "#3B2A00",
      fontWeight: "700",
      fontSize: 15,
    },
    streakBar: {
      height: 24,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      marginTop: 6,
      overflow: "hidden",
      justifyContent: "center",
    },
    streakFill: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "#D8B24A",
    },
    streakText: {
      fontSize: 11,
      color: "#fff",
      textAlign: "center",
      fontWeight: "600",
    },
  });
