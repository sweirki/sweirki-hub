import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function TestConfetti() {
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.reset();
      confettiRef.current.play();
    }
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={confettiRef}
        source={require("../assets/animations/confetti.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});

