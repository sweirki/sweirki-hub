import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import MathJax from "react-native-mathjax-html-to-svg";

import {
  solveLinear,
  solveQuadratic,
  solvePolynomial,
  solveRational,
  solveAbsolute,
  solveInequality,
  solveSystem,
  solveGeneric,
  classifyEquation,
  Step,
} from "../../src/lib/stepEngine";

import { normalizeExpr } from "../../src/lib/ocrCleanup";

export default function AlgebraSolver() {
  const { variable } = useLocalSearchParams<{ variable: string }>();
  const [expression, setExpression] = useState("");
  const [solveFor, setSolveFor] = useState(variable || "x");
  const [steps, setSteps] = useState<Step[]>([]);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (variable) setSolveFor(variable);
  }, [variable]);

  const handleSolve = async () => {
    try {
      const cleanInput = normalizeExpr(expression);
      const { type } = classifyEquation(cleanInput);
      let s: Step[] = [];

      if (type === "linear") s = solveLinear(cleanInput, solveFor);
      else if (type === "quadratic") s = solveQuadratic(cleanInput, solveFor);
      else if (type === "polynomial") s = solvePolynomial(cleanInput, solveFor);
      else if (type === "rational") s = solveRational(cleanInput, solveFor);
      else if (type === "absolute") s = solveAbsolute(cleanInput, solveFor);
      else if (type === "inequality") s = solveInequality(cleanInput, solveFor);
      else if (type === "system") {
        const eqns = cleanInput.split(";");
        s = solveSystem(eqns, [solveFor]);
      } else {
        s = solveGeneric(cleanInput, solveFor);
      }

      setSteps(s);
      const final = s.find((st) => st.type === "final");
      if (final) {
        setAnswer(final.text);
        await AsyncStorage.setItem(
          "algebra:lastResult",
          JSON.stringify({ expression, solveFor, answer: final.text })
        );
      }
    } catch (err: any) {
      setSteps([{ type: "final", text: `⚠️ Error: ${err.message}` }]);
    }
  };

  const handleCopy = () => {
    if (answer) {
      Clipboard.setStringAsync(answer);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Algebra Solver</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter equation..."
        value={expression}
        onChangeText={setExpression}
        multiline
      />
      <Text style={styles.label}>Solve for:</Text>
      <Picker
        selectedValue={solveFor}
        onValueChange={(itemValue) => setSolveFor(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="x" value="x" />
        <Picker.Item label="y" value="y" />
        <Picker.Item label="z" value="z" />
      </Picker>
      <Pressable style={styles.button} onPress={handleSolve}>
        <Text style={styles.buttonText}>SOLVE</Text>
      </Pressable>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.step}>
            {step.type === "math" ? (
              <MathJax
                html={`<span>${step.text}</span>`}
                fontSize={18}
                style={styles.math}
              />
            ) : (
              <Text
                style={[
                  styles.stepText,
                  step.type === "final" && styles.finalStep,
                ]}
              >
                {`Step ${index + 1}: ${step.text}`}
              </Text>
            )}
          </View>
        ))}
      </View>

      {answer ? (
        <Pressable style={styles.copyButton} onPress={handleCopy}>
          <Text style={styles.copyText}>Copy Answer</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    minHeight: 50,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  stepsContainer: {
    marginTop: 20,
  },
  step: {
    marginBottom: 10,
  },
  stepText: {
    fontSize: 16,
  },
  finalStep: {
    fontWeight: "bold",
    color: "green",
  },
  math: {
    width: "100%",
  },
  copyButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  copyText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
