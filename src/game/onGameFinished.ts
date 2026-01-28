import { saveGameHistory } from "../history/saveGameHistory";
import { GameResult } from "./gameResult";



  export async function onGameFinished(result: GameResult) {
  console.log("🔥 onGameFinished called", result);

  // 1️⃣ Save to History (player memory)
  await saveGameHistory({
    mode: result.mode,
    win: result.win,
    time: result.time,
    errors: result.errors,
    date: new Date().toISOString(),
  });

  // 2️⃣ Future-proof:
  // achievements
  // stats
  // cloud sync
  // notifications
}
