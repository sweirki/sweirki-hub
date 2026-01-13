// app/components/ShareCard.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getColors } from "../theme";

interface ShareCardProps {
  username: string;
  difficulty: string;
  score: number;
  time: string;
  rank?: string;
}

export default function ShareCard({
  username,
  difficulty,
 score,
  time,
  rank,
}: ShareCardProps) {
  const colors = getColors();
  return (
    <LinearGradient
      colors={[colors.gold, colors.buttonPrimaryBg, colors.secondaryText]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles(colors).card}
    >
      <Text style={styles(colors).title}>Sudoku Victory!</Text>
      <Text style={styles(colors).username}>{username}</Text>

      <View style={styles(colors).row}>
        <Text style={styles(colors).label}>Difficulty:</Text>
        <Text style={styles(colors).value}>{difficulty.toUpperCase()}</Text>
      </View>

      <View style={styles(colors).row}>
        <Text style={styles(colors).label}>Score:</Text>
        <Text style={styles(colors).value}>{score}</Text>
      </View>

      <View style={styles(colors).row}>
        <Text style={styles(colors).label}>Time:</Text>
        <Text style={styles(colors).value}>{time}</Text>
      </View>

      {rank && (
        <View style={styles(colors).row}>
          <Text style={styles(colors).label}>Rank:</Text>
          <Text style={styles(colors).value}>{rank}</Text>
        </View>
      )}

      <Image
        source={require("../assets/icon.png")}
        style={styles(colors).logo}
      />
      <Text style={styles(colors).footer}>#SudokuChamp</Text>
    </LinearGradient>
  );
}

const styles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    card: {
      width: 300,
      height: 400,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      shadowColor: "#FFD700",
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: "#fff",
      marginBottom: 10,
    },
    username: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.gold,
      marginBottom: 20,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "80%",
      marginVertical: 4,
    },
    label: { fontSize: 14, color: "#fff", opacity: 0.8 },
    value: { fontSize: 14, fontWeight: "700", color: "#fff" },
    logo: { width: 50, height: 50, marginTop: 25 },
    footer: { fontSize: 12, color: "#fff", opacity: 0.7, marginTop: 10 },
  });

