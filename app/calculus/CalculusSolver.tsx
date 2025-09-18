import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, TextInput, Button, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import nerdamer from "nerdamer";
import "nerdamer/Algebra";
import "nerdamer/Calculus";
import "nerdamer/Solve";
import "nerdamer/Extra";
import Algebrite from "algebrite";

export default function CalculusSolver() {
  const route = useRoute<any>();
  const { expr: passedExpr } = route.params || {};
  const [input, setInput] = useState<string>(passedExpr || "");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    if (passedExpr) {
      solveExpression(passedExpr);
    }
  }, [passedExpr]);

  const solveExpression = (expr: string) => {
    if (!expr) {
      setResult("⚠️ No expression provided.");
      return;
    }

    console.log("🧮 Solver received:", expr);

    try {
      let output = "";

      // --- Unsupported special functions ---
      if (expr.includes("Unsupported special function")) {
        setResult("⚠️ This function is not supported by the solver.");
        return;
      }

      // --- Differential equations ---
      if (expr.includes("diff(")) {
        output += `Simplified (Nerdamer):\n${nerdamer(expr).toString()}\n\n`;

        try {
          // Convert Nerdamer diff() → Algebrite d()
          const algebriteExpr = expr
            .replace(/diff\(y\(x\),x,1\)/g, "d(y,x)")
            .replace(/diff\(y\(x\),x,2\)/g, "d(y,x,2)")
            .replace(/y\(x\)/g, "y");

          console.log("🔄 Passing to Algebrite:", algebriteExpr);

          const sol = Algebrite.run(`dsolve(${algebriteExpr})`);
          output += `ODE Solution (Algebrite):\n${sol}`;
        } catch (err) {
          output += "⚠️ Could not solve ODE with Algebrite.";
        }

        setResult(output);
        return;
      }

      // --- Integrals ---
      if (expr.startsWith("integral(")) {
        try {
          const sol = Algebrite.run(expr);
          setResult(`Integral Result (Algebrite):\n${sol}`);
        } catch (err) {
          setResult("⚠️ Could not evaluate integral.");
        }
        return;
      }

      // --- Algebraic equations ---
      if (expr.includes("=")) {
        const [lhs, rhs] = expr.split("=");
        const sol = nerdamer(`solve((${lhs})-(${rhs}),x)`).toString();
        setResult(`Solution(s): ${sol}`);
        return;
      }

      // --- Plain expression ---
      const sol = nerdamer(expr).toString();
      setResult(`Simplified: ${sol}`);
    } catch (err: any) {
      console.error("❌ Solver error:", err);
      setResult(`❌ Could not parse expression.\nReason: ${err.message || err}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Calculus Solver</Text>

      <Text style={styles.label}>Enter Expression:</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Enter equation or expression"
      />

      <View style={{ marginVertical: 10 }}>
        <Button title="Solve" onPress={() => solveExpression(input)} />
      </View>

      <Text style={styles.label}>Result:</Text>
      <Text style={styles.result}>{result}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#E3F2FD" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0d47a1",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#0d47a1",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#90CAF9",
    padding: 8,
    fontSize: 16,
    fontFamily: "monospace",
  },
  result: {
    fontSize: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    minHeight: 80,
  },
});