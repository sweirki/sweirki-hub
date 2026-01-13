import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRevenueCat } from "../src/hooks/useRevenueCat";

/* ===============================
   MODES
================================ */

const MODES = [
  { key: "classic", route: "/sudoku", icon: require("../assets/icons/icon-classic.png") },
  { key: "killer", route: "/killerSudoku", icon: require("../assets/icons/icon-killer.png") },
  { key: "hyper", route: "/hyperSudoku", icon: require("../assets/icons/icon-hyper.png") },
  { key: "x", route: "/xSudoku", icon: require("../assets/icons/icon-x.png") },
  { key: "ladder", route: "/leaderboard", icon: require("../assets/icons/icon-ladder.png") },
];

type Mode = {
  key: string;
  route: string;
  icon: any;
};

const PREMIUM_MODES = ["killer", "hyper", "x"];

/* ===============================
   SCREEN
================================ */

export default function VariantHub() {
  const router = useRouter();
  const { isPremium } = useRevenueCat();

  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Player");

  useEffect(() => {
    AsyncStorage.getItem("lastPlayedMode").then(setLastPlayed);
    AsyncStorage.getItem("username").then((n) => n && setUserName(n));
  }, []);

  const handlePress = async (mode: Mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 🔒 PREMIUM GATE
    if (!isPremium && PREMIUM_MODES.includes(mode.key)) {
      router.push("/upgrade");
      return;
    }

    await AsyncStorage.setItem("lastPlayedMode", mode.key);
    router.push(mode.route);
  };

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profile}
          onPress={() => router.push("/profile")}
          activeOpacity={0.85}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName[0]?.toUpperCase() ?? "P"}
            </Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/settings")} activeOpacity={0.85}>
          <Text style={styles.settings}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Title ===== */}
      <Text style={styles.title}>Choose Your Challenge</Text>

      {/* ===== Grid ===== */}
      <View style={styles.row}>
        <AnimatedTile
          mode={MODES[0]}
          lastPlayed={lastPlayed}
          onPress={handlePress}
          isLocked={false}
        />
        <AnimatedTile
          mode={MODES[1]}
          lastPlayed={lastPlayed}
          onPress={handlePress}
          isLocked={!isPremium && PREMIUM_MODES.includes(MODES[1].key)}
        />
      </View>

      <View style={styles.row}>
        <AnimatedTile
          mode={MODES[2]}
          lastPlayed={lastPlayed}
          onPress={handlePress}
          isLocked={!isPremium && PREMIUM_MODES.includes(MODES[2].key)}
        />
        <AnimatedTile
          mode={MODES[3]}
          lastPlayed={lastPlayed}
          onPress={handlePress}
          isLocked={!isPremium && PREMIUM_MODES.includes(MODES[3].key)}
        />
      </View>

      <View style={styles.centerRow}>
        <AnimatedTile
          mode={MODES[4]}
          lastPlayed={lastPlayed}
          onPress={handlePress}
          isLocked={false}
        />
      </View>
    </View>
  );
}

/* ===============================
   TILE
================================ */

function AnimatedTile({
  mode,
  onPress,
  lastPlayed,
  isLocked,
}: {
  mode: Mode;
  onPress: (mode: Mode) => void;
  lastPlayed: string | null;
  isLocked: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const isLastPlayed = lastPlayed === mode.key;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[
        styles.tileWrapper,
        isLastPlayed && styles.lastPlayedGlow,
        { transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(mode)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
      >
        <View style={styles.tileInner}>
          <Image source={mode.icon} style={styles.icon} />

          {/* 🔑 LOCK MARK (ONLY FOR FREE USERS ON PREMIUM MODES) */}
          {isLocked && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>🔑</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ===============================
   STYLES
================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061B3A",
    paddingTop: 64,
    alignItems: "center",
  },
  header: {
    width: "92%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F6C76B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#061B3A",
    fontWeight: "900",
    fontSize: 16,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  settings: {
    fontSize: 20,
    opacity: 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F6C76B",
    marginBottom: 36,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginBottom: 16,
  },
  centerRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginBottom: 16,
  },
  tileWrapper: {
    marginHorizontal: 6,
  },
  lastPlayedGlow: {
    shadowColor: "#F6C76B",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  tileInner: {
    position: "relative",
  },
  icon: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  lockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lockText: {
    fontSize: 14,
  },
});
