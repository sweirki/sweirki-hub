import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native";


type GameEntry = {
  mode: string;
  win: boolean;
  time: number;
  errors: number;
  date: string;
};

function historyKey() {
  const uid = auth.currentUser?.uid || "guest";
  return `gameHistory:${uid}`;
}

function formatTime(sec: number) {
  if (!isFinite(sec) || sec <= 0) return "-";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function modeIcon(mode: string) {
  switch (mode) {
    case "classic":
      return "🧩";
    case "daily":
      return "📅";
    case "hyper":
      return "⚡";
    case "killer":
      return "☠️";
    case "x":
      return "❌";
    default:
      return "🎮";
  }
}

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<GameEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(historyKey());
        const parsed = raw ? JSON.parse(raw) : [];
        setHistory(parsed);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FBE7A1" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          No stats yet. Play some games!
        </Text>
      </View>
    );
  }

  const totalGames = history.length;
  const wins = history.filter(h => h.win);
  const losses = totalGames - wins.length;
  const winRate = Math.round((wins.length / totalGames) * 100);

  const avgTime =
    wins.length > 0
      ? Math.round(
          wins.reduce((sum, g) => sum + g.time, 0) / wins.length
        )
      : 0;

  const modes = ["classic", "daily", "hyper", "killer", "x"];

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.bg}
      blurRadius={3}
    >
      <LinearGradient
        colors={["rgba(0,0,40,0.75)", "transparent"]}
        style={StyleSheet.absoluteFillObject}
      />

     <ScrollView
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}
>
        <Text style={styles.title}>Stats</Text>
        <Text style={styles.subtitle}>
          Your performance across all games
        </Text>

        {/* OVERALL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall</Text>

          <StatRow label="Games Played" value={totalGames} />
          <StatRow label="Wins" value={wins.length} />
          <StatRow label="Losses" value={losses} />
          <StatRow label="Win Rate" value={`${winRate}%`} />
          <StatRow
            label="Average Time"
            value={formatTime(avgTime)}
          />
        </View>

        {/* BY MODE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Mode</Text>

          {modes.map(mode => {
            const games = history.filter(h => h.mode === mode);
            const winsForMode = games.filter(h => h.win);
            const bestTime =
              winsForMode.length > 0
                ? Math.min(...winsForMode.map(g => g.time))
                : null;

            return (
              <View key={mode} style={styles.modeRow}>
                <Text style={styles.mode}>
                  {modeIcon(mode)} {mode.toUpperCase()}
                </Text>

                <View style={styles.modeStats}>
                  <Text style={styles.modeStat}>
                    Games: {games.length}
                  </Text>
                  <Text style={styles.modeStat}>
                    Best:{" "}
                    {bestTime !== null
                      ? formatTime(bestTime)
                      : "-"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function StatRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  bg: { flex: 1 },

  container: {
    padding: 20,
    paddingTop: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#061B3A",
  },

  title: {
    fontFamily: "BalooBold",
    fontSize: 24,
    color: "#FBE7A1",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontFamily: "BalooRegular",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 24,
  },

  emptyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(0,0,40,0.6)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FBE7A1",
    marginBottom: 12,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  modeRow: {
    marginBottom: 14,
  },

  mode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  modeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modeStat: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
});
