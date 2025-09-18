import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen() {
  const [history, setHistory] = useState<{ expr: string; answer: string; time: string }[]>([]);

  const loadHistory = async () => {
    const data = await AsyncStorage.getItem("history");
    if (data) {
      setHistory(JSON.parse(data));
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem("history");
    setHistory([]);
    Alert.alert("History Cleared", "All solved problems have been removed.");
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "History" }} />
      <Text style={styles.title}>Solved Problems</Text>

      <Pressable style={[styles.button, { backgroundColor: "#EF4444" }]} onPress={clearHistory}>
        <Text style={styles.buttonText}>Clear History</Text>
      </Pressable>

      {history.length === 0 ? (
        <Text style={styles.empty}>No history yet</Text>
      ) : (
        <FlatList
          data={[...history].reverse()}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.expr}>{item.expr}</Text>
              <Text style={styles.answer}>= {item.answer}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  empty: { fontSize: 16, textAlign: "center", color: "#888" },
  item: { marginBottom: 15, padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  expr: { fontSize: 18, fontWeight: "bold" },
  answer: { fontSize: 18, color: "green" },
  time: { fontSize: 12, color: "#666" },
});
