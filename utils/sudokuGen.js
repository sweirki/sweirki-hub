// ==================== sudokuGen.js ====================
// Full generator and validator suite for Classic + Killer Sudoku
// Includes: pattern, shuffle, generateFullBoard, generateSudoku,
// generateKillerCages, validateCages, generateKillerSudoku, validateKillerSudoku

// ---------- Base Sudoku Utilities ----------
export function pattern(r, c) {
  return (3 * (r % 3) + Math.floor(r / 3) + c) % 9;
}

export function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- Full 9x9 Sudoku Solution ----------
export function generateFullBoard() {
  const rows = shuffle([0, 1, 2])
    .concat(shuffle([3, 4, 5]))
    .concat(shuffle([6, 7, 8]));
  const cols = shuffle([0, 1, 2])
    .concat(shuffle([3, 4, 5]))
    .concat(shuffle([6, 7, 8]));
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const board = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => nums[pattern(rows[r], cols[c])])
  );
  return board;
}

// ---------- Puzzle Generator (Classic Sudoku) ----------
export function generateSudoku(difficulty = "easy") {
  const solution = generateFullBoard();

  let blanks;
  if (difficulty === "easy") blanks = 35;
  else if (difficulty === "medium") blanks = 45;
  else blanks = 55;

  const puzzle = solution.map((row) => row.slice());

  let removed = 0;
  while (removed < blanks) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== null) {
      puzzle[r][c] = null;
      removed++;
    }
  }

  return puzzle.map((row, r) =>
    row.map((cell, c) => {
      if (cell === null) {
        return { solution: solution[r][c], value: null, prefilled: false };
      } else {
        return { solution: solution[r][c], value: cell, prefilled: true };
      }
    })
  );
}

// =======================================================
//                    KILLER SUDOKU
// =======================================================

// ---------- Cage Generator ----------
// ---------- Premium Killer Cage Generator (4–5 cell snakes) ----------
export function generateKillerCages(solution) {
  const cages = [];
  const used = new Set();

  // Directions for snake growth
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  // Helper: get all unused neighbors of all cells in a cage
  function getFrontier(cage) {
    const frontier = [];
    for (const [r, c] of cage) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const key = `${nr}-${nc}`;
        if (
          nr >= 0 &&
          nr < 9 &&
          nc >= 0 &&
          nc < 9 &&
          !used.has(key)
        ) {
          frontier.push([nr, nc]);
        }
      }
    }
    return frontier;
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const startKey = `${r}-${c}`;
      if (used.has(startKey)) continue;

      // B-profile cage sizes: mostly 4–5, sometimes 3, rare 2
      const rand = Math.random();
      let size =
        rand < 0.10 ? 2 :        // 10% → 2-cell cages (rare)
        rand < 0.45 ? 3 :        // 35% → 3-cell cages
        rand < 0.80 ? 4 :        // 35% → 4-cell cages (common)
        5;                       // 20% → 5-cell cages (larger snakes)

      const cage = [[r, c]];
      used.add(startKey);

      let attempts = 0;
      while (cage.length < size && attempts < 40) {
        attempts++;

        // Get available neighbors for snake growth
        const frontier = getFrontier(cage);
        if (!frontier.length) break;

        // Pick a random neighbor to extend the snake
        const [nr, nc] = frontier[Math.floor(Math.random() * frontier.length)];
        const key = `${nr}-${nc}`;
        used.add(key);
        cage.push([nr, nc]);
      }

      // If cage failed to grow enough, recycle and re-do
      if (cage.length < 2) {
        for (const [rr, cc] of cage) {
          used.delete(`${rr}-${cc}`);
        }
        continue;
      }

      // Compute cage sum
      const sum = cage.reduce((acc, [rr, cc]) => acc + solution[rr][cc], 0);

      cages.push({
        id: `c${cages.length}`,
        cells: cage,
        sum,
      });
    }
  }

  return cages;
}


// ---------- Cage Validation ----------
export function validateCages(puzzle, cages) {
  const errors = [];

  for (const cage of cages) {
    const values = cage.cells.map(([r, c]) => puzzle[r][c]?.value || null);
    const filledValues = values.filter((v) => v !== null);

    const sum = filledValues.reduce((a, b) => a + b, 0);
    const hasDuplicate = new Set(filledValues).size !== filledValues.length;

    // Fully filled cage
    if (filledValues.length === cage.cells.length) {
      if (sum !== cage.sum || hasDuplicate) {
        errors.push({
          cage,
          reason: hasDuplicate
            ? "Duplicate numbers"
            : `Sum mismatch (got ${sum}, need ${cage.sum})`,
        });
      }
    } else {
      // Partial cage: warn if sum already exceeds target
      if (sum > cage.sum) {
        errors.push({
          cage,
          reason: `Partial sum ${sum} exceeds ${cage.sum}`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------- Killer Sudoku Wrapper Generator ----------
export function generateKillerSudoku(difficulty = "easy") {
  const basePuzzle = generateSudoku(difficulty); // generate standard Sudoku
  const solution = basePuzzle.map((row) => row.map((cell) => cell.solution));
  const cages = generateKillerCages(solution); // attach cage data
  return {
    board: basePuzzle,
    solution,
    cages,
  };
}

// ---------- Killer Sudoku Wrapper Validator ----------
export function validateKillerSudoku(board, cages) {
  const { valid } = validateCages(board, cages);
  return valid;
}