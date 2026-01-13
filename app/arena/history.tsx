import { View, Text, StyleSheet } from "react-native";
import ArenaLayout from "./ArenaLayout";

export default function ArenaHistory() {
  return (
    <ArenaLayout>
      <Text style={styles.title}>Arena History</Text>
      <Text style={styles.text}>
        Your ranked match history will appear here.
      </Text>
    </ArenaLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FBE7A1",
    marginBottom: 12,
  },
  text: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
});
