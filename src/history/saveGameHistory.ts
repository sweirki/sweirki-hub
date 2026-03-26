import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export type GameHistoryEntry = {
  mode: string;
  win: boolean;
  time: number;
  errors: number;
  hintsUsed?: number;
};

export async function saveGameHistory(
  entry: GameHistoryEntry
) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ saveGameHistory: no authenticated user");
      return;
    }

    const gamesRef = collection(
      db,
      "users",
      user.uid,
      "games"
    );

    await addDoc(gamesRef, {
      ...entry,
      createdAt: serverTimestamp(),
    });

    console.log("📝 History saved to Firestore");
  } catch (err) {
    console.warn("⚠️ History save failed:", err);
  }
}
