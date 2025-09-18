import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const CameraCropBox = () => {
  const [recognized, setRecognized] = useState<string | null>(null);

  const handleCapture = () => {
    // TODO: hook up VisionCamera capture + OCR
    console.log("DEBUG: cropAndRecognize called");
    setRecognized("3x+3y+2=0 ; 2x-4y-4=6"); // placeholder
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Crop Box</Text>
      <Button title="Capture Equation" onPress={handleCapture} />
      {recognized && (
        <Text style={styles.result}>Recognized: {recognized}</Text>
      )}
    </View>
  );
};

export default CameraCropBox;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  result: {
    marginTop: 20,
    fontSize: 16,
    color: "green",
  },
});
