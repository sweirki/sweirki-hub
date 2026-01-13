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

const results = generateRuns(50);
results.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.timeSeconds - b.timeSeconds));

console.log("\n");
console.log(" RANDOM SIMULATION (Top 10 of 50)");
console.log("");

results.slice(0, 10).forEach((r, i) => {
  console.log(
    `#${(i + 1).toString().padEnd(2)} ${r.username.padEnd(8)} ${r.difficulty.padEnd(7)} ${r.timeSeconds.toString().padEnd(5)}s ${r.score.toString().padEnd(4)} pts`
  );
});

