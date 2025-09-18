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
  solveEquation,
  Step,
  getSupportedVariables,
} from "../../src/lib/stepEngine";

import { normalizeExpr } from "../../src/lib/ocrCleanup";

export default function AlgebraSolver() {
  const { variable } = useLocalSearchParams<{ variable: string }>();
  const [expression, setExpression] = useState("");
  const [solveFor, setSolveFor] = useState(variable || "x");
  const [steps, setSteps] = useState<Step[]>([]);
  const [answer, setAnswer] = useState("");
  const supportedVariables = getSupportedVariables();

  useEffect(() => {
    if (variable && supportedVariables.includes(variable)) {
      setSolveFor(variable);
    }
  }, [variable, supportedVariables]);

  const handleSolve = async () => {
    if (!expression.trim()) {
      setSteps([{ type: "final", text: "⚠️ Please enter an equation." }]);
      setAnswer("");
      return;
    }
    try {
      const cleanInput = normalizeExpr(expression);
      const { steps: solveSteps, answer: finalAnswer } = solveEquation(cleanInput, solveFor);

      setSteps(solveSteps);
      setAnswer(finalAnswer || "");
      if (finalAnswer) {
        await AsyncStorage.setItem(
          "algebra:lastResult",
          JSON.stringify({ expression, solveFor, answer: finalAnswer })
        );
      }
    } catch (err: any) {
      setSteps([{ type: "final", text: `⚠️ Error: ${err.message}` }]);
      setAnswer("");
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
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Solve for:</Text>
      <Picker
        selectedValue={solveFor}
        onValueChange={(itemValue) => setSolveFor(itemValue)}
        style={styles.picker}
      >
        {supportedVariables.map((v) => (
          <Picker.Item key={v} label={v} value={v} />
        ))}
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
