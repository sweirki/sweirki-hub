// utils/puzzleFactory.js
// Unified puzzle generator using solver.js for Classic / Killer / Hyper / X Sudoku.
// Final DeepClone Edition — November 2025

import {
  buildRules,
  generateSolvedBoard,
  maskSolutionToPuzzle,
  makeKillerCages,
} from "./solver";

// variant = "classic" | "killer" | "hyper" | "x"
// difficulty = "easy" | "medium" | "hard"
export function makePuzzle(variant = "classic", difficulty = "easy") {
  let rules, solution, puzzle, cages;

  // 1️⃣ Killer Sudoku (special case)
  if (variant === "killer") {
    solution = generateSolvedBoard(buildRules());
    const cageData = makeKillerCages(solution);
    cages = cageData.cages;
    rules = buildRules({ variant: "killer", cages });
    puzzle = maskSolutionToPuzzle(solution, difficulty, rules);
  }

  // 2️⃣ X Sudoku
  else if (variant === "x") {
    rules = buildRules({ variant: "x" });
    solution = generateSolvedBoard(rules);
    puzzle = maskSolutionToPuzzle(solution, difficulty, rules);
  }

  // 3️⃣ Hyper Sudoku
  else if (variant === "hyper") {
    rules = buildRules({ variant: "hyper" });
    solution = generateSolvedBoard(rules);
    puzzle = maskSolutionToPuzzle(solution, difficulty, rules);
  }

  // 4️⃣ Classic Sudoku (default)
  else {
    rules = buildRules({ variant: "classic" });
    solution = generateSolvedBoard(rules);
    puzzle = maskSolutionToPuzzle(solution, difficulty, rules);
  }

  // 🧩 Wrap numeric arrays for React UI
  const puzzleObjects = puzzle.map((row, r) =>
    row.map((val, c) => ({
      value: val,
      solution: Number(solution[r][c]),
      prefilled: val !== null,
    }))
  );

  // 🧩 Full deep clone to ensure zero shared references
  const deepPuzzle = JSON.parse(JSON.stringify(puzzleObjects));
  const deepSolution = JSON.parse(JSON.stringify(solution));

  console.log("🧩 makePuzzle:", variant, "rows:", deepPuzzle.length);

  return { puzzle: deepPuzzle, solution: deepSolution, cages };
}
