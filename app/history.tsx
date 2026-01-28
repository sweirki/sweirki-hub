import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";

/* ================= TYPES ================= */

type GameEntry = {
  mode: string;
  win: boolean;
  time: number;
  errors: number;
  date: string;
};

/* ================= HELPERS ================= */

function historyKey() {
  const uid = auth.currentUser?.uid || "guest";
  return `gameHistory:${uid}`;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
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

/* ================= SCREEN ================= */

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<GameEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(historyKey());
        const parsed = raw ? JSON.parse(raw) : [];
        setHistory(parsed.slice(0, 30));
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

      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Game History</Text>
            <Text style={styles.subtitle}>
              Your recent games and personal records
            </Text>

            {history.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  No games played yet.
                </Text>
              </View>
            ) : (
              <>
                {/* PERSONAL BESTS */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Personal Bests</Text>

                  <StatRow
                    label="Fastest Win"
                    value={formatTime(
                      Math.min(
                        ...history
                          .filter(h => h.win)
                          .map(h => h.time)
                      )
                    )}
                  />

                  <StatRow
                    label="Fewest Errors"
                    value={Math.min(
                      ...history
                        .filter(h => h.win)
                        .map(h => h.errors)
                    )}
                  />
                </View>

                <Text style={styles.sectionTitle}>Recent Games</Text>
              </>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.mode}>
                {modeIcon(item.mode)} {item.mode.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.date,
                  formatDate(item.date) === "Today" && {
                    color: "#FBE7A1",
                  },
                ]}
              >
                {formatDate(item.date)}
              </Text>
            </View>

            <View style={styles.result}>
              <Text
                style={[
                  styles.time,
                  { color: item.win ? "#2ECC71" : "#E74C3C" },
                ]}
              >
                {formatTime(item.time)}
              </Text>

              <Text
                style={[
                  styles.errors,
                  {
                    color:
                      item.errors === 0
                        ? "#2ECC71"
                        : item.errors <= 2
                        ? "#F1C40F"
                        : "#E67E22",
                  },
                ]}
              >
                {item.errors} errors
              </Text>
            </View>
          </View>
        )}
      />
    </ImageBackground>
  );
}

/* ================= SMALL COMPONENT ================= */

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

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FBE7A1",
    marginBottom: 10,
  },

  empty: {
    marginTop: 60,
    alignItems: "center",
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  mode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  date: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },

  result: {
    alignItems: "flex-end",
  },

  time: {
    fontSize: 15,
    fontWeight: "800",
  },

  errors: {
    fontSize: 12,
    marginTop: 2,
  },
});
