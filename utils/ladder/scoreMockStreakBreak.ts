import { STREAK_BONUS } from "./scoreConfig";

interface StreakRun {
  username: string;
  day: number;
  baseScore: number | null; // null = missed day
}

const runs: StreakRun[] = [
  { username: "Sara", day: 1, baseScore: 200 },
  { username: "Sara", day: 2, baseScore: 210 },
  { username: "Sara", day: 3, baseScore: null },  // missed a day
  { username: "Sara", day: 4, baseScore: 230 },
  { username: "Sara", day: 5, baseScore: 240 },
];

console.log("\n");
console.log(" STREAK BREAK SIMULATION");
console.log("");

let streak = 0;
runs.forEach(run => {
  if (run.baseScore === null) {
    console.log(`Day ${run.day}  Missed game! Streak reset to 0`);
    streak = 0;
  } else {
    streak++;
    let bonus = STREAK_BONUS[streak] || 0;
    const finalScore = run.baseScore + bonus;
    console.log(`Day ${run.day}  Base: ${run.baseScore}, Streak: ${streak}, Bonus: ${bonus}, Final: ${finalScore}`);
  }
});

