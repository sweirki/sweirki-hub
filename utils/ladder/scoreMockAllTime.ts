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
  day: string;
}

const runs: PlayerRun[] = [
  { username: "Sara", difficulty: "hard", timeSeconds: 650, hints: 0, undos: 0, restarts: 0, wrongs: 0, perfectGame: true, day: "2025-09-15" },
  { username: "Omar", difficulty: "medium", timeSeconds: 800, hints: 1, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-15" },
  { username: "Lina", difficulty: "hard", timeSeconds: 1100, hints: 2, undos: 1, restarts: 0, wrongs: 1, day: "2025-09-15" },
  { username: "Sara", difficulty: "medium", timeSeconds: 700, hints: 0, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-16" },
  { username: "Yusef", difficulty: "easy", timeSeconds: 260, hints: 0, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-16" },
  { username: "Omar", difficulty: "hard", timeSeconds: 1000, hints: 1, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-17" },
];

const results = runs.map((r) => ({ ...r, score: calculateScore(r) }));
const totals: Record<string, number> = {};
results.forEach((r) => (totals[r.username] = (totals[r.username] || 0) + r.score));

function getRank(points: number): string {
  if (points >= 35000) return "Grandmaster";
  if (points >= 20000) return "Master";
  if (points >= 10000) return "Diamond";
  if (points >= 5000) return "Platinum";
  if (points >= 2500) return "Gold";
  if (points >= 1000) return "Silver";
  return "Bronze";
}

const ladder = Object.entries(totals)
  .map(([username, pts]) => ({ username, pts, rank: getRank(pts) }))
  .sort((a, b) => b.pts - a.pts);

console.log("\n");
console.log(" ALL-TIME LADDER (Mock)");
console.log("");
ladder.forEach((p, i) => {
  console.log(
    `#${(i + 1).toString().padEnd(2)} ${p.username.padEnd(8)} ${p.pts.toString().padEnd(5)} pts ${p.rank}`
  );
});

