import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Controls({ onNewGame, onHint, onAutoSolve }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.new]} onPress={onNewGame}>
        <Text style={styles.text}>New Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.hint]} onPress={onHint}>
        <Text style={styles.text}>Hint</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.solve]} onPress={onAutoSolve}>
        <Text style={styles.text}>Auto Solve</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  new: { backgroundColor: "#4caf50" },
  hint: { backgroundColor: "#ff9800" },
  solve: { backgroundColor: "#2196f3" },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

