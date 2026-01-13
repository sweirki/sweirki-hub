import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import ArenaLayout from "./ArenaLayout";

export default function ArenaHub() {
  return (
    <ArenaLayout>
      <Text style={styles.title}>Arena</Text>
      <Text style={styles.subtitle}>Competitive Sudoku</Text>

      {[
        { title: "Ranked", desc: "View your competitive rank", path: "/arena/ranked" },
        { title: "Rules & Fairness", desc: "How competition works", path: "/arena/rules" },
        { title: "History", desc: "Your Arena results", path: "/arena/history" },
      ].map((item) => (
        <TouchableOpacity
          key={item.title}
          style={styles.card}
          onPress={() => router.push(item.path)}
          activeOpacity={0.85}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </TouchableOpacity>
      ))}
    </ArenaLayout>
  );
}

const styles = StyleSheet.create({
title: {
  fontSize: 30,
  fontWeight: "800",
  color: "#FBE7A1",
  marginBottom: 4,
  textShadowColor: "rgba(216,178,74,0.6)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
},
subtitle: {
  fontSize: 15,
  fontWeight: "500",
  color: "rgba(255,249,232,0.9)",
  marginBottom: 28,
},

 card: {
  backgroundColor: "rgba(0,0,0,0.32)",
  borderRadius: 22,
  padding: 20,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
},

  cardTitle: {
    color: "#FFF9E8",
    fontSize: 18,
    fontWeight: "700",
  },
  cardDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 6,
  },
});
