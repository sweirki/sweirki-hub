// app/splash.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import * as Progress from "react-native-progress";

const NEXT_ROUTE = "/sudokuIntro"; // keep this simple for now

export default function Splash() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

 useEffect(() => {
  let mounted = true;
  const totalMs = 2200;
  const start = Date.now();

  const tick = () => {
    if (!mounted) return;

    const elapsed = Date.now() - start;
    const t = Math.min(1, elapsed / totalMs);
    setProgress(Math.pow(t, 0.85));

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      router.replace(NEXT_ROUTE);
    }
  };

  requestAnimationFrame(tick);

  return () => {
    mounted = false;
  };
}, [router]);


  return (
  <View style={{ flex: 1, backgroundColor: "#000" }}>
    <ImageBackground source={require("../assets/bg.png")} style={styles.bg}>
      <View style={styles.container}>

        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.titleBig}>Sweirki Sudoku</Text>

        <Progress.Bar
          progress={progress}
          width={250}
         color="#D8B24A"
          unfilledColor="rgba(255,255,255,0.25)"
          borderWidth={0}
          borderRadius={10}
          style={styles.progress}
        />

        <Text style={styles.disclaimer}>
          Characters and events in this game are fictitious.
        </Text>
            </View>
    </ImageBackground>
  </View>
);

}

const styles = StyleSheet.create({
 bg: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
},

  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "BalooRegular",
    color: "#FFF",
    marginBottom: 4,
  },
  titleBig: {
    fontSize: 38,
    fontFamily: "BalooBold",
    color: "#FFD700",
    marginBottom: 28,
  },
  progress: {
    marginTop: 20,
    marginBottom: 30,
  },
  disclaimer: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: 20,
    width: "80%",
  },
});
