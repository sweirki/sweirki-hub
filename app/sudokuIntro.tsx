import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ImageBackground,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getColors } from "../theme";
import { useRouter } from "expo-router";
import { useRevenueCat } from "../src/hooks/useRevenueCat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";
import { useProgression } from "../hooks/useProgression";
const ICONS: Record<string, any> = {
  setting: require("../assets/setting.png"),
  profile: require("../assets/profile.png"),
  stat: require("../assets/stat.png"),
};
function dailyKey(key: string) {
  const uid = auth.currentUser?.uid || "guest";
  return `${key}:${uid}`;
}

const devResetDaily = async () => {
  await AsyncStorage.multiRemove([
    dailyKey("dailyPlayed"),
    dailyKey("lastDailyDate"),
    dailyKey("dailyStreak"),
    dailyKey("weeklyGames"),
  ]);

  console.log("🧪 DEV: Daily reset");
};



const { width } = Dimensions.get("window");
const BTN_WIDTH = Math.min(280, width * 0.82);


export default function SudokuIntro() {
/* useEffect(() => {
  (async () => {
    await AsyncStorage.removeItem("dailyPlayed");
    console.log("🔓 Daily unlocked (global)");
  })();
}, []); */
  const [nextDailyCountdown, setNextDailyCountdown] = useState<string | null>(null);
  const colors = getColors();
  const router = useRouter();
  const { isPremium } = useRevenueCat();
const go = (path: string) => router.push(path as any);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [dailyLockedVisible, setDailyLockedVisible] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progression = useProgression();
  const [dailyStatus, setDailyStatus] = useState<string | null>(null);
  const [weeklyStatus, setWeeklyStatus] = useState<string | null>(null); // <— ADD HERE
  const [progressHint, setProgressHint] = useState<string | null>(null);

const handleContinue = async () => {
  const today = new Date().toISOString().split("T")[0];
 const played = await AsyncStorage.getItem(dailyKey("dailyPlayed"));


  if (played !== today) {
    go("/daily");
  } else {
    go("/variantHub");
  }
};

useEffect(() => {
  if (dailyLockedVisible) {
    scaleAnim.setValue(0.9);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }
}, [dailyLockedVisible]);

useEffect(() => {
  const update = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    if (diff <= 0) return;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    setNextDailyCountdown(
      `⏰ Next Daily in ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    );
  };

  update();
  const id = setInterval(update, 1000);
  return () => clearInterval(id);
}, []);


 useEffect(() => {
  (async () => {
    const name = (await AsyncStorage.getItem("username")) || null;
    setUserName(name);

    const current = auth?.currentUser;
    setIsGuest(!(current?.email || name));
  })();
}, []);

useFocusEffect(
  React.useCallback(() => {
    let active = true;

    requestAnimationFrame(() => {
      if (!active) return;

      // Light haptic AFTER first paint
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      (async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const played = await AsyncStorage.getItem(dailyKey("dailyPlayed"));
          const streak = await AsyncStorage.getItem(dailyKey("dailyStreak"));

          if (!active) return;

          if (played === today) {
            setDailyStatus("✅ Daily completed — streak continues");
          } else if (streak && parseInt(streak, 10) > 0) {
            setDailyStatus(`🔥 ${streak}-day Daily streak`);
          } else {
            setDailyStatus("⏳ Today’s Daily Challenge is ready");
          }
        } catch {
          if (active) setDailyStatus(null);
        }

        // WEEKLY STATUS
        try {
          const weeklyGames = await AsyncStorage.getItem(
            dailyKey("weeklyGames")
          );

          if (!active) return;

          if (weeklyGames && parseInt(weeklyGames, 10) > 0) {
            setWeeklyStatus(
              `📊 Weekly standing updated · ${weeklyGames} games`
            );
          } else {
            setWeeklyStatus("🗓 New week — climb the ladder");
          }
        } catch {
          if (active) setWeeklyStatus(null);
        }

        // PROGRESS PROXIMITY (Phase 6C — soft hint only)
        try {
          const p = progression;

          if (!active) return;

          if (p && p.nextTier != null && p.tier != null) {
            setProgressHint(`Next rank: ${p.nextTier as string}`);
          } else {
            setProgressHint(null);
          }
        } catch {
          if (active) setProgressHint(null);
        }
      })();
    });

    return () => {
      active = false;
    };
  }, [progression])
);


useEffect(() => {
  let animation: Animated.CompositeAnimation | null = null;

  const startDelay = setTimeout(() => {
    animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
  }, 120); // ⏱️ allow first paint to stabilize

  return () => {
    clearTimeout(startDelay);
    animation?.stop();
    glowAnim.stopAnimation();
  };
}, []);




    return (
  
  <View style={{ flex: 1, backgroundColor: "#000" }}>
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.bg}
      blurRadius={4}
      resizeMode="cover"
    >

  
      <ScrollView contentContainerStyle={styles.scroll}>
  

        <Animated.Text
          style={[
            styles.title,
            {
              textShadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 18],
              }) as unknown as number,
            },
          ]}
        >
          Sweirki Sudoku 🧩
        </Animated.Text>
        {__DEV__ && (
  <TouchableOpacity
    onPress={async () => {
      await devResetDaily();
    }}
    style={{
      marginTop: 10,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: "#E74C3C",
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "800",
        fontSize: 12,
      }}
    >
      DEV: Reset Daily
    </Text>
  </TouchableOpacity>
)}

 <View style={{ alignItems: "center", marginBottom: 14 }}>
  <Text
    style={[
      styles.subtitle,
      {
        fontSize: dailyStatus?.includes("completed") ? 16 : 15,
        opacity: dailyStatus?.includes("completed") ? 1 : 0.9,
        marginBottom: weeklyStatus ? 2 : 0,
        lineHeight: 18,
      },
    ]}
  >
    {dailyStatus ?? "Today counts toward your league journey"}
  </Text>

 {!dailyStatus?.includes("completed") &&
  !dailyStatus?.includes("streak") &&
  weeklyStatus && (
    <Text
      style={[
        styles.subtitle,
        {
          fontSize: 12,
          opacity: 0.65,
          marginBottom: 0,
          lineHeight: 14,
        },
      ]}
    >
      {weeklyStatus.replace("🗓 ", "").replace("📊 ", "")}
    </Text>
)}
{!dailyStatus?.includes("completed") &&
  !dailyStatus?.includes("streak") &&
  progressHint && (
    <Text
      style={[
        styles.subtitle,
        {
          fontSize: 12,
          opacity: 0.6,
          marginTop: 6,
          lineHeight: 14,
        },
      ]}
    >
      {progressHint}
    </Text>
)}

</View>



{dailyStatus?.includes("completed") && nextDailyCountdown && (
  <Text
    style={[
      styles.subtitle,
      { marginTop: 6, fontSize: 12, opacity: 0.65 },
    ]}
  >
    {nextDailyCountdown}
  </Text>
)}


      {/* ================= PHASE 5A — PRIMARY CTA ================= */}
<View style={styles.primaryCtaWrap}>
  <LinearGradient
    colors={["#FFE9A8", "#D8B24A"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.primaryButton}
  >
    <TouchableOpacity
      activeOpacity={0.9}
    onPress={async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  isGuest ? go("/login") : handleContinue();
}}


      style={styles.innerButton}
    >
    <Text style={styles.primaryButtonText}>
  {isGuest
    ? "Login / Sign Up to Begin"
    : dailyStatus?.includes("completed")
    ? "Climb the Ladder"
    : "Play Today’s Challenge"}
</Text>

    </TouchableOpacity>
  </LinearGradient>
</View>
{/* ================= PHASE 5A — SECONDARY ACTIONS ================= */}
<View style={styles.secondaryButtons}>
  {[
    { label: "Start a New Game", action: "/variantHub" },
  ...(dailyStatus?.includes("completed")
  ? []
  : [{ label: "Daily Challenge", action: "/daily" }]),

  ].map((btn) => (
    <TouchableOpacity
      key={btn.label}
   onPress={async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (isGuest) {
    go("/login");
    return;
  }

  // Only lock the Daily button; Start New Game should always work.
  if (btn.action === "/daily") {
    const today = new Date().toISOString().split("T")[0];
  const played = await AsyncStorage.getItem(dailyKey("dailyPlayed"));


   if (played === today) {
  setDailyLockedVisible(true);
  return;
}

  }

  go(btn.action);
}}


      disabled={isGuest}
      activeOpacity={0.8}
      style={[
        styles.secondaryButton,
        { opacity: isGuest ? 0.5 : 1 },
      ]}
    >
      <Text style={styles.secondaryButtonText}>{btn.label}</Text>
    </TouchableOpacity>
  ))}
</View>
{/* ================= PHASE 5A — DEPTH TEASER ================= */}
<View style={styles.depthStrip}>
 {
[
  { icon: "🧩", label: "Multiple Modes", path: "/variantHub" },
  { icon: "⚔️", label: "Arena", path: "/arena" },
  { icon: "⭐", label: "Achievements", path: "/achievements" },
]

.map((item) => (
  <TouchableOpacity
  key={item.label}
  style={[
    styles.depthItem,
    { opacity: isGuest ? 0.4 : 1 },
  ]}
  activeOpacity={isGuest ? 1 : 0.7}
  disabled={isGuest}
  onPress={async () => {
  if (isGuest || !item.path) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  go(item.path);
}}

>
  <Text style={styles.depthIcon}>{item.icon}</Text>
  <Text style={styles.depthLabel}>{item.label}</Text>
</TouchableOpacity>

))}

</View>
{/* ================= END PHASE 5A ================= */}
{!isGuest && (
  <View style={styles.statusContainer}>
    <Image
      source={
        isPremium
          ? require("./assets/tier_premium.png")
          : require("./assets/tier_standard.png")
      }
      style={styles.tierBadgeSingle}
    />
  </View>
)}



     
      </ScrollView>

       </ImageBackground>

<Modal
      transparent
      visible={dailyLockedVisible}
      animationType="fade"
      onRequestClose={() => setDailyLockedVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
       <Animated.View
  style={{
    width: "80%",
    backgroundColor: "#10182C",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    transform: [{ scale: scaleAnim }],
  }}
>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#FFD76F",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Daily Challenge
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#E6E6E6",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            ✅ You already completed today’s Daily Challenge.
            {"\n"}Come back tomorrow for a new one!
          </Text>

          <TouchableOpacity
            onPress={() => setDailyLockedVisible(false)}
            style={{
              backgroundColor: "#FFD76F",
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: "#10182C",
                fontWeight: "800",
                fontSize: 16,
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  /* ================= CORE ================= */
  bg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  scroll: {
    alignItems: "center",
    paddingTop: 120,   // ↓ title goes up, more breathing room
    paddingBottom: 200,
  },

  /* ================= TITLE ================= */
  title: {
  fontFamily: "BalooBold",
  fontSize: 36,
  color: "#FBE7A1",
  textAlign: "center",
  marginBottom: 22,
  marginTop: -20,
  textShadowColor: "rgba(216,178,74,0.55)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
  letterSpacing: 0.4,
},


  /* ================= STATUS TEXT ================= */
  subtitle: {
  fontFamily: "BalooRegular",
  fontSize: 15,
  color: "rgba(255,249,232,0.88)",
  marginBottom: 0,
  textAlign: "center",
},



  /* ================= PRIMARY CTA ================= */
  primaryCtaWrap: {
    marginTop: 24,
    marginBottom: 42, // strong separation from secondaries
  },

  primaryButton: {
    width: BTN_WIDTH,
    height: 64,
    borderRadius: 28,
    justifyContent: "center",
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 10,
  },

  primaryButtonText: {
    color: "#1d479bff",
    fontWeight: "900",
    fontSize: 15,
    textAlign: "center",
  },
statusContainer: {
  marginTop: 0,
  alignItems: "center",
  marginBottom: 40,

  
},

tierBadgeSingle: {
  width: 96,
  height: 96,
  resizeMode: "contain",
  opacity: 0.95,
},

tierBadge: {
  width: 150,
  height: 150,
  resizeMode: "contain",
  marginHorizontal: 10,
},

tierActive: {
  opacity: 1,
},

tierInactive: {
  opacity: 0.35,
},

statusRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 0,
  paddingVertical: 0,
  backgroundColor: "transparent", // ⬅️ important
},

  /* ================= SECONDARY ACTIONS ================= */
  secondaryButtons: {
    width: BTN_WIDTH,
    gap: 22,           // more vertical space between buttons
    marginBottom: 60,  // clearer break before depth strip
  },

  secondaryButton: {
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  
secondaryButtonText: {
  color: "rgba(255,255,255,0.7)",
  fontSize: 13,
  fontWeight: "600",
},

  /* ================= DEPTH STRIP ================= */
 depthStrip: {
  width: "92%",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingTop: 26,
  paddingBottom: 12,
  borderTopWidth: 1,
  borderTopColor: "rgba(255,255,255,0.22)",
  marginBottom: 10,
},

  depthItem: {
    alignItems: "center",
    flex: 1,
  },

  depthIcon: {
    fontSize: 20,
    marginBottom: 6,
  },

  depthLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  /* ================= SHARED ================= */
  innerButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
