import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";
import { getLadderRank, getSeasonRank } from "../utils/ladder/scoreEngine";
import { useAchievementsStore } from "../app/stores/useAchievementsStore";

type Progression = {
  ladder: { xp: number; rank: string };
  season: { xp: number; rank: string; seasonId: string | null };
  achievements: { level: number; xp: number; nextLevelXp: number };
  daily: { completedToday: boolean; todayKey: string };
};

export function useProgression(): Progression | null {
  const [data, setData] = useState<Progression | null>(null);
  const ach = useAchievementsStore();

  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // ✅ Daily status (Phase 5C source of truth)
      const todayKey = new Date().toISOString().split("T")[0];
      const played = await AsyncStorage.getItem("dailyPlayed");
      const completedToday = played === todayKey;

      // ✅ Ladder XP
    const ladderSnap = await getDoc(doc(db, "ladderUsers", user.uid));
const hasLadderData = ladderSnap.exists();
const ladderXp = hasLadderData ? (ladderSnap.data().xp ?? 0) : 0;
const ladderRank = hasLadderData ? getLadderRank(ladderXp) : "Unranked";

      // ✅ Season id (matches your profile.tsx pattern)
      const metaSnap = await getDoc(doc(db, "seasonMeta", "current"));
      const seasonId = metaSnap.exists() ? (metaSnap.data().season ?? null) : null;

      let seasonXp = 0;
      if (seasonId) {
        const seasonSnap = await getDoc(doc(db, "seasonUsers", `${seasonId}_${user.uid}`));
        seasonXp = seasonSnap.exists() ? (seasonSnap.data().xp ?? 0) : 0;
      }
      const seasonRank = getSeasonRank(seasonXp);

      setData({
        ladder: { xp: ladderXp, rank: ladderRank },
        season: { xp: seasonXp, rank: seasonRank, seasonId },
        achievements: {
          level: ach.level ?? 1,
          xp: ach.xp ?? 0,
          nextLevelXp: ach.nextLevelXp ?? 0,
        },
        daily: { completedToday, todayKey },
      });
    };

    run();
 }, [ach.level ?? 1, ach.xp ?? 0, ach.nextLevelXp ?? 0]);

  return data;
}
