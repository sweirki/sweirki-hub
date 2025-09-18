import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Button } from "react-native";
import {
  solveDerivative,
  solveIntegral,
  solveLimit,
  solveSeries,
  solveDifferential,
  Step,
} from "../lib/calcEngine";

export default function CalculusSolver() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);

  const handleSolve = () => {
    let expr = input.trim();

    if (expr.startsWith("d/dx")) {
      const clean = expr.replace("d/dx", "").replace(/[()]/g, "").trim();
      setSteps(solveDerivative(clean, "x"));
    } else if (expr.startsWith("")) {
      const clean = expr.replace("", "").replace(/dx/, "").trim();
      if (clean.includes(",")) {
        const [fn, lower, upper] = clean.split(",");
        setSteps(solveIntegral(fn.trim(), "x", lower?.trim(), upper?.trim()));
      } else {
        setSteps(solveIntegral(clean, "x"));
      }
    } else if (expr.startsWith("lim")) {
      const inside = expr.replace("lim", "").replace(/[()]/g, "");
      const parts = inside.split(",");
      if (parts.length === 2) {
        const fn = parts[0].trim();
        const [variable, point] = parts[1].split("->");
        setSteps(solveLimit(fn, variable.trim(), point.trim()));
      } else {
        setSteps([{ step: "Invalid limit format", color: "red" }]);
      }
    } else if (expr.startsWith("series")) {
      const inside = expr.replace("series", "").replace(/[()]/g, "");
      const parts = inside.split(",");
      if (parts.length === 4) {
        const fn = parts[0].trim();
        const variable = parts[1].trim();
        const point = parts[2].trim();
        const order = parseInt(parts[3].trim(), 10);
        setSteps(solveSeries(fn, variable, point, order));
      } else {
        setSteps([{ step: "Invalid series format", color: "red" }]);
      }
    } else if (expr.startsWith("ode")) {
      const clean = expr.replace("ode", "").replace(/[()]/g, "").trim();
      setSteps(solveDifferential(clean, "x"));
    } else {
      setSteps([{ step: "Unknown input format", color: "red" }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculus Solver</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter calculus problem"
        value={input}
        onChangeText={setInput}
      />
      <Button title="SOLVE" onPress={handleSolve} />
      <ScrollView style={styles.output}>
        {steps.map((s, i) => (
          <Text key={i} style={{ color: s.color || "black", marginVertical: 2 }}>
            {s.step}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  output: { marginTop: 12 },
});
