import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ScrollView,
   Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRevenueCat } from "../src/hooks/useRevenueCat";
import { TIER_ICONS } from "../utils/ladder/tierIcons";
import Purchases from "react-native-purchases";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { useAchievementsStore, ACHIEVEMENTS } from "./stores/useAchievementsStore";
import { getLadderRank, getSeasonRank } from "../utils/ladder/scoreEngine";
import RequireAuth from "./RequireAuth";
import { theme } from "../theme";
import { useRouter } from "expo-router";


const SEASON_LENGTH_DAYS = 28;
const SEASON_START = new Date("2025-01-01").getTime();

function getCurrentSeasonId() {
  const diffDays = Math.floor((Date.now() - SEASON_START) / 86400000);
  return Math.floor(diffDays / SEASON_LENGTH_DAYS);
}


type Stats = {
  ladderXP: number;
  ladderRank: string;
  seasonXP: number;
  seasonRank: string;
};

function ProfileInner() {
   const { isPremium, refresh } = useRevenueCat();
   const router = useRouter();
  const unlocked = useAchievementsStore((s) => s.unlocked);
  const totalPoints = useAchievementsStore((s) => s.getTotalPoints());
  const achievementLevel = useAchievementsStore((s) => s.getLevel());
  const progress = useAchievementsStore((s) => s.getProgressPercent());

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    ladderXP: 0,
    ladderRank: "Bronze",
    seasonXP: 0,
    seasonRank: "Bronze",
  });
const [seasonChange, setSeasonChange] = useState<{
  from: string;
  to: string;
  direction: "up" | "down";
} | null>(null);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      setEmail(user.email);
      if (!user) return;

      // Local cache
      const cachedName = await AsyncStorage.getItem("username");
      const cachedAvatar = await AsyncStorage.getItem("avatarUri");
      if (cachedName) setUsername(cachedName);
      if (cachedAvatar) setAvatarUri(cachedAvatar);

      // Firestore user doc
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const d = snap.data();
        if (d.username) {
          setUsername(d.username);
          await AsyncStorage.setItem("username", d.username);
        }
        if (d.avatarUri) {
          setAvatarUri(d.avatarUri);
          await AsyncStorage.setItem("avatarUri", d.avatarUri);
        }
      }

      // Ladder XP
      let ladderXP = 0;
      try {
        const ladderSnap = await getDoc(doc(db, "ladderUsers", user.uid));
        ladderXP = ladderSnap.exists() ? ladderSnap.data().xp ?? 0 : 0;
      } catch {}

      // Season XP
let seasonXP = 0;
try {
  const seasonId = getCurrentSeasonId();
  const seasonSnap = await getDoc(
    doc(db, "seasonUsers", `${seasonId}_${user.uid}`)
  );
  seasonXP = seasonSnap.exists() ? seasonSnap.data().xp ?? 0 : 0;
} catch {}


     const newSeasonRank = getSeasonRank(seasonXP);

setStats({
  ladderXP,
  ladderRank: getLadderRank(ladderXP),
  seasonXP,
  seasonRank: newSeasonRank,
});

// 🔔 Phase 11 — Season promotion / demotion check
try {
  const lastSeasonRank = await AsyncStorage.getItem("lastSeasonRank");

  if (lastSeasonRank && lastSeasonRank !== newSeasonRank) {
    const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"];
    const fromIndex = tiers.indexOf(lastSeasonRank);
    const toIndex = tiers.indexOf(newSeasonRank);

    if (fromIndex !== -1 && toIndex !== -1) {
      setSeasonChange({
        from: lastSeasonRank,
        to: newSeasonRank,
        direction: toIndex > fromIndex ? "up" : "down",
      });
    }
  }

  await AsyncStorage.setItem("lastSeasonRank", newSeasonRank);
} catch {}


    };

    load();
  }, []);

  /* ================= AVATAR ================= */

  const saveProfile = async (name: string, avatar?: string | null) => {
    const user = auth.currentUser;
    if (!user) return;

    setUsername(name);
    await AsyncStorage.setItem("username", name);

    if (avatar !== undefined) {
      if (avatar) {
        setAvatarUri(avatar);
        await AsyncStorage.setItem("avatarUri", avatar);
      } else {
        setAvatarUri(null);
        await AsyncStorage.removeItem("avatarUri");
      }
    }

    await setDoc(
      doc(db, "users", user.uid),
      { username: name, avatarUri: avatar ?? "" },
      { merge: true }
    );

    // Sync leaderboard rows
    const snap = await getDocs(collection(db, "leaderboard"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      if (d.data().uid === user.uid) {
        batch.update(doc(db, "leaderboard", d.id), {
          username: name,
          avatarUri: avatar ?? "",
        });
      }
    });
    await batch.commit();
  };
const [logoutVisible, setLogoutVisible] = useState(false);
const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

const handleLogout = () => {
  setLogoutVisible(true);
};
const confirmLogout = async () => {
  setLogoutVisible(false);

  try {
    await Purchases.logOut();
  } catch {}

  await AsyncStorage.multiRemove([
    "uid",
    "email",
    "username",
    "avatarUri",
    "lastSeasonRank",
  ]);

  await auth.signOut();

  router.replace("/login");
};



  const pickImage = async (camera = false) => {
    const res = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
        });

    if (!res.canceled) {
      saveProfile(username, res.assets[0].uri);
    }
  };

 

  return (
    <ImageBackground
      source={require("../assets/bg.png")}
      style={styles.bg}
      blurRadius={3}
    >
      <LinearGradient
        colors={["rgba(0,0,40,0.75)", "transparent"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
 <Text style={styles.title}>Your Profile</Text>
<Text style={styles.subtitle}>
  Identity, progress, and account status
</Text>

        {/* IDENTITY */}
        <View style={styles.identityCard}>
       <TouchableOpacity
  onPress={() => pickImage(false)}
  activeOpacity={0.8}
>
  {avatarUri ? (
    <Image source={{ uri: avatarUri }} style={styles.avatar} />
  ) : (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <Text style={styles.avatarText}>+</Text>
    </View>
    
  )}
</TouchableOpacity>
{/* SEASON CHANGE NOTICE */}
{seasonChange && (
  <Text style={styles.seasonChange}>
    {seasonChange.direction === "up" ? "⬆️ Promoted to " : "⬇️ Demoted to "}
    {seasonChange.to}
  </Text>
)}

<Text style={styles.avatarHint}>Tap to add photo</Text>

          <TextInput
            style={styles.username}
            value={username}
            placeholder="Username"
            placeholderTextColor="#aaa"
            onChangeText={setUsername}
            onEndEditing={() => saveProfile(username, avatarUri)}
          />

{/* SEASON LEAGUE BADGE */}
{isPremium ? (
  <View style={styles.leagueBadge}>
    <Text style={styles.leagueIcon}>
      {TIER_ICONS[stats.seasonRank] ?? "🥉"}
    </Text>
    <Text style={styles.leagueValue}>{stats.seasonRank}</Text>
  </View>
) : (
  <View style={[styles.leagueBadge, { opacity: 0.5 }]}>
    <Text style={styles.leagueIcon}>🔒</Text>
    <Text style={styles.leagueValue}>Premium Rank</Text>
  </View>
)}




          <View style={styles.avatarActions}>
            <TouchableOpacity onPress={() => pickImage(false)}>
              <Text style={styles.link}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickImage(true)}>
              <Text style={styles.link}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => saveProfile(username, null)}>
              <Text style={[styles.link, styles.danger]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
{/* SEASON PROGRESS */}
<View style={styles.seasonCard}>
  <Text style={styles.seasonTitle}>Season Progress</Text>

  <View style={styles.progressBar}>
    <View
      style={[
        styles.progressFill,
        {
         width: `${Math.max(4, Math.round((stats.seasonXP / 1000) * 100))}%`,

        },
      ]}
    />
  </View>

<Text style={styles.seasonXpText}>
  New season — earn XP by playing games
</Text>




  <Text style={styles.seasonReward}>
  Next reward: Unlock next tier
</Text>

</View>



{/* CORE STATS */}
<View style={styles.statsCard}>
  <Text style={styles.cardTitle}>Core Stats</Text>

  {isPremium ? (
    <>
      <Text style={styles.statLine}>🏆 Ladder: {stats.ladderRank}</Text>
      <Text style={styles.statLine}>⭐ Ladder XP: {stats.ladderXP}</Text>
      <Text style={styles.statLine}>📅 Season: {stats.seasonRank}</Text>
      <Text style={styles.statLine}>📈 Season XP: {stats.seasonXP}</Text>
    </>
  ) : (
    <>
      <Text style={styles.statLine}>🏆 Ladder: Locked</Text>
      <Text style={styles.statLine}>⭐ Ladder XP: Locked</Text>
      <Text style={styles.statLine}>📅 Season: Locked</Text>
      <Text style={styles.statLine}>📈 Season XP: Locked</Text>
    </>
  )}
</View>


        {/* ACHIEVEMENTS */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <Text style={styles.statLine}>Level: {achievementLevel}</Text>
          <Text style={styles.statLine}>Points: {totalPoints}</Text>
          <Text style={styles.statLine}>Unlocked: {unlocked.length}</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.iconsRow}>
            {unlocked.slice(-3).map((id) => {
              const a = ACHIEVEMENTS.find((x) => x.id === id);
              return a ? (
                <Text key={id} style={styles.icon}>
                  {a.icon}
                </Text>
              ) : null;
            })}
          </View>
        </View>
        <TouchableOpacity
  style={styles.progressBtn}
  activeOpacity={0.85}
  onPress={() => router.push("/progress")}
>
  <Text style={styles.progressBtnText}>View Progress</Text>
</TouchableOpacity>


<TouchableOpacity
  style={styles.progressBtn}
  activeOpacity={0.85}
  onPress={() => router.push("/history")}
>
  <Text style={styles.progressBtnText}>Game History</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.progressBtn}
  activeOpacity={0.85}
  onPress={() => router.push("/stats")}
>
  <Text style={styles.progressBtnText}>Stats</Text>
</TouchableOpacity>



        {/* ACCOUNT */}
<View style={styles.accountCard}>
  <Text style={styles.cardTitle}>Account</Text>
  {/* ACCOUNT INFO */}
{email && (
  <Text style={styles.accountInfo}>
    Email: {email}
  </Text>
)}

<Text style={styles.accountInfo}>
  Status:{" "}

  <Text style={{ fontWeight: "800", color: isPremium ? "#F6C76B" : "#FFFFFF" }}>
    {isPremium ? "PREMIUM" : "STANDARD"}
  </Text>
</Text>
{!isPremium && (
  <TouchableOpacity
    onPress={() => router.push("/upgrade")}
    style={styles.upgradeBtn}
    activeOpacity={0.85}
  >
   <Text style={styles.upgradeText}>View Premium options</Text>
  </TouchableOpacity>
)}
<TouchableOpacity
  onPress={async () => {
    try {
      const result = await Purchases.restorePurchases();

      await refresh();

      if (result?.entitlements?.active?.premium) {
        setRestoreMessage("✅ Premium restored successfully");
      } else {
        setRestoreMessage("ℹ️ No previous purchases found for this account");
      }
    } catch {
      setRestoreMessage("⚠️ Restore unavailable on this app version");
    }
  }}
  style={styles.restoreBtn}
  activeOpacity={0.8}
>


  <Text style={styles.restoreText}>Restore Purchases</Text>
  <Text style={styles.accountInfo}>
 Restore a previous Premium purchase on this account
</Text>

</TouchableOpacity>

  <TouchableOpacity
    onPress={() => router.push("/settings")}
    style={styles.logoutBtn}
  >
    <Text style={styles.logoutText}>Account settings</Text>
  </TouchableOpacity>
</View>

{/* LOGOUT CONFIRM MODAL */}
<Modal
  transparent
  visible={logoutVisible}
  animationType="fade"
  onRequestClose={() => setLogoutVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Log out</Text>
      <Text style={styles.modalText}>
        Are you sure you want to log out?
      </Text>

      <View style={styles.modalActions}>
        <TouchableOpacity
          onPress={() => setLogoutVisible(false)}
          style={styles.modalCancel}
        >
          <Text style={styles.modalCancelText}>Cancel</Text>
          
        </TouchableOpacity>

        <TouchableOpacity
          onPress={confirmLogout}
          style={styles.modalConfirm}
        >
          <Text style={styles.modalConfirmText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

<Modal
  transparent
  visible={!!restoreMessage}
  animationType="fade"
  onRequestClose={() => setRestoreMessage(null)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Restore Purchases</Text>
      <Text style={styles.modalText}>{restoreMessage}</Text>

      <TouchableOpacity
  onPress={() => setRestoreMessage(null)}
  style={styles.modalSingleConfirm}
>
        <Text style={styles.modalConfirmText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      </ScrollView>
    </ImageBackground>
  );
}

export default function ProfileScreen() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { alignItems: "center", paddingVertical: 40 },
title: {
  fontFamily: "BalooBold",
  fontSize: 25,
  color: "#FBE7A1",
  marginBottom: 6,
  textAlign: "center",
},

subtitle: {
  fontFamily: "BalooRegular",
  fontSize: 10,
  color: "rgba(255,255,255,0.7)",
  marginBottom: 24,
  textAlign: "center",
},

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

identityCard: {
    width: "85%",
    backgroundColor: "rgba(0,0,40,0.55)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  progressBtn: {
  width: "85%",
  marginTop: 6,
  marginBottom: 24,
  paddingVertical: 14,
  borderRadius: 16,
  backgroundColor: "rgba(216,178,74,0.14)",
  borderWidth: 1,
  borderColor: "rgba(216,178,74,0.35)",
  alignItems: "center",
},

progressBtnText: {
  color: "#FBE7A1",
  fontSize: 13,
  fontWeight: "800",
},

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#D8B24A",
  },
 avatarPlaceholder: {
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(216,178,74,0.08)",
},

  avatarText: { fontSize: 36, color: "#D8B24A" },
avatarHint: {
  color: "rgba(255,255,255,0.6)",
  fontSize: 11,
  marginBottom: 6,
},

  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    width: "70%",
    textAlign: "center",
    marginBottom: 12,
  },

  avatarActions: {
    flexDirection: "row",
    gap: 20,
  },

  link: { color: "#FBE7A1", fontWeight: "700" },
  danger: { color: "#ff6b6b" },

  statsCard: {
    width: "85%",
    backgroundColor: "rgba(0,0,40,0.6)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FBE7A1",
    marginBottom: 10,
  },

  statLine: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 6,
  },

  progressBar: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FBE7A1",
  },
accountInfo: {
  color: "rgba(255,255,255,0.75)",
  fontSize: 12,
  marginBottom: 12,
},

  iconsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
upgradeBtn: {
  marginTop: 18,
  paddingVertical: 12,
  borderRadius: 14,
  backgroundColor: "#F6C76B",
  alignItems: "center",
},

upgradeText: {
  color: "#10223D",
  fontSize: 13,
  fontWeight: "900",
},

restoreBtn: {
  marginTop: 6,
  paddingVertical: 10,
  alignItems: "center",
},

restoreText: {
  color: "#FBE7A1",
  fontSize: 11,
  fontWeight: "700",
},


  icon: { fontSize: 26, marginRight: 8 },
  accountCard: {
  width: "85%",
  backgroundColor: "rgba(0,0,40,0.55)",
  borderRadius: 18,
  padding: 20,
  marginBottom: 40,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
},

logoutBtn: {
  marginTop: 8,
  paddingVertical: 12,
  alignItems: "center",
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.08)",
},

logoutText: {
  color: "#ff6b6b",
  fontSize: 13,
  fontWeight: "700",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.65)",
  justifyContent: "center",
  alignItems: "center",
},

modalCard: {
  width: "80%",
  backgroundColor: "#0B1E3A",
  borderRadius: 20,
  padding: 22,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
},

modalTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#FBE7A1",
  textAlign: "center",
  marginBottom: 10,
},

modalText: {
  fontSize: 13,
  color: "rgba(255,255,255,0.9)",
  textAlign: "center",
  marginBottom: 20,
},

modalActions: {
  flexDirection: "row",
  justifyContent: "space-between",
},

modalCancel: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.35)",
  marginRight: 10,
  alignItems: "center",
},

modalCancelText: {
  color: "#FFFFFF",
  fontWeight: "700",
},

modalConfirm: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 12,
  backgroundColor: "#F6C76B",
  alignItems: "center",
},
modalSingleConfirm: {
  marginTop: 10,
  paddingVertical: 12,
  borderRadius: 12,
  backgroundColor: "#F6C76B",
  alignItems: "center",
},


modalConfirmText: {
  color: "#10223D",
  fontWeight: "800",
},
leagueBadge: {
  marginTop: 10,
  marginBottom: 16,
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 16,
  backgroundColor: "rgba(216,178,74,0.12)",
  borderWidth: 1,
  borderColor: "rgba(216,178,74,0.35)",
  alignItems: "center",
},

seasonChange: {
  marginBottom: 14,
  fontSize: 12,
  fontWeight: "700",
  color: "#F6C76B",
  opacity: 0.9,
},

seasonTitle: {
  fontSize: 16,
  fontWeight: "800",
  marginBottom: 8,
   color: "#FBE7A1",
},

seasonXpText: {
  fontSize: 13,
  marginBottom: 6,
  fontWeight: "800",
  color: "rgba(255,255,255,0.8)",
},

seasonReward: {
  fontSize: 13,
  fontWeight: "800",
  color: "rgba(255,255,255,0.9)",
},


leagueIcon: {
  fontSize: 26,        // 👈 badge size
  marginBottom: 4,
},

leagueValue: {
  fontSize: 14,
  fontWeight: "800",
  color: "#FBE7A1",
  textAlign: "center",
},

seasonCard: {
  width: "85%",              // 👈 IMPORTANT (you missed this)
  backgroundColor: "rgba(0,0,40,0.6)",
  borderRadius: 18,
  padding: 20,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
},

});
