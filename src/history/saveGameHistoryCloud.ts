import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type GameHistoryEntry = {
  mode: string;
  win: boolean;
  time: number;
  errors: number;
  date: string;
};

export async function saveGameHistoryCloud(entry: GameHistoryEntry) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    const historyRef = collection(db, "users", uid, "history");

    await addDoc(historyRef, {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Cloud history save failed", e);
  }
}
