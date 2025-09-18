import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LineChart } from "react-native-chart-kit";
const nerdamer = require("nerdamer");
require("nerdamer/Algebra");
require("nerdamer/Calculus");
require("nerdamer/Solve");
require("nerdamer/Extra");

export default function GraphingSolver() {
  const params = useLocalSearchParams();
  const [input, setInput] = useState("");
  const [functions, setFunctions] = useState<string[]>([]);
  const [dataSets, setDataSets] = useState<{ data: number[]; color: () => string }[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>("");

  useEffect(() => {
    if (params.expr && typeof params.expr === "string") {
      setInput(params.expr);
    }
  }, [params]);

  const colors = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6"];

  const handleGraph = () => {
    try {
      const funcs = input.split(";").map(f => f.trim()).filter(f => f.length > 0);
      setFunctions(funcs);

      const xs = Array.from({ length: 41 }, (_, i) => i - 20); // x = -20..20
      let datasets: { data: number[]; color: () => string }[] = [];

      funcs.forEach((func, idx) => {
        const ys = xs.map(x => {
          try { return evaluate(func, { x }); }
          catch { return NaN; }
        });
        datasets.push({
          data: ys,
          color: () => colors[idx % colors.length]
        });
      });

      setDataSets(datasets);

      let s: string[] = [];
      s.push(`Plotted ${funcs.length} function(s) over x=-20..20`);

      if (funcs.length === 2) {
        const [f1, f2] = funcs;
        const inters: string[] = [];
        for (let x = -20; x <= 20; x++) {
          try {
            const y1 = evaluate(f1, { x });
            const y2 = evaluate(f2, { x });
            if (Math.abs(y1 - y2) < 0.001) {
              inters.push(`(${x}, ${y1.toFixed(2)})`);
            }
          } catch {}
        }
        if (inters.length > 0) {
          s.push("Intersection points (approx): " + inters.join(", "));
          setAnswer("Intersections: " + inters.join(", "));
        }
      }

      setSteps(s);
    } catch (err: any) {
      setSteps([" Error: " + err.message]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.banner}> Graphing Solver</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter function(s) in x, separated by ; (e.g. x^2; 2x+3)"
        value={input}
        onChangeText={setInput}
        multiline
        numberOfLines={3}
      />
      <Button title="Plot" onPress={handleGraph} />
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
      {dataSets.length > 0 && (
        <LineChart
          data={{
            labels: ["-20", "-10", "0", "10", "20"],
            datasets: dataSets
          }}
          width={Dimensions.get("window").width - 40}
          height={260}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: () => "#000",
            labelColor: () => "#666"
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  banner: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, minHeight: 60, textAlignVertical: "top" },
  output: { marginTop: 16 },
  step: { fontSize: 16, marginVertical: 2, textAlign: "left" },
  resultBox: { marginTop: 20, alignItems: "center" },
  divider: { height: 1, backgroundColor: "#ccc", width: "100%", marginBottom: 10 },
  answer: { fontSize: 20, fontWeight: "bold", color: "green", textAlign: "center" }
});
