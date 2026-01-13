import { calculateScore } from "./scoreEngine";

function runEdgeCases() {
  console.log("\n");
  console.log(" EDGE CASES");
  console.log("");

  const tests = [
    { name: "Zero everything", input: { difficulty: "easy", timeSeconds: 9999, hints: 0, undos: 0, restarts: 0, wrongs: 0 } },
    { name: "Max hints + undos", input: { difficulty: "medium", timeSeconds: 500, hints: 100, undos: 50, restarts: 0, wrongs: 0 } },
    { name: "Multiple restarts", input: { difficulty: "hard", timeSeconds: 1000, hints: 0, undos: 0, restarts: 5, wrongs: 0 } },
    { name: "Huge wrong entries", input: { difficulty: "easy", timeSeconds: 200, hints: 0, undos: 0, restarts: 0, wrongs: 999 } },
    { name: "Perfect insane speed", input: { difficulty: "hard", timeSeconds: 60, hints: 0, undos: 0, restarts: 0, wrongs: 0, perfectGame: true, isFastestOfDay: true, brokeRecord: true } },
  ];

  tests.forEach((t) => {
    const score = calculateScore(t.input as any);
    console.log(t.name.padEnd(30, ".") + `: ${score}`);
  });
}

runEdgeCases();

