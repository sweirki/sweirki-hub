import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { useSeasonRewardsStore } from "../../app/stores/useSeasonRewardsStore";
import { useRankUpStore } from "../../app/stores/useRankUpStore";
import { safeFirestoreCall } from "../../src/utils/firestoreSafe";

// ⭐ ARCHIVE STRUCTURE:
// seasonArchive/<season>/leaderboard
// seasonArchive/<season>/users

export async function checkSeasonReset() {
  try {
    const seasonRef = doc(db, "seasonMeta", "current");

    const snap = await safeFirestoreCall(
      () => getDoc(seasonRef),
      null
    );

    if (!snap || !snap.exists()) return;

    const { season, endsAt } = snap.data();
    const now = Date.now();

    // NOT time yet → do nothing
    if (now < endsAt) return;

    // ⭐ TIME TO RESET → perform full season archive
    await archiveSeason(season);
    await startNewSeason(season + 1);
  } catch (err) {
    console.log("🔥 Season reset check failed:", err);
  }
}

async function archiveSeason(season: number) {
  try {
    // ⭐ COPY seasonLeaderboard to archive
    const lbRef = collection(db, "seasonLeaderboard");

    const lbSnap = await safeFirestoreCall(
      () => getDocs(lbRef),
      null
    );

    if (!lbSnap) return;

    const archiveLB = collection(db, "seasonArchive", `${season}`, "leaderboard");

    for (const d of lbSnap.docs) {
      const data = d.data();
      if (data.season === season) {
        await setDoc(doc(archiveLB, d.id), data);
      }
    }

    // ⭐ COPY seasonUsers to archive
    const usersRef = collection(db, "seasonUsers");

    const usersSnap = await safeFirestoreCall(
      () => getDocs(usersRef),
      null
    );

    if (!usersSnap) return;

    const archiveUsers = collection(db, "seasonArchive", `${season}`, "users");

    for (const d of usersSnap.docs) {
      const data = d.data();
      if (data.season === season) {
        await setDoc(doc(archiveUsers, d.id), data);
      }
    }

    console.log(`📦 Season ${season} archived`);
  } catch (err) {
    console.log("❌ Archiving error:", err);
  }
}

async function startNewSeason(season: number) {
  try {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // ⭐ Create new season meta
    await setDoc(doc(db, "seasonMeta", "current"), {
      season,
      endsAt: Date.now() + thirtyDays, // next 30 days
    });

    // ⭐ Clear seasonal collections
    console.log("🧹 Clearing season leaderboard…");
    // (Firestore has no collection delete; we simply ignore old docs and write new ones.)

    // ⭐ Reset rewards store
    useSeasonRewardsStore.getState().resetSeasonRewards();

    // ⭐ Optional: Trigger popup in app
    try {
      const { showRankUp } = useRankUpStore.getState();
      showRankUp("Season End", `Season ${season} Started`);
    } catch {}

    console.log(`🌟 New season ${season} started`);
  } catch (err) {
    console.log("❌ Season start error:", err);
  }
}
