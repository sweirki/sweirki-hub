import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebase";

export type GameHistoryEntry = {
  mode: string;
  win: boolean;
  time: number;
  errors: number;
  date: string;
};

function historyKey() {
  const uid = auth.currentUser?.uid || "guest";
  return `gameHistory:${uid}`;
}

export async function saveGameHistory(entry: GameHistoryEntry) {
     console.log("📝 saving history entry", entry);
  try {
    const key = historyKey();
    const raw = await AsyncStorage.getItem(key);
    const history = raw ? JSON.parse(raw) : [];

    history.unshift(entry);
    const trimmed = history.slice(0, 50);

    await AsyncStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("History save failed", e);
  }
}
