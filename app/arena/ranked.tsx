import { View, Text, StyleSheet } from "react-native";
import ArenaLayout from "./ArenaLayout";

export default function ArenaRanked() {
  return (
    <ArenaLayout>
      <Text style={styles.title}>Ranked Arena</Text>

      <Text style={styles.text}>
        Ranked Arena is the competitive mode where performance matters.
      </Text>

      <Text style={styles.text}>
        All ranked runs are completed under fixed rules with no retries.
      </Text>

      <Text style={styles.text}>
        Rankings are based on verified Arena results only.
      </Text>

      <Text style={styles.note}>
        Matchmaking and global rankings will appear automatically
        when the competitive season opens.
      </Text>
    </ArenaLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FBE7A1",
    marginBottom: 14,
  },
  text: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 12,
  },
});
