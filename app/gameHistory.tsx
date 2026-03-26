import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { auth } from "../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../firebase";

export default function GameHistory() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setGames([]);
          return;
        }

        const q = query(
          collection(db, "users", user.uid, "games"),
          orderBy("createdAt", "desc"),
          limit(50)
        );

        const snap = await getDocs(q);

        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            mode: data.mode,
            time: data.time,
            hintsUsed: data.hintsUsed ?? 0,
            errors: data.errors ?? 0,
            createdAt: data.createdAt,
          };
        });

        setGames(list);
      } catch (err) {
        console.error("Failed to fetch game history:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noData}>No games played yet.</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.bg}
      blurRadius={3}
    >
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.title}>📝 Game History</Text>

        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.line}>🎮 Mode: {item.mode}</Text>
              <Text style={styles.line}>⏱ Time: {item.time}s</Text>
              <Text style={styles.line}>💡 Hints: {item.hintsUsed}</Text>
              <Text style={styles.line}>❌ Errors: {item.errors}</Text>
              <Text style={styles.date}>
                🗓{" "}
                {item.createdAt?.toDate?.().toLocaleString?.() ?? ""}
              </Text>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    color: "#FFD700",
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "left",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,215,100,0.25)",
  },
  line: {
    color: "#FFF",
    fontSize: 15,
    marginBottom: 2,
  },
  date: {
    color: "#CCC",
    fontSize: 13,
    marginTop: 6,
  },
  noData: {
    color: "#FFD700",
    fontSize: 18,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A1F",
  },
});
