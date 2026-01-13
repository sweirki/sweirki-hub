import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, Pressable } from "react-native";
import { ACHIEVEMENTS, useAchievementsStore } from "../stores/useAchievementsStore";
import { getColors } from "../theme";
import { Easing } from "react-native";
import { ImageBackground } from "react-native";
export default function AchievementsHub() {
  const colors = getColors();
const [filter, setFilter] = useState("all");
const [selected, setSelected] = useState<any>(null);
const [modalVisible, setModalVisible] = useState(false);
const slideAnim = React.useRef(new Animated.Value(300)).current;
const fadeAnim = React.useRef(new Animated.Value(0)).current;
const unlocked = useAchievementsStore((s) => s.unlocked);
const totalPoints = useAchievementsStore((s) => s.getTotalPoints());
const achievementLevel = useAchievementsStore((s) => s.getLevel());
const progress = useAchievementsStore((s) => s.getProgressPercent());
const loadUnlocked = useAchievementsStore((s) => s.loadUnlocked);

const [sparkle, setSparkle] = useState<string | null>(null);

// Load unlocked achievements from global store
React.useEffect(() => {
  loadUnlocked();
}, [loadUnlocked]);


React.useEffect(() => {
  if (unlocked.length === 0) return;
  const id = unlocked[unlocked.length - 1];
  setSparkle(id);
  const timer = setTimeout(() => setSparkle(null), 1200);
  return () => clearTimeout(timer);
}, [unlocked]);

const filtered = React.useMemo(() => {
  return ACHIEVEMENTS.filter((a) => {
    if (filter === "all") return true;
    if (filter === "unlocked") return unlocked.includes(a.id);
    if (filter === "locked") return !unlocked.includes(a.id);
  });
}, [filter, unlocked]);



 return (
  <ImageBackground
    source={require("../../assets/bg.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        padding: 16,
        paddingTop: 64,
      }}
    >


      <Text
        style={{
          color: colors.buttonSecondaryBg,
          fontSize: 24,
          fontWeight: "900",
          marginBottom: 12,
           textAlign: "center",
        }}
      >
       🎖 Achievements
</Text>

{/* ACHIEVEMENT SCORE SUMMARY */}
<View style={{ marginBottom: 16 }}>

  <Text
    style={{
      color: colors.buttonSecondaryBg,
      fontWeight: "800",
      fontSize: 16,
      marginBottom: 4,
    }}
  >
    Achievement Level: {achievementLevel}
  </Text>

  <Text style={{ color: colors.fg, fontSize: 14 }}>
  Total Points: {totalPoints}
  </Text>
</View>
<View
  style={{
    height: 10,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.buttonPrimaryBg,
  }}
>
  <View
    style={{
      height: "100%",
     width: `${progress}%`,
      backgroundColor: colors.buttonSecondaryBg,
    }}
  />
</View>
      {/* TABS WILL GO HERE */}
     <View
  style={{
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 16,
  }}
>

  {["all", "unlocked", "locked"].map((t) => (
    <TouchableOpacity
      key={t}
     onPress={() => setFilter(t)}
style={{
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 12,
  borderWidth: 1,
  marginRight: 6,
  backgroundColor: filter === t ? colors.buttonPrimaryBg : colors.card,
  borderColor: filter === t ? colors.buttonSecondaryBg : colors.buttonPrimaryBg,
}}

    >
     <Text
  style={{
    color: filter === t ? "#fff" : colors.text,
    fontWeight: "700",
  }}
>

        {t.toUpperCase()}
      </Text>
    </TouchableOpacity>
  ))}
</View>
{/* DARK DIM BACKDROP */}
{modalVisible && (
  <Animated.View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "black",
      opacity: fadeAnim,
      zIndex: 998,
    }}
  >
   <Pressable
  style={{ flex: 1 }}
  onPress={() => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }}
/>

  </Animated.View>
)}

{/* ACHIEVEMENT DETAIL MODAL */}
{modalVisible && selected && (
 <Animated.View
  style={{
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.buttonPrimaryBg,
    elevation: 40,
    zIndex: 999,
    transform: [{ translateY: slideAnim }],
  }}
>

    <Text
      style={{
        fontSize: 32,
        textAlign: "center",
        marginBottom: 8,
      }}
    >
      {selected.icon}
    </Text>

    <Text
      style={{
        color: colors.buttonSecondaryBg,
        fontWeight: "900",
        fontSize: 20,
        textAlign: "center",
      }}
    >
      {selected.title}
    </Text>

    <Text
      style={{
        color: colors.fg,
        marginTop: 12,
        fontSize: 14,
        textAlign: "center",
      }}
    >
      {unlocked.includes(selected.id)
        ? "You have unlocked this achievement!"
        : "This achievement is locked."}
    </Text>

    <Text
  style={{
    color: colors.subText,
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  }}
>
  {selected.desc}
</Text>

<Text
  style={{
    color: colors.buttonSecondaryBg,
    marginTop: 6,
  
    fontSize: 13,
    textAlign: "center",
    fontWeight: "700",
  }}
>
  How to unlock:
</Text>

<Text
  style={{
    color: colors.fg,
    marginTop: 4,
    fontSize: 13,
    textAlign: "center",
  }}
>
  {selected.how}
</Text>


    <TouchableOpacity
      onPress={() => {
  Animated.timing(slideAnim, {
    toValue: 300,
    duration: 250,
    useNativeDriver: true,
  }).start(() => {
    setModalVisible(false);
  });

  Animated.timing(fadeAnim, {
  toValue: 0,
  duration: 200,
  useNativeDriver: true,
}).start();

}}

      style={{
        marginTop: 18,
        alignSelf: "center",
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: colors.buttonPrimaryBg,
        borderRadius: 14,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
        Close
      </Text>
    </TouchableOpacity>
  </Animated.View>
)}

      {/* GRID WILL GO HERE */}
      <ScrollView>
  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
    {/* BADGES WILL BE RENDERED HERE */}
   {filtered.map((a) => (
  <TouchableOpacity
  key={a.id}
  onPress={() => {
    slideAnim.setValue(300);
fadeAnim.setValue(0);

  setSelected(a);
setModalVisible(true);

// Fade in backdrop
Animated.timing(fadeAnim, {
  toValue: 0.6,
  duration: 180,
  useNativeDriver: true,
}).start();

// Slide up sheet
Animated.timing(slideAnim, {
  toValue: 0,
  duration: 260,
  easing: Easing.out(Easing.back(1.2)),
  useNativeDriver: true,
}).start();

  }}
  style={{

      width: "30%",
      margin: "1.5%",
      backgroundColor: "rgba(255,255,255,0.92)",
borderColor: "rgba(255,215,100,0.35)",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
    }}
  >

   {/* GOLD SPARKLE ANIMATION */}
{sparkle === a.id && (
  <View
    style={{
      position: "absolute",
      top: -6,
      left: -6,
      right: -6,
      bottom: -6,
      backgroundColor: "rgba(255,215,0,0.25)",
      borderRadius: 14,
    }}
  />
)}

{sparkle === a.id && (
  <View>
    <Text style={{ position: "absolute", top: -2, right: -2 }}>✨</Text>
    <Text style={{ position: "absolute", bottom: -2, left: -2 }}>✨</Text>
  </View>
)}

    <Text style={{ fontSize: 24 }}>{a.icon}</Text>
    <Text
      style={{
        color: "#0A1B3D",
        marginTop: 6,
        textAlign: "center",
        fontWeight: "800",
        fontSize: 12,
      }}
    >
      {a.title}
    </Text>
 <Text
  style={{
    marginTop: 4,
    color: unlocked.includes(a.id)
      ? colors.buttonSecondaryBg
      : "rgba(10,27,61,0.45)",
    fontSize: 10,
    fontWeight: "700",
  }}
>

  {unlocked.includes(a.id) ? "Unlocked" : "🔒 Locked"}
</Text>

  </TouchableOpacity>

))}

  </View>
</ScrollView>
    </View>
  </ImageBackground>
);
}
