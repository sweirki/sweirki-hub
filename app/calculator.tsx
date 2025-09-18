import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const nerdamer = require("nerdamer");
require("nerdamer/Algebra");
require("nerdamer/Calculus");
require("nerdamer/Solve");
require("nerdamer/Extra");

export default function Calculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleCalculate = () => {
    try {
      const res = nerdamer(input).toString();
      setResult(res);
    } catch (err) {
      setResult("Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter expression"
        value={input}
        onChangeText={setInput}
      />
      <Button title="Calculate" onPress={handleCalculate} />
      <Text style={styles.result}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12 },
  result: { marginTop: 16, fontSize: 18, color: "blue" },
});
