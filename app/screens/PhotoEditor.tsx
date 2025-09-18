import React, { useState } from "react";
import { View, Button, Image, ActivityIndicator, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { runOCR } from "../../src/lib/ocrEngine";
import { cleanOCR } from "../../src/utils/ocrNormalize";
import { useNavigation } from "@react-navigation/native";

export default function PhotoEditor() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState<{ raw: string; cleaned: string } | null>(null);
  const navigation = useNavigation();

  const pickImage = async () => {
    console.log("📸 Opening image picker...");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1
      });

      console.log("🟡 Full ImagePicker result (manual):", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log("✅ Image picked:", uri);
        setImageUri(uri);

        console.log("👉 Calling handleOCR now...");
        await handleOCR(uri);
      } else {
        console.log("🚫 Image picking was cancelled.");
      }
    } catch (err) {
      console.error("❌ Picker crashed:", err);
    }
  };

  const handleOCR = async (uri: string) => {
    try {
      console.log("⚡ Starting OCR on:", uri);
      setLoading(true);

      const result = await runOCR(uri);
      console.log("📡 Raw OCR Result:", result);

      const cleaned = cleanOCR(result.latex_styled || result.text || "");
      console.log("✅ Cleaned OCR Result:", cleaned);

      setOcrData({
        raw: result.latex_styled || result.text || "",
        cleaned,
      });
    } catch (err) {
      console.error("❌ OCR failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={() => pickImage()} />
      {loading && <ActivityIndicator size="large" color="blue" />}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {ocrData && !loading && (
        <View style={styles.actions}>
          <Button
            title="Go to Solver"
            onPress={() =>
              navigation.navigate("CalculusSolver" as never, { expr: ocrData.cleaned } as never)
            }
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
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  preview: { marginTop: 20, width: 300, height: 300, resizeMode: "contain" },
  actions: { marginTop: 20, gap: 10, width: 200 }
});
