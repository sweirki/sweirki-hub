import { calculateScore, Difficulty } from "./scoreEngine";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const players = ["Sara", "Omar", "Lina", "Yusef", "Hana", "Ali", "Maya", "Samir", "Nour", "Zara"];
const difficulties: Difficulty[] = ["easy", "medium", "hard"];

interface SimRun {
  username: string;
  difficulty: Difficulty;
  timeSeconds: number;
  hints: number;
  undos: number;
  restarts: number;
  wrongs: number;
  score: number;
}

function generateRuns(count: number): SimRun[] {
  const runs: SimRun[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[randomInt(0, difficulties.length - 1)];
    const run = {
      username: players[randomInt(0, players.length - 1)],
      difficulty,
      timeSeconds: randomInt(100, 1500),
      hints: randomInt(0, 5),
      undos: randomInt(0, 5),
      restarts: randomInt(0, 2),
      wrongs: randomInt(0, 20),
      score: 0,
    };
    run.score = calculateScore(run);
    runs.push(run);
  }
  return runs;
}

const results = generateRuns(100);
const grouped: Record<Difficulty, SimRun[]> = { easy: [], medium: [], hard: [] };
results.forEach((r) => grouped[r.difficulty].push(r));

console.log("\n");
console.log(" TOURNAMENT WINNERS");
console.log("");

function printWinners(diff: Difficulty) {
  const sorted = grouped[diff].sort((a, b) => (b.score !== a.score ? b.score - a.score : a.timeSeconds - b.timeSeconds));
  console.log(`\n${diff.toUpperCase()} Winners`);
  sorted.slice(0, 3).forEach((r, i) => {
    console.log(
      `#${(i + 1).toString().padEnd(2)} ${r.username.padEnd(8)} ${r.score.toString().padEnd(4)} pts ${r.timeSeconds.toString().padEnd(5)}s (h:${r.hints}, u:${r.undos}, r:${r.restarts}, w:${r.wrongs})`
    );
  });
}

printWinners("easy");
printWinners("medium");
printWinners("hard");

console.log("\n Tournament simulation complete.");

