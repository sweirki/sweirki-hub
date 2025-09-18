import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const formatNumber = (num: number): string => {
  if (isNaN(num)) return String(num);
  return (Math.round(num * 1000) / 1000).toString();
};

export default function StatisticsSolver() {
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
      const clean = input.toLowerCase().replace(/\s+/g,"");

      if (clean.startsWith("mean")) {
        const nums = clean.replace("mean","").split(",").map(Number);
        s.push("Mean = sum(x)/n");
        const mean = nums.reduce((a,b)=>a+b,0)/nums.length;
        ans = formatNumber(mean);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("median")) {
        const nums = clean.replace("median","").split(",").map(Number).sort((a,b)=>a-b);
        s.push("Median = middle value");
        const mid = Math.floor(nums.length/2);
        const median = nums.length%2===0 ? (nums[mid-1]+nums[mid])/2 : nums[mid];
        ans = formatNumber(median);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("variance")) {
        const nums = clean.replace("variance","").split(",").map(Number);
        const mean = nums.reduce((a,b)=>a+b,0)/nums.length;
        const variance = nums.reduce((a,b)=>a+Math.pow(b-mean,2),0)/nums.length;
        s.push("Variance = S(x-mean)^2 / n");
        ans = formatNumber(variance);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("std(")) {
        const nums = clean.slice(4,-1).split(",").map(Number);
        const mean = nums.reduce((a,b)=>a+b,0)/nums.length;
        const variance = nums.reduce((a,b)=>a+Math.pow(b-mean,2),0)/nums.length;
        const std = Math.sqrt(variance);
        s.push("Standard Deviation = Variance");
        ans = formatNumber(std);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("prob(")) {
        const [favorable,total] = clean.slice(5,-1).split(",").map(Number);
        s.push("Probability = favorable / total");
        ans = formatNumber(favorable/total);
        s.push(" Final Answer: " + ans);
      }
      else if (clean.startsWith("ttest(")) {
        s.push("Hypothesis testing (t-test) placeholder");
        ans = "Run statistical library for detailed test";
        s.push(" Final Answer: " + ans);
      }
      else {
        s.push(" Unsupported statistics problem");
      }
    } catch (err: any) {
      s.push(" Error: " + err.message);
    }

    setSteps(s);
    setAnswer(ans);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.banner}> Statistics Solver</Text>
      <TextInput
        style={styles.input}
        placeholder="Examples: mean1,2,3,4,5 | median5,2,1,4,3 | variance1,2,3 | std(1,2,3,4) | prob(3,10)"
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
