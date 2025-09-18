import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";

const formatNumber = (num: number): string => {
  if (isNaN(num)) return String(num);
  return (Math.round(num * 1000) / 1000).toString();
};

export default function SolverScreen() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>("");

  const solve = () => {
    let s: string[] = [];
    let ans = "";

    try {
      if (input.startsWith("circlearea")) {
        const r = parseFloat(input.replace("circlearea", ""));
        const area = Math.PI * r * r;
        s.push(`Circle area: A = p r^2 with r = ${r}`);
        ans = formatNumber(area);
        s.push(" Final Answer: " + ans);
      } else {
        s.push(" Unsupported input in solver.tsx demo");
      }
    } catch (err: any) {
      s.push(" Error: " + err.message);
    }

    setSteps(s);
    setAnswer(ans);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.banner}> Demo Solver (Legacy)</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter expression..."
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={3}
      />
      <Button title="Solve" onPress={solve} />

      <View style={styles.output}>
        {steps.map((st, i) => (
          <Text key={i} style={styles.step}>{st}</Text>
        ))}
        {answer !== "" && (
          <View style={styles.resultBox}>
            <View style={styles.divider} />
            <Text style={styles.answer}>{answer}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  banner: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: { 
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    minHeight: 60,
    textAlignVertical: "top"
  },
  output: { marginTop: 16 },
  step: { fontSize: 16, marginVertical: 2, textAlign: "left" },
  resultBox: { marginTop: 20, alignItems: "center" },
  divider: { height: 1, backgroundColor: "#ccc", width: "100%", marginBottom: 10 },
  answer: { fontSize: 20, fontWeight: "bold", color: "green", textAlign: "center" }
});
