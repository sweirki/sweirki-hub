import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const mockProfile = {
  username: "Player1",
  totalPoints: 5120,
  rank: "Platinum",
  gamesPlayed: 84,
  wins: 68,
  fastestTimes: { easy: 250, medium: 590, hard: 870 },
  streak: 5,
};

function getAchievements(stats: typeof mockProfile): string[] {
  const badges: string[] = [];
  if (stats.wins >= 1) badges.push(" First Win");
  if (stats.wins >= 10) badges.push(" 10 Wins");
  if (stats.wins >= 50) badges.push(" 50 Wins");
  if (stats.wins >= 100) badges.push(" 100 Wins");
  if (stats.fastestTimes.easy && stats.fastestTimes.easy < 300) badges.push(" Fast Finish (Easy <5min)");
  if (stats.fastestTimes.medium && stats.fastestTimes.medium < 600) badges.push(" Fast Finish (Medium <10min)");
  if (stats.fastestTimes.hard && stats.fastestTimes.hard < 900) badges.push(" Fast Finish (Hard <15min)");
  if (stats.streak >= 3) badges.push(" 3-Day Streak");
  if (stats.streak >= 7) badges.push(" 7-Day Streak");
  if (stats.streak >= 30) badges.push(" 30-Day Streak");
  return badges;
}

const tiers = [
  { name: "Bronze", range: "0  999" },
  { name: "Silver", range: "1,000  2,499" },
  { name: "Gold", range: "2,500  4,999" },
  { name: "Platinum", range: "5,000  9,999" },
  { name: "Diamond", range: "10,000  19,999" },
  { name: "Master", range: "20,000  34,999" },
  { name: "Grandmaster", range: "35,000+" },
];

export default function ProfileLadder() {
  const achievements = getAchievements(mockProfile);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.username}>{mockProfile.username}</Text>
        <Text style={styles.rank}>{mockProfile.rank}</Text>
        <Text>Total Points: {mockProfile.totalPoints}</Text>
        <Text>Games Played: {mockProfile.gamesPlayed}</Text>
        <Text>Wins: {mockProfile.wins}</Text>
        <Text>Streak: {mockProfile.streak} days</Text>
      </View>

      <Text style={styles.sectionTitle}>Ranks</Text>
      {tiers.map((t) => (
        <View key={t.name} style={[styles.tier, mockProfile.rank === t.name && styles.currentTier]}>
          <Text style={styles.tierText}>{t.name} ({t.range})</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Achievements</Text>
      {achievements.length > 0 ? (
        achievements.map((a, i) => <Text key={i} style={styles.achievement}>{a}</Text>)
      ) : (
        <Text style={styles.empty}>No achievements yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7", padding: 16 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 20, elevation: 3 },
  username: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  rank: { fontSize: 16, fontWeight: "600", color: "#1a73e8", marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 10 },
  tier: { padding: 10, borderRadius: 6, backgroundColor: "#eee", marginBottom: 6 },
  currentTier: { backgroundColor: "#c5e1f7", borderColor: "#1a73e8", borderWidth: 1 },
  tierText: { fontSize: 15, fontWeight: "600" },
  achievement: { fontSize: 14, color: "#333", marginBottom: 4 },
  empty: { fontSize: 14, color: "#999", fontStyle: "italic" },
});

