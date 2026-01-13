import { Text, StyleSheet, ScrollView } from "react-native";
import ArenaLayout from "./ArenaLayout";

export default function ArenaRules() {
  return (
    <ArenaLayout>
      <ScrollView>
        <Text style={styles.title}>Rules & Fairness</Text>

        {[
          ["Scoring", "XP is earned through fair, valid wins."],
          ["Wins", "A completed valid board without assistance."],
          ["Daily", "Daily challenges are limited to once per day."],
          ["Offline", "Progress syncs automatically when online."],
          ["Fair Play", "No pay-to-win. Skill only."],
        ].map(([h, t]) => (
          <Text key={h} style={styles.text}>
            <Text style={styles.heading}>{h}{"\n"}</Text>
            {t}
            {"\n\n"}
          </Text>
        ))}
      </ScrollView>
    </ArenaLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FBE7A1",
    marginBottom: 20,
  },
  heading: {
    color: "#FFF9E8",
    fontWeight: "700",
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
});
