import { calculateScore } from "./scoreEngine";

function runTests() {
  console.log("\n");
  console.log(" SCORE ENGINE SANITY TESTS");
  console.log("");

  const tests = [
    { name: "Easy perfect fast game", input: { difficulty: "easy", timeSeconds: 200, hints: 0, undos: 0, restarts: 0, wrongs: 0, perfectGame: true } },
    { name: "Medium with 2 hints + 1 undo", input: { difficulty: "medium", timeSeconds: 800, hints: 2, undos: 1, restarts: 0, wrongs: 0 } },
    { name: "Hard restarted once", input: { difficulty: "hard", timeSeconds: 900, hints: 0, undos: 0, restarts: 1, wrongs: 0 } },
    { name: "Hard fastest + record breaker", input: { difficulty: "hard", timeSeconds: 600, hints: 0, undos: 0, restarts: 0, wrongs: 0, isFastestOfDay: true, brokeRecord: true } },
  ];

  tests.forEach((t) => {
    const score = calculateScore(t.input as any);
    console.log(t.name.padEnd(35, ".") + `: ${score}`);
  });
}

runTests();

