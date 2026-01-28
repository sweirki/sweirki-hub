import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ImageBackground,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getColors } from "../theme";
import { useRevenueCat } from "../src/hooks/useRevenueCat";
import { getSeasonOutcome, getSeasonRank } from "../utils/ladder/scoreEngine";
import { archiveSeason } from "./lib/seasonArchive";

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
const getTodayId = () =>
  new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const LEAGUE_UI: Record<string, { color: string; badge: string }> = {
  Grandmaster: { color: "#E74C3C", badge: "👑" },
  Master: { color: "#9B59B6", badge: "🔥" },
  Platinum: { color: "#5DADE2", badge: "💎" },
  Gold: { color: "#F1C40F", badge: "🥇" },
  Silver: { color: "#BDC3C7", badge: "🥈" },
  Bronze: { color: "#CD7F32", badge: "🥉" },
};



function getDisplayName(item: any, user: any, userNames: Record<string, string>) {
  if (item.uid === user?.uid) return "You";
  return userNames[item.uid] || "Anonymous";
}

async function loadUserNamesFromRows(rows: any[], existing: Record<string, string>) {
  const missingUids = rows.map(r => r.uid).filter(uid => uid && !existing[uid]);
  if (!missingUids.length) return existing;

  const updates = { ...existing };
  await Promise.all(
    missingUids.map(async uid => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          updates[uid] =
            data.displayName || data.username || data.name || "Anonymous";
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
  const diffDays = Math.floor((Date.now() - start) / 86400000);
  return Math.floor(diffDays / SEASON_LENGTH_DAYS);
}

function getSeasonDaysLeftText() {
  const start = new Date("2025-01-01").getTime();
  const diffDays = Math.floor((Date.now() - start) / 86400000);
  const dayInSeason = diffDays % SEASON_LENGTH_DAYS;
  return `${Math.max(0, SEASON_LENGTH_DAYS - dayInSeason)} days`;
}

export default function LeaderboardScreen() {
  const [dailyStatus, setDailyStatus] = useState<"idle" | "played">("idle");
const { isPremium } = useRevenueCat();
  const themeColors = getColors() ?? {};
const bgDark = themeColors.bgDark ?? "#0E1A2B";
const bgMid  = themeColors.bgMid  ?? "#10263D";


  const [tab, setTab] = useState<Tab>("season");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [percentileValue, setPercentileValue] = useState(50);
  const [myRank, setMyRank] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [ladderXP, setLadderXP] = useState(0);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [seasonArchive, setSeasonArchive] = useState<any[]>([]);
  const [seasonChange, setSeasonChange] = useState<any>(null);

  useEffect(() => setRows([]), [tab]);

  const aroundYouRows = useMemo(() => {
    if (tab !== "season") return rows;
    const index = rows.findIndex(r => r.uid === user?.uid);
    if (index === -1) return rows;
    return rows.slice(Math.max(0, index - 2), Math.min(rows.length, index + 3));
  }, [rows, tab, user]);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async u => {
    if (!u) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(u);
    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) setProfile(snap.data());

      // ✅ ADD THESE 2 LINES
      const ladderSnap = await getDoc(doc(db, "ladderUsers", u.uid));
      setLadderXP(ladderSnap.exists() ? ladderSnap.data().xp ?? 0 : 0);

    } finally {
      setLoading(false);
    }
  });

  return unsub;
}, []);


  useEffect(() => {
  const checkSeasonChange = async () => {
    try {
      const current = getCurrentSeasonId();
      const stored = await AsyncStorage.getItem("lastSeenSeasonId");

      if (stored === null) {
        // First launch ever
        await AsyncStorage.setItem("lastSeenSeasonId", String(current));
        return;
      }

      const last = Number(stored);

    if (last !== current) {
  // 🔒 Prevent double archive
  const archived = await AsyncStorage.getItem(`seasonArchived:${last}`);

  if (!archived) {
    try {
      // 1️⃣ Read final season leaderboard

    const q = query(
  collection(db, "seasonUsers"),
 where("seasonId", "==", last),
  orderBy("xp", "desc")
);


      const snap = await getDocs(q);
    
    const rows = snap.docs.map((d, idx) => {
  const data = d.data();
  const xp = data.xp ?? 0;
  const seasonRank = getSeasonRank(xp);
  const outcome = getSeasonOutcome(xp, seasonRank as any);

  return {
    id: d.id,
    ...data,
    rank: idx + 1,
    seasonRank,
    outcome, // "promote" | "stay" | "demote"
  };
});


      // 2️⃣ Archive season snapshot
      await archiveSeason(last, rows);

// 3️⃣ Set season change for current user (promotion / demotion)
const me = rows.find(r => r.uid === user?.uid);

if (me && me.outcome !== "stay") {
  setSeasonChange({
    direction: me.outcome === "promote" ? "up" : "down",
    to: me.seasonRank,
  });
}



      // 4️⃣ Mark archived (idempotent)
      await AsyncStorage.setItem(`seasonArchived:${last}`, "true");
    } catch (e) {
      console.warn("Season archive failed", e);
    }
  }

  await AsyncStorage.setItem("lastSeasonEnded", String(last));
  await AsyncStorage.setItem("lastSeenSeasonId", String(current));
}

    } catch {}
  };

  checkSeasonChange();
}, []);



  useEffect(() => {
    if (!user || tab !== "season") return;

    const run = async () => {
      try {
     const seasonId = getCurrentSeasonId();

const todayId = getTodayId();

const q = query(
  collection(db, "seasonUsers"),
  where("seasonId", "==", seasonId),
  orderBy("xp", "desc")
);

      const snap = await getDocs(q);
const base = snap.docs.map(d => ({ id: d.id, ...d.data() }));
const data = base
  .sort((a: any, b: any) => (b.xp ?? 0) - (a.xp ?? 0))
  .map((r: any, idx: number) => ({
    ...r,
    rank: idx + 1,
  }));


        if (!data.length) {
          setRows([]);
          setPercentileValue(50);
          setMyRank(0);
          return;
        }

        const myIndex = data.findIndex(r => r.uid === user.uid);
        const rank = myIndex + 1;
        const percentile = Math.ceil((rank / data.length) * 100);

        setRows(data);
        setMyRank(rank);
        setPercentileValue(percentile);
        setUserNames(await loadUserNamesFromRows(data, userNames));
      } catch {
        setPercentileValue(50);
        setMyRank(0);
      }
    };

    run();
  }, [user, tab]);
useEffect(() => {
  if (!user || tab !== "daily") return;

  const run = async () => {
    try {
      const today = getTodayId();
    const played = await AsyncStorage.getItem(`dailyPlayed:${user.uid}`);

// ❌ Only block FREE users
if (!isPremium && played === today) {
  setRows([]);
  setDailyStatus("played");
  return;
}

setDailyStatus("idle");


      const q = query(
        collection(db, "leaderboard"),
        where("period", "==", "daily"),
        where("dailyId", "==", today),
        orderBy("errors", "asc"),
        orderBy("time", "asc")
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRows(data);
      setUserNames(await loadUserNamesFromRows(data, userNames));
    } catch {
      setRows([]);
    }
  };

  run();
}, [user, tab]);


useEffect(() => {
  if (!user || tab !== "all") return;

  const run = async () => {
    try {
      const q = query(
        collection(db, "leaderboard"),
        where("period", "==", "season"),
        orderBy("points", "desc")
      );

    const snap = await getDocs(q);
const base = snap.docs.map(d => ({ id: d.id, ...d.data() }));

// ✅ Aggregate: keep BEST run per user
type LeaderboardRow = {
  id: string;
  uid?: string;
  username?: string;
  points?: number;
  [key: string]: any;
};

const bestByUid: Record<string, LeaderboardRow> = {};

for (const row of base as LeaderboardRow[]) {
  const key = row.uid || row.username;
  if (!key) continue;

  const p = typeof row.points === "number" ? row.points : -Infinity;
  const prev = bestByUid[key];
  const prevP = prev && typeof prev.points === "number" ? prev.points : -Infinity;

  if (!prev || p > prevP) bestByUid[key] = row;
}

const data = Object.values(bestByUid)
  .sort((a: any, b: any) => (b.points ?? 0) - (a.points ?? 0))
  .map((r: any, idx: number) => ({ ...r, rank: idx + 1 }));

setRows(data);
setUserNames(await loadUserNamesFromRows(data, userNames));

    } catch {
      setRows([]);
    }
  };

  run();
}, [user, tab]);


  useEffect(() => {
    if (!user) return;

    const run = async () => {
      try {
        const seasonsSnap = await getDocs(collection(db, "seasonArchive"));
        const result: any[] = [];

        for (const seasonDoc of seasonsSnap.docs) {
          const userSnap = await getDoc(
            doc(db, "seasonArchive", seasonDoc.id, "users", user.uid)
          );

          if (userSnap.exists()) {
            const data = userSnap.data();
            result.push({
              season: Number(seasonDoc.id),
              league: data.rank,
              rank: data.rank ?? null,
            });
          }
        }

        result.sort((a, b) => b.season - a.season);
        setSeasonArchive(result);
      } catch {}
    };

    run();
  }, [user]);

  const league = profile?.seasonLeague ?? "Bronze";
  const leagueUI = LEAGUE_UI[league];
  const seasonEndsIn = getSeasonDaysLeftText();

  return (
    <ImageBackground source={require("../assets/bg.png")} style={styles.bg}>
     <LinearGradient colors={[bgDark, bgMid]} style={styles.container}>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Text style={styles.seasonText}>
              Season {getCurrentSeasonId()} • {seasonEndsIn} left
            </Text>

            {!isPremium && (
              <Text style={styles.premiumNote}>
                Premium required to participate • You can still view rankings
              </Text>
            )}

            {seasonChange && (
              <Text style={[styles.seasonChange, { color: leagueUI.color }]}>
                {seasonChange.direction === "up" ? "⬆️ Promoted to " : "⬇️ Demoted to "}
                {seasonChange.to}
              </Text>
            )}

            <View style={[styles.leagueCard, { borderColor: leagueUI.color }]}>
              <Text style={[styles.leagueTitle, { color: leagueUI.color }]}>
                {leagueUI.badge} {league} League
              </Text>
            </View>

            <View style={styles.rankBlock}>
              <Text style={styles.rankText}>{myRank ? `#${myRank}` : "—"}</Text>
              <Text style={styles.percentile}>Top {percentileValue}%</Text>
            </View>

            <Text style={styles.nextStep}>
              {tab === "daily"
                ? "A clean Daily can move you closer to promotion"
                : tab === "season"
                ? "Consistent performance matters over the season"
                : "All-Time ranks never reset"}
            </Text>

            <View style={styles.tabs}>
              {(["daily", "season", "all"] as Tab[]).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  style={[
                    styles.tab,
                    tab === t && (t === "season" ? styles.tabSeason : styles.tabActive),
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      tab === t && (t === "season" ? styles.tabTextDark : styles.tabTextDark),
                    ]}
                  >
                    {t === "daily" ? "Daily" : t === "season" ? "Season" : "All-Time"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
  style={styles.list}
 data={rows}
  keyExtractor={item => item.id}
 ListEmptyComponent={
  tab === "daily" ? (
    <Text style={styles.empty}>
      {dailyStatus === "played"
        ? "You’ve completed today’s Daily. Come back tomorrow."
        : "No daily runs yet. Be the first today."}
    </Text>
  ) : null
}


  renderItem={({ item }) => (
    <View
      style={[
        styles.row,
        item.uid === user?.uid && {
          borderLeftColor: leagueUI.color,
          borderLeftWidth: 3,
          backgroundColor: "rgba(255,215,120,0.04)",
          paddingLeft: 8,
        },
      ]}
    >
      <Text
        style={[
          styles.rowName,
          item.uid === user?.uid && styles.rowNameYou,
        ]}
      >
        #{item.rank}
{getDisplayName(item, user, userNames)}

      </Text>

      {tab === "daily" && (
        <Text style={styles.rowSub}>
          Daily Run

        </Text>
      )}

   {tab === "season" && (
  <Text style={styles.rowSub}>
    {typeof item.xp === "number" ? `${item.xp} XP` : "—"}
  </Text>
)}

{tab === "all" && (
  <Text style={styles.rowSub}>
    {typeof item.points === "number" ? `${item.points} pts` : "—"}
  </Text>
)}


    </View>
  )}
  ListFooterComponent={
    <>
      {/* PAST SEASONS */}
      <View style={styles.archive}>
        <Text style={styles.archiveTitle}>Past Seasons</Text>
        {seasonArchive.map(s => {
          const ui = LEAGUE_UI[s.league];
          return (
            <View key={s.season} style={styles.archiveRow}>
              <Text style={styles.archiveSeason}>Season {s.season}</Text>
              <Text style={[styles.archiveLeague, { color: ui.color }]}>
                {ui.badge} {s.league} • #{s.rank}
              </Text>
            </View>
          );
        })}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
       <Text style={styles.xp}>XP: {ladderXP}</Text>
        <Text style={styles.footerNote}>
          Your progress continues beyond the Ladder
        </Text>
      </View>
    </>
  }
/>

           
          </>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, padding: 16, paddingTop: 66 },

  
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  seasonText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  premiumNote: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.6)",
  },

  seasonChange: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
  },

  leagueCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#18140F",
    borderWidth: 1.5,
  },

  leagueTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  rankBlock: { marginTop: 16 },

  rankText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.45)",
  },

  percentile: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  nextStep: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.55)",
  },

  list: { marginTop: 16 },

  empty: {
    marginTop: 40,
     fontSize: 11,
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
  },

  row: {
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },

  rowName: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "BalooRegular",
    color: "#F5F5F5",
  },

  rowNameYou: {
    fontFamily: "BalooBold",
  },

  rowSub: {
    fontSize: 10,
    lineHeight: 14,
    color: "rgba(255,255,255,0.55)",
  },

  archive: { marginTop: 24 },

  archiveTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 30,
    color: "#F5F5F5",
  },

  archiveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },

  archiveSeason: {
    color: "rgba(255,255,255,0.7)",
  },

  archiveLeague: {
    fontWeight: "600",
  },

  footer: { marginTop: 16 },

  xp: {
    color: "rgba(255,255,255,0.6)",
  },

  footerNote: {
    fontSize: 11,
    lineHeight: 15,
    color: "rgba(255,255,255,0.45)",
  },
  tabs: {
  flexDirection: "row",
  marginTop: 20,
},

tab: {
  marginRight: 10,
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 18,
  backgroundColor: "#2A2A2A",
},

tabActive: {
  backgroundColor: "#E0E0E0",
},

tabSeason: {
  backgroundColor: "#FFD36A",
},

tabText: {
  fontSize: 11,
  fontWeight: "500",
  color: "#FFF",
},

tabTextDark: {
  fontSize: 11,
  fontWeight: "600",
  color: "#000",
},

});
