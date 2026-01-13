import { calculateScore, Difficulty } from "./scoreEngine";

interface PlayerRun {
  username: string;
  difficulty: Difficulty;
  timeSeconds: number;
  hints: number;
  undos: number;
  restarts: number;
  wrongs: number;
  perfectGame?: boolean;
}

const runs: PlayerRun[] = [
  { username: "Sara", difficulty: "hard", timeSeconds: 680, hints: 0, undos: 0, restarts: 0, wrongs: 0, perfectGame: true },
  { username: "Omar", difficulty: "medium", timeSeconds: 820, hints: 2, undos: 1, restarts: 0, wrongs: 0 },
  { username: "Lina", difficulty: "hard", timeSeconds: 1000, hints: 1, undos: 0, restarts: 0, wrongs: 1 },
  { username: "Yusef", difficulty: "easy", timeSeconds: 250, hints: 0, undos: 0, restarts: 0, wrongs: 0 },
];

const results = runs.map((r) => ({ ...r, score: calculateScore(r) }));
results.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.timeSeconds - b.timeSeconds));

console.log("\n");
console.log(" DAILY LEADERBOARD (Mock)");
console.log("");
results.forEach((r, i) => {
  console.log(
    `#${(i + 1).toString().padEnd(2)} ${r.username.padEnd(8)} ${r.difficulty.padEnd(7)} ${r.timeSeconds.toString().padEnd(5)}s ${r.score.toString().padEnd(4)} pts`
  );
});

