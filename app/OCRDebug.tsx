import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function OCRDebug() {
  const route = useRoute<any>();
  const { raw, cleaned, solverExpr } = route.params || {};

  const isUnsupported =
    typeof cleaned === "string" &&
    cleaned.includes("Unsupported special function");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OCR Debug</Text>

      {isUnsupported && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⚠️ Unsupported Function Detected!
          </Text>
        </View>
      )}

      <Text style={styles.label}>Raw OCR Output:</Text>
      <Text style={styles.code}>{raw || "—"}</Text>

      <Text style={styles.label}>Cleaned Expression:</Text>
      <Text style={styles.code}>{cleaned || "—"}</Text>

      <Text style={styles.label}>Solver-ready:</Text>
      <Text style={styles.code}>{solverExpr || "—"}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#E3F2FD" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0d47a1",
    marginBottom: 16,
    textAlign: "center",
  },
  banner: {
    backgroundColor: "#FFCDD2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B71C1C",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#0d47a1",
  },
  code: {
    fontSize: 15,
    fontFamily: "monospace",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
  },
});