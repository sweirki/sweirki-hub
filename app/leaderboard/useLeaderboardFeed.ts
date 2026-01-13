// useLeaderboardFeed.ts
// PHASE 4 — LEADERBOARD TRUST CORE (READ-ONLY)

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  FirestoreError,
} from "firebase/firestore";
import { db } from "../../firebase";

import {
  LeaderboardRow,
  RawLeaderboardRow,
} from "./leaderboard.types";
import { normalizeLeaderboard } from "./leaderboard.normalize";

export type LeaderboardMode =
  | "daily"
  | "weekly"
  | "global"
  | "season"
  | "friends"
  | "local";

interface UseLeaderboardFeedResult {
  rows: LeaderboardRow[];
  loading: boolean;
  error: FirestoreError | null;
  userRank: number | null;
}

/**
 * READ-ONLY leaderboard feed hook.
 * This hook NEVER writes to Firestore.
 */
export function useLeaderboardFeed(
  mode: LeaderboardMode,
  options?: {
    uid?: string;
    date?: string;
    season?: number;
    friendUIDs?: string[];
  }
): UseLeaderboardFeedResult {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let q: any;

    try {
      switch (mode) {
        case "daily": {
          if (!options?.date) {
            throw new Error("Daily leaderboard requires date");
          }

          q = query(
            collection(db, "dailyLeaderboard"),
            where("date", "==", options.date),
            orderBy("score", "desc")
          );
          break;
        }

        case "weekly": {
          q = query(
            collection(db, "weeklyLeaderboard"),
            orderBy("score", "desc")
          );
          break;
        }

        case "global": {
          q = query(
            collection(db, "globalLeaderboard"),
            orderBy("score", "desc")
          );
          break;
        }

        case "season": {
          if (typeof options?.season !== "number") {
            throw new Error("Season leaderboard requires season number");
          }

          q = query(
            collection(db, "seasonLeaderboard"),
            where("season", "==", options.season),
            orderBy("score", "desc")
          );
          break;
        }

        case "friends": {
          if (!options?.friendUIDs || options.friendUIDs.length === 0) {
            setRows([]);
            setUserRank(null);
            setLoading(false);
            return;
          }

          q = query(
            collection(db, "weeklyLeaderboard"),
            where("uid", "in", options.friendUIDs),
            orderBy("score", "desc")
          );
          break;
        }

        case "local": {
          // Local leaderboard is NOT Firestore-based
          // It should be injected manually later
          setRows([]);
          setUserRank(null);
          setLoading(false);
          return;
        }

        default:
          throw new Error("Unknown leaderboard mode");
      }
    } catch (err) {
      setError(err as FirestoreError);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const raw: RawLeaderboardRow[] = snap.docs.map(
          (d) => d.data() as RawLeaderboardRow
        );

        const normalized = normalizeLeaderboard(raw);

        setRows(normalized);

        if (options?.uid) {
          const index = normalized.findIndex(
            (r) => r.uid === options.uid
          );
          setUserRank(index !== -1 ? index + 1 : null);
        } else {
          setUserRank(null);
        }

        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [
    mode,
    options?.uid,
    options?.date,
    options?.season,
    JSON.stringify(options?.friendUIDs),
  ]);

  return {
    rows,
    loading,
    error,
    userRank,
  };
}
