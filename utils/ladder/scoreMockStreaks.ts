import { calculateScore } from "./scoreEngine";
import { STREAK_BONUS } from "./scoreConfig";

interface StreakRun {
  username: string;
  day: number;
  baseScore: number;
}

const runs: StreakRun[] = [
  { username: "Sara", day: 1, baseScore: 200 },
  { username: "Sara", day: 2, baseScore: 210 },
  { username: "Sara", day: 3, baseScore: 220 },
  { username: "Sara", day: 4, baseScore: 230 },
  { username: "Sara", day: 5, baseScore: 240 },
];

console.log("\n");
console.log(" STREAK SIMULATION");
console.log("");

let streak = 0;
runs.forEach(run => {
  streak++;
  let bonus = 0;
  if (STREAK_BONUS[streak]) bonus = STREAK_BONUS[streak];
  const finalScore = run.baseScore + bonus;
  console.log(`Day ${run.day}  Base: ${run.baseScore}, Streak: ${streak}, Bonus: ${bonus}, Final: ${finalScore}`);
});

