import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const formatNumber = (num: number): string => {
  if (isNaN(num)) return String(num);
  return (Math.round(num * 1000) / 1000).toString();
};

export default function GeometrySolver() {
  const params = useLocalSearchParams();
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>("");

  useEffect(() => {
    if (params.expr && typeof params.expr === "string") {
      setInput(params.expr);
    }
  }, [params]);

  const solve = () => {
    let s: string[] = [];
    let ans = "";

    try {
      const clean = input.toLowerCase().replace(/\s+/g, "");

      if (clean.startsWith("distance(")) {
        const [x1, y1, x2, y2] = clean.slice(9, -1).split(",").map(Number);
        s.push("Distance formula: ((x2-x1)^2 + (y2-y1)^2)");
        const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ans = formatNumber(d);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("midpoint(")) {
        const [x1, y1, x2, y2] = clean.slice(9, -1).split(",").map(Number);
        s.push("Midpoint formula: ((x1+x2)/2 , (y1+y2)/2)");
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ans = `(${formatNumber(mx)}, ${formatNumber(my)})`;
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("slope(")) {
        const [x1, y1, x2, y2] = clean.slice(6, -1).split(",").map(Number);
        s.push("Slope formula: (y2-y1)/(x2-x1)");
        const m = (y2 - y1) / (x2 - x1);
        ans = formatNumber(m);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("circlearea")) {
        const r = Number(clean.replace("circlearea", ""));
        s.push("Circle area: A = p r^2");
        const area = Math.PI * r * r;
        ans = formatNumber(area);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("spherevolume")) {
        const r = Number(clean.replace("spherevolume", ""));
        s.push("Sphere volume: V = 4/3 p r^3");
        const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
        ans = formatNumber(vol);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("cylindervolume(")) {
        const [r, h] = clean.slice(14, -1).split(",").map(Number);
        s.push("Cylinder volume: V = p r^2 h");
        const vol = Math.PI * Math.pow(r, 2) * h;
        ans = formatNumber(vol);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("conevolume(")) {
        const [r, h] = clean.slice(11, -1).split(",").map(Number);
        s.push("Cone volume: V = 1/3 p r^2 h");
        const vol = (1 / 3) * Math.PI * Math.pow(r, 2) * h;
        ans = formatNumber(vol);
        s.push(" Final Answer: " + ans);
      }
      else {
        s.push(" Unsupported geometry problem");
      }
    } catch (err: any) {
      s.push(" Error: " + err.message);
    }

    setSteps(s);
    setAnswer(ans);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.banner}> Geometry Solver</Text>
      <TextInput
        style={styles.input}
        placeholder="Examples: distance(0,0,3,4), midpoint(1,2,3,4), slope(1,2,3,4), circlearea5"
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
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, minHeight: 60, textAlignVertical: "top" },
  output: { marginTop: 16 },
  step: { fontSize: 16, marginVertical: 2, textAlign: "left" },
  resultBox: { marginTop: 20, alignItems: "center" },
  divider: { height: 1, backgroundColor: "#ccc", width: "100%", marginBottom: 10 },
  answer: { fontSize: 20, fontWeight: "bold", color: "green", textAlign: "center" }
});
