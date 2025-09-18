import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const nerdamer = require("nerdamer");
require("nerdamer/Algebra");
require("nerdamer/Calculus");
require("nerdamer/Solve");
require("nerdamer/Extra");

export default function TrigonometrySolver() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleSolve = () => {
    try {
      const res = nerdamer(input).toString();
      setResult(res);
    } catch (err) {
      setResult("Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trigonometry Solver</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter trig expression"
        value={input}
        onChangeText={setInput}
      />
      <Button title="SOLVE" onPress={handleSolve} />
      <Text style={styles.result}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12 },
  result: { marginTop: 16, fontSize: 18, color: "blue" },
});
