import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

export default function IntroScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/splash");
    }, 1200);

    return () => clearTimeout(t);
  }, []);

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>SUDOKU</Text>
      <Text style={styles.subtitle}>by SWEIRKI</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "white",
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
  },
});
