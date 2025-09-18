import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";

export default function CameraOCR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        setPhotoUri(photo.uri);
        router.push({ pathname: "/PhotoEditor", params: { uri: photo.uri } });
      } catch (err) {
        console.error("Capture error:", err);
      }
      setLoading(false);
    }
  };

  const handlePick = async () => {
    try {
      // ✅ Compatible with both old & new Expo SDKs
      const pickerMediaType =
        (ImagePicker as any).MediaType?.Images ||
        (ImagePicker as any).MediaTypeOptions?.Images;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: pickerMediaType,
        allowsEditing: false,
        quality: 1,
      });

      console.log("ImagePicker result:", result);

      if (!(result.canceled || (result as any).cancelled)) {
        const photoUri = (result as any).assets
          ? (result as any).assets[0].uri
          : (result as any).uri;

        if (photoUri) {
          setPhotoUri(photoUri);
          router.push({ pathname: "/PhotoEditor", params: { uri: photoUri } });
        } else {
          console.warn("No photo URI returned from ImagePicker.");
        }
      } else {
        console.log("Image picking was cancelled.");
      }
    } catch (err) {
      console.error("Pick error:", err);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Camera" }} />
      {!photoUri ? (
        <CameraView style={styles.camera} ref={cameraRef} />
      ) : (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      )}
      <View style={styles.controls}>
        <Pressable style={[styles.button, { backgroundColor: "#10B981" }]} onPress={handleCapture}>
          <Text style={styles.buttonText}>Capture</Text>
        </Pressable>

        <Pressable style={[styles.button, { backgroundColor: "#1E40AF" }]} onPress={handlePick}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </Pressable>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "contain" },
  controls: { padding: 20, backgroundColor: "white" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
