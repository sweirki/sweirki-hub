import { calculateScore, Difficulty } from "./scoreEngine";

interface PlayerRun {
  username: string;
  difficulty: Difficulty;
  timeSeconds: number;
  hints: number;
  undos: number;
  restarts: number;
  wrongs: number;
  day: string;
}

const runs: PlayerRun[] = [
  { username: "Sara", difficulty: "hard", timeSeconds: 700, hints: 0, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-15" },
  { username: "Omar", difficulty: "medium", timeSeconds: 600, hints: 1, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-15" },
  { username: "Sara", difficulty: "hard", timeSeconds: 680, hints: 0, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-16" },
  { username: "Lina", difficulty: "easy", timeSeconds: 200, hints: 0, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-16" },
  { username: "Omar", difficulty: "medium", timeSeconds: 800, hints: 0, undos: 0, restarts: 0, wrongs: 0, day: "2025-09-17" },
];

const grouped: Record<string, PlayerRun[]> = {};
runs.forEach(r => {
  if (!grouped[r.day]) grouped[r.day] = [];
  grouped[r.day].push(r);
});

console.log("\n");
console.log(" DAILY RESET SIMULATION");
console.log("");

Object.keys(grouped).forEach(day => {
  const results = grouped[day].map(r => ({ ...r, score: calculateScore(r) }));
  results.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.timeSeconds - b.timeSeconds));

  console.log(`\nDay ${day}`);
  results.forEach((r, i) => {
    console.log(`#${i + 1} ${r.username.padEnd(8)} ${r.difficulty.padEnd(7)} ${r.timeSeconds}s ${r.score} pts`);
  });
});

