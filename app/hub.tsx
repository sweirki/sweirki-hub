import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";

export default function Hub() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: "#E3F2FD" }} />;

  const sections = [
    { label: "Algebra", route: "/algebra/AlgebraSolver", icon: "calculator-variant" },
    { label: "Calculus", route: "/calculus/CalculusSolver", icon: "function" },
    { label: "Geometry", route: "/geometry/GeometrySolver", icon: "square-root" },
    { label: "Trigonometry", route: "/trigonometry/TrigonometrySolver", icon: "angle-acute" },
    { label: "Statistics", route: "/statistics/StatisticsSolver", icon: "chart-bar" },
    { label: "Graphing", route: "/graphing/GraphingSolver", icon: "chart-line" },
    // ✅ Fixed: points to PhotoEditor
    { label: "Camera", route: "/screens/PhotoEditor", icon: "camera-outline" }
  ];

  const bottomIcons = [
    { route: "/history", icon: "history", label: "History" },
    { route: "/calculator", icon: "calculator", label: "Calc" },
    { route: "/options", icon: "cog-outline", label: "Settings" }
  ];

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Text style={styles.title}>Sweirki Math</Text>

        <View style={styles.grid}>
          {sections.map((s, i) => (
            <Pressable key={i} style={styles.button} onPress={() => router.push(s.route)}>
              <MaterialCommunityIcons name={s.icon} size={28} color="#0d47a1" style={{ marginBottom: 6 }} />
              <Text style={styles.buttonText}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomRow}>
          {bottomIcons.map((b, i) => (
            <Pressable key={i} style={styles.bottomButton} onPress={() => router.push(b.route)}>
              <MaterialCommunityIcons name={b.icon} size={14} color="#0d47a1" />
              <Text style={styles.bottomText}>{b.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#E3F2FD" },
  container: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingVertical: 40 },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 34,
    color: "#0d47a1",
    marginBottom: 20,
    textAlign: "center"
  },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: Dimensions.get("window").width - 30 },
  button: {
    backgroundColor: "#BBDEFB",
    paddingVertical: 20,
    borderRadius: 18,
    margin: 12,
    width: Dimensions.get("window").width / 3 - 30,
    alignItems: "center"
  },
  buttonText: { fontSize: 13, fontWeight: "600", color: "#0d47a1", textAlign: "center" },
  bottomRow: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 10, width: "80%" },
  bottomButton: { alignItems: "center", backgroundColor: "#E3F2FD", borderRadius: 40, paddingVertical: 5, paddingHorizontal: 10 },
  bottomText: { fontSize: 9, fontWeight: "500", color: "#0d47a1", marginTop: 2 }
});
