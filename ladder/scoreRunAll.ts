import { calculateScore } from "./scoreEngine";

export function runLadder() {
  console.log("=======================================");
  console.log(" LADDER TEST SUITE START ");
  console.log("=======================================");

  console.log("\\n EASY PERFECT GAME:", calculateScore({ difficulty: "easy", time: 200, hints: 0, undos: 0 }));
  console.log(" MEDIUM WITH HINTS:", calculateScore({ difficulty: "medium", time: 300, hints: 2, undos: 1 }));
  console.log(" HARD STREAK BONUS:", calculateScore({ difficulty: "hard", time: 500, hints: 0, undos: 0, streak: 3 }));

  console.log("\\n=======================================");
  console.log(" LADDER TEST SUITE END ");
  console.log("=======================================");
}

runLadder();

