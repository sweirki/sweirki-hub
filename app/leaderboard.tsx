import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getColors } from "../theme";



import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

type Tab = "daily" | "season" | "all";

const SEASON_LENGTH_DAYS = 28;

const LEAGUE_UI: Record<
  string,
  { color: string; badge: string }
> = {
  Grandmaster: { color: "#E74C3C", badge: "👑" },
  Master: { color: "#9B59B6", badge: "🔥" },
  Platinum: { color: "#5DADE2", badge: "💎" },
  Gold: { color: "#F1C40F", badge: "🥇" },
  Silver: { color: "#BDC3C7", badge: "🥈" },
  Bronze: { color: "#CD7F32", badge: "🥉" },
};

function getDisplayName(
  item: any,
  user: any,
  userNames: Record<string, string>
) {
  if (item.uid === user?.uid) return "You";
  return userNames[item.uid] || "Anonymous";
}

async function loadUserNamesFromRows(
  rows: any[],
  existing: Record<string, string>
) {
  const missingUids = rows
    .map((r) => r.uid)
    .filter((uid) => uid && !existing[uid]);

  if (missingUids.length === 0) return existing;

  const updates: Record<string, string> = { ...existing };

  await Promise.all(
    missingUids.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          updates[uid] =
            data.displayName ||
            data.username ||
            data.name ||
            "Anonymous";
        }
      } catch {
        updates[uid] = "Anonymous";
      }
    })
  );

  return updates;
}


function getCurrentSeasonId() {
  const start = new Date("2025-01-01").getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / SEASON_LENGTH_DAYS);
}



export default function LeaderboardScreen() {
  const [tab, setTab] = useState<Tab>("season");

  const [user, setUser] = useState<any>(null);
const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [percentileValue, setPercentileValue] = useState<number>(50);
const [myRank, setMyRank] = useState<number>(0);
const [rows, setRows] = useState<any[]>([]);
const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [seasonArchive, setSeasonArchive] = useState<any[]>([]);
  const [seasonChange, setSeasonChange] = useState<{
  from: string;
  to: string;
  direction: "up" | "down";
} | null>(null);

const themeColors = getColors();

const bgDark = themeColors?.bgDark ?? "#0E1A2B";
const bgMid = themeColors?.bgMid ?? "#10263D";

const aroundYouRows = useMemo(() => {
  if (tab !== "season") return rows;

  const index = rows.findIndex((r: any) => r.uid === user?.uid);
  if (index === -1) return rows;

  const start = Math.max(0, index - 2);
  const end = Math.min(rows.length, index + 3);

  return rows.slice(start, end);
}, [rows, tab, user]);


useEffect(() => {
  if (!user || tab !== "season") return;

  const loadSeasonLeaderboard = async () => {
    try {
      console.log("RUNNING DAILY QUERY");
        const q = query(
        collection(db, "leaderboard"),
        where("period", "==", "weekly"),
        orderBy("points", "desc")
      );

      const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

     const total = data.length;
const myIndex = data.findIndex((r: any) => r.uid === user.uid);
      if (myIndex === -1 || total === 0) {
        setPercentileValue(50);
        setMyRank(0);
        return;
      }

      const rank = myIndex + 1;
      const percentile = Math.ceil((rank / total) * 100);

    setMyRank(rank);
setRows(data);
setPercentileValue(percentile);

const names = await loadUserNamesFromRows(data, userNames);
setUserNames(names);

    } catch (e) {
      console.log("Season leaderboard load failed", e);
      setPercentileValue(50);
      setMyRank(0);
    }
  };

  loadSeasonLeaderboard();
}, [user, tab]);

useEffect(() => {
  if (!user || tab !== "daily") return;

  const loadDailyLeaderboard = async () => {
    try {
      const q = query(
        collection(db, "leaderboard"),
        where("period", "==", "daily"),
        orderBy("errors", "asc"),
        orderBy("time", "asc")
      );

      const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));


    setRows(data);

const names = await loadUserNamesFromRows(data, userNames);
setUserNames(names);

    } catch (e) {
      console.log("Daily leaderboard load failed", e);
      setRows([]);
    }
  };

  loadDailyLeaderboard();
}, [user, tab]);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(u);

    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    } catch (e) {
      console.log("Profile load failed", e);
    } finally {
      setLoading(false);
    }
  });

  return unsub;
}, []);

useEffect(() => {
  if (!user) return;

  const loadSeasonArchive = async () => {
    try {
      const seasonsSnap = await getDocs(collection(db, "seasonArchive"));
      const result: any[] = [];

      for (const seasonDoc of seasonsSnap.docs) {
        const seasonId = seasonDoc.id;

        const userSnap = await getDoc(
          doc(db, "seasonArchive", seasonId, "users", user.uid)
        );

        if (userSnap.exists()) {
          const data = userSnap.data();
          result.push({
            season: Number(seasonId),
            league: data.rank,
            rank: data.rank ?? null,
          });
        }
      }

      result.sort((a, b) => b.season - a.season);
      setSeasonArchive(result);
    } catch (e) {
      console.log("Season archive load failed", e);
    }
  };

  loadSeasonArchive();
}, [user]);




// MOCKED UNTIL BACKEND TUNED (safe)
const league = profile?.seasonLeague ?? "Bronze";
const leagueUI = LEAGUE_UI[league];
const seasonEndsIn = "12 days";

// 🔔 Phase 11 — Season promotion / demotion check (Leaderboard)
useEffect(() => {
  if (!league) return;

  const run = async () => {
    try {
      const lastSeasonRank = await AsyncStorage.getItem("lastSeasonRank");

      if (lastSeasonRank && lastSeasonRank !== league) {
        const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"];
        const fromIndex = tiers.indexOf(lastSeasonRank);
        const toIndex = tiers.indexOf(league);

        if (fromIndex !== -1 && toIndex !== -1) {
          setSeasonChange({
            from: lastSeasonRank,
            to: league,
            direction: toIndex > fromIndex ? "up" : "down",
          });
        }
      }

      await AsyncStorage.setItem("lastSeasonRank", league);
    } catch {}
  };

  run();
}, [league]);


  return (
  <ImageBackground
    source={require("../assets/bg.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
   <LinearGradient
  colors={[bgDark, bgMid]}
  style={{ flex: 1, padding: 16 }}
>
{loading ? (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <ActivityIndicator />
  </View>
) : (
  <>


      {/* SEASON HEADER */}
     <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>

      Season {getCurrentSeasonId()} • {seasonEndsIn} left
      </Text>

{seasonChange && (
  <Text
    style={{
      marginTop: 6,
      fontSize: 13,
      fontWeight: "700",
      color: leagueUI.color,
      opacity: 0.9,
    }}
  >
    {seasonChange.direction === "up" ? "⬆️ Promoted to " : "⬇️ Demoted to "}
    {seasonChange.to}
  </Text>
)}


      {/* LEAGUE CARD */}
   <View
  style={{
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#18140F",

    borderWidth: 1.5,
    borderColor: leagueUI.color,

    shadowColor: leagueUI.color,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  }}
>


<Text style={{ fontSize: 19, fontWeight: "700", color: leagueUI.color }}>
  {leagueUI.badge} {league} League
</Text>
      </View>

      {/* MY POSITION */}
      <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", color: "rgba(255,255,255,0.7)" }}>
  {myRank > 0 ? `#${myRank}` : "—"}
</Text>


   <Text style={{ color: "rgba(255,255,255,0.65)" }}>Top {percentileValue}%</Text>


      </View>

      {/* NEXT STEP */}
      <Text style={{ marginTop: 8, color: "rgba(255,255,255,0.65)" }}>

  {tab === "daily"
    ? "A clean Daily can move you closer to promotion"
    : tab === "season"
    ? "Consistent performance matters over the season"
    : "All-Time ranks never reset"}
</Text>


      {/* TABS */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        {(["daily", "season", "all"] as Tab[]).map((t) => (
       <TouchableOpacity
  key={t}
  onPress={() => setTab(t)}
  style={{
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
   backgroundColor:
  tab === t
    ? t === "season"
      ? "#FFD36A"
      : "#E0E0E0"
    : "#2A2A2A",

  }}
>

         <Text
  style={{
    color:
      tab === t
        ? t === "season"
          ? "#000"
          : "#222"
        : "#FFF",
  }}
>

              {t === "daily"
                ? "Daily"
                : t === "season"
                ? "Season"
                : "All-Time"}
            </Text>
          </TouchableOpacity>

        ))}
      </View>

      {/* LEADERBOARD LIST */}
      <FlatList
        style={{ marginTop: 16 }}
   data={tab === "season" ? aroundYouRows : rows}


        keyExtractor={(item) => item.id}
        ListEmptyComponent={
    <Text style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: 40 }}>

      No entries yet
    </Text>
  }
     renderItem={({ item }) => {
  console.log("ROW UID:", item.uid);
  return (

            
         <View
  style={{
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
    borderLeftWidth: item.uid === user?.uid ? 3 : 0,
    borderLeftColor: item.uid === user?.uid ? leagueUI.color : "transparent",
    backgroundColor: item.uid === user?.uid ? "rgba(255,215,120,0.04)" : "transparent",

    paddingLeft: item.uid === user?.uid ? 8 : 0,
  }}
>

 <Text style={{ fontWeight: item.uid === user?.uid ? "700" : "600", color: "#F5F5F5" }}>

#{item.rank} {getDisplayName(item, user, userNames)}

</Text>

        {tab === "daily" && (
  <Text style={{ color: "rgba(255,255,255,0.6)" }}>

    {item.subtitle ?? "Daily Run"}
  </Text>
)}

{tab === "season" && (
  <Text style={{ color: "rgba(255,255,255,0.6)" }}>

    {item.points != null ? `${item.points} pts` : "Season Score"}
  </Text>
)}

          </View>
             );
      }}

      />

{/* SEASON ARCHIVE */}
<View style={{ marginTop: 24 }}>
 <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#F5F5F5" }}>

    Past Seasons
  </Text>

 {seasonArchive.map((s) => {
    const ui = LEAGUE_UI[s.league];
    return (
      <View
        key={s.season}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 6,
          borderBottomWidth: 0.5,
         borderBottomColor: "rgba(255,255,255,0.12)",

        }}
      >
       <Text style={{ color: "rgba(255,255,255,0.7)" }}>

          Season {s.season}
          
        </Text>

        <Text style={{ color: ui.color, fontWeight: "600" }}>
          {ui.badge} {s.league} • #{s.rank}
        </Text>
      </View>
      
    );
  })}
  
</View>


      {/* FOOTER XP */}
   <View style={{ marginTop: 16 }}>
  <Text style={{ color: "rgba(255,255,255,0.6)" }}>XP: {profile?.xp ?? 0}</Text>
  <Text style={{ color: "rgba(255,255,255,0.45)" }}>
    Your progress continues beyond the Ladder
  </Text>
</View>
</>
)}

     </LinearGradient>
  </ImageBackground> 
    
    
  );
}
