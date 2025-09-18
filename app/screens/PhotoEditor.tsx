import React, { useState } from "react";
import {
  View,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { runOCR } from "../../src/lib/ocrEngine";
import { normalizeExpr } from "../../src/lib/ocrCleanup"; // ✅ fixed import
import { useNavigation } from "@react-navigation/native";

export default function PhotoEditor() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState<{ raw: string; cleaned: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  // Image picker with permission checks
  const pickImage = async () => {
    setError(null);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      const msg = "Permission to access media library was denied.";
      setError(msg);
      Alert.alert("Permission Denied", msg);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        setError("Image picking was cancelled.");
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        setError("No image selected.");
        return;
      }

      const uri = result.assets[0].uri;
      setImageUri(uri);
      await handleOCR(uri);
    } catch (err) {
      const msg = "Image picker crashed.";
      setError(msg);
      console.error("❌ Picker crashed:", err);
      Alert.alert("Error", msg);
    }
  };

  // OCR handler
  const handleOCR = async (uri: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await runOCR(uri);

      const rawText = result.latex_styled || result.text || "";
      if (!rawText) {
        setError("OCR could not detect any text. Try another image.");
        setOcrData(null);
        return;
      }

      const cleaned = normalizeExpr(rawText); // ✅ use normalizeExpr

      setOcrData({
        raw: rawText,
        cleaned,
      });
    } catch (err) {
      const msg = "OCR failed. Try again with a different image.";
      setError(msg);
      console.error("❌ OCR failed:", err);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="blue" />}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {ocrData && !loading && (
        <View style={styles.actions}>
          <Button
            title="Go to Solver"
            onPress={() =>
              navigation.navigate("CalculusSolver" as never, {
                expr: ocrData.cleaned,
              } as never)
            }
            disabled={!!error}
          />
          <Button
            title="Debug OCR"
            onPress={() =>
              navigation.navigate("OCRDebug" as never, {
                raw: ocrData.raw,
                cleaned: ocrData.cleaned,
                solverExpr: ocrData.cleaned,
              } as never)
            }
            disabled={!!error}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  preview: { marginTop: 20, width: 300, height: 300, resizeMode: "contain" },
  actions: { marginTop: 20, gap: 10, width: 200 },
  error: { marginTop: 10, color: "red", fontWeight: "bold" },
});
