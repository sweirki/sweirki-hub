import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const mockDailyScores = [
  { id: "1", username: "Sara", difficulty: "Hard", time: "11:22", score: 320, rank: "Diamond" },
  { id: "2", username: "Omar", difficulty: "Medium", time: "8:10", score: 205, rank: "Gold" },
  { id: "3", username: "Lina", difficulty: "Hard", time: "15:55", score: 198, rank: "Silver" },
  { id: "4", username: "Yusef", difficulty: "Easy", time: "4:30", score: 110, rank: "Bronze" },
];

export default function DailyBoard() {
  const renderMedal = (index: number) => {
    if (index === 0) return <Ionicons name="medal" size={20} color="#FFD700" />;
    if (index === 1) return <Ionicons name="medal" size={20} color="#C0C0C0" />;
    if (index === 2) return <Ionicons name="medal" size={20} color="#CD7F32" />;
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Leaderboard (2025-09-17)</Text>
      <FlatList
        data={mockDailyScores}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.row, index === 0 && styles.topRow]}>
            <Text style={styles.rank}>{index + 1}</Text>
            {renderMedal(index)}
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.detail}>{item.difficulty}</Text>
            <Text style={styles.detail}>{item.time}</Text>
            <Text style={styles.score}>{item.score}</Text>
            <Text style={styles.badge}>{item.rank}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No scores yet today.</Text>}
      />
      <Text style={styles.footer}>Your Position: #7 (Score: 150)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.9)" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderColor: "#ddd" },
  topRow: { backgroundColor: "rgba(255,223,0,0.1)" },
  rank: { width: 25, fontWeight: "700" },
  username: { flex: 1, fontSize: 15 },
  detail: { width: 70, textAlign: "center" },
  score: { width: 60, textAlign: "right", fontWeight: "600" },
  badge: { width: 80, textAlign: "right", color: "#1a73e8" },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
  footer: { textAlign: "center", marginTop: 15, fontWeight: "600" },
});

