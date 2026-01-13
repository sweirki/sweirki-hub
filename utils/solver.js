// utils/solver.js
// Universal Sudoku engine: Classic, X, Hyper, Killer
// Exports:
//   buildRules(opts) -> rules
//   generateSolvedBoard(rules) -> 9x9 numbers
//   maskSolutionToPuzzle(solution, difficulty, rules) -> 9x9 numbers with nulls
//   defaultCluesForDifficulty(difficulty)
//   makeKillerCages(solution) -> { cages: {cells:[[r,c],...], sum}[] }

function rngShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRules(opts = {}) {
  const { variant = "classic", cages = null } = opts;
  const useX = variant === "x" || variant === "hyperx"; // X or Hyper+X in future
  const useHyper = variant === "hyper" || variant === "hyperx";
  return {
    useX,
    useHyper,
    cages, // for killer; array of {cells:[[r,c]...], sum}
    hyperRegions: useHyper
      ? [
          // 4 extra 3x3 regions (top-left/top-right/bottom-left/bottom-right)
          // each region gives cells: [ [r,c], ... ]
          regionCells(1, 1), // rows 1..3, cols 1..3 (0-based offsets)
          regionCells(1, 5),
          regionCells(5, 1),
          regionCells(5, 5),
        ]
      : [],
  };
}

function regionCells(r0, c0) {
  const cells = [];
  for (let r = r0; r < r0 + 3; r++) for (let c = c0; c < c0 + 3; c++) cells.push([r, c]);
  return cells;
}

function isValidClassic(board, r, c, n) {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === n) return false;
    if (board[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[br + i][bc + j] === n) return false;
  return true;
}

function isValidX(board, r, c, n) {
  if (r === c) for (let i = 0; i < 9; i++) if (board[i][i] === n) return false;
  if (r + c === 8) for (let i = 0; i < 9; i++) if (board[i][8 - i] === n) return false;
  return true;
}

function isValidHyper(board, r, c, n, hyperRegions) {
  for (const cells of hyperRegions) {
    let inside = false;
    for (const [rr, cc] of cells) if (rr === r && cc === c) { inside = true; break; }
    if (!inside) continue;
    for (const [rr, cc] of cells) if (board[rr][cc] === n) return false;
  }
  return true;
}

function isValidKiller(board, r, c, n, cages) {
  if (!cages) return true;
  // Find cage containing (r,c)
  const cage = cages.find((cg) => cg.cells.some(([rr, cc]) => rr === r && cc === c));
  if (!cage) return true;
  // uniqueness inside cage + partial sum <= target
  let sum = n;
  const seen = new Set([n]);
  for (const [rr, cc] of cage.cells) {
    if (rr === r && cc === c) continue;
    const v = board[rr][cc];
    if (!v) continue;
    if (seen.has(v)) return false;
    seen.add(v);
    sum += v;
  }
  // If cage fully filled, sum must match exactly
  const filledCount = cage.cells.filter(([rr, cc]) => board[rr][cc]).length + 1;
  if (filledCount === cage.cells.length && sum !== cage.sum) return false;
  // If not full, running sum must not exceed target
  if (filledCount < cage.cells.length && sum >= cage.sum) return false;
  return true;
}

function isValid(board, r, c, n, rules) {
  if (!isValidClassic(board, r, c, n)) return false;
  if (rules.useX && !isValidX(board, r, c, n)) return false;
  if (rules.useHyper && !isValidHyper(board, r, c, n, rules.hyperRegions)) return false;
  if (rules.cages && !isValidKiller(board, r, c, n, rules.cages)) return false;
  return true;
}

function nextEmpty(board) {
  // Simple MRV-ish: pick the first empty; could be improved
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!board[r][c]) return [r, c];
  return null;
}

function cloneBoard(b) {
  return b.map((row) => row.slice());
}

export function generateSolvedBoard(rules = buildRules()) {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function backtrack() {
    const pos = nextEmpty(board);
    if (!pos) return true;
    const [r, c] = pos;
    for (const n of rngShuffle(nums)) {
      if (isValid(board, r, c, n, rules)) {
        board[r][c] = n;
        if (backtrack()) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }

  backtrack();
  return board;
}

export function solveCount(board, rules, limit = 2) {
  let count = 0;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function bt(b) {
    if (count >= limit) return; // early exit
    const pos = nextEmpty(b);
    if (!pos) { count++; return; }
    const [r, c] = pos;
    for (const n of nums) {
      if (isValid(b, r, c, n, rules)) {
        b[r][c] = n;
        bt(b);
        b[r][c] = 0;
        if (count >= limit) return;
      }
    }
  }

  bt(cloneBoard(board));
  return count;
}

export function defaultCluesForDifficulty(diff = "easy") {
  // 🎯 PRO tuned baseline clues (start counts)
  if (diff === "easy") return 40;     // easier games ~38–41 after clamp
  if (diff === "medium") return 28;   // medium ~29–33 after clamp
  return 25;                          // hard ~22–26 after clamp
}


export function maskSolutionToPuzzle(solution, difficulty = "easy", rules = buildRules()) {
  difficulty = (difficulty || "easy").toString().toLowerCase();

  const targetClues = defaultCluesForDifficulty(difficulty);
  const cells = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
  const order = rngShuffle(cells);

  const puzzle = solution.map((row) => row.slice()); // numbers
  let toRemove = 81 - targetClues;

  for (const [r, c] of order) {
    if (toRemove <= 0) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // uniqueness check
    const solutions = solveCount(puzzle, rules, 2);
    if (solutions !== 1) {
      // revert; we need a unique puzzle
      puzzle[r][c] = backup;
    } else {
      toRemove--;
    }
  }
// --- PRO Clamp: keep clues in a small range so difficulty feels stable ---
const finalClues = puzzle.flat().filter(v => v).length;
const target = defaultCluesForDifficulty(difficulty);

// choose safe ranges for each difficulty
let minClues, maxClues;
if (difficulty === "easy")   { minClues = target - 3; maxClues = target + 3; }   // ~35–41
else if (difficulty === "medium") { minClues = target - 3; maxClues = target + 2; } // ~28–33
else { minClues = target - 2; maxClues = target + 2; }                            // ~22–26

if (finalClues > maxClues) {
  // too many clues → hide a few more randomly
  const filled = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (puzzle[r][c]) filled.push([r, c]);

  while (puzzle.flat().filter(v => v).length > maxClues && filled.length) {
    const i = Math.floor(Math.random() * filled.length);
    const [r, c] = filled.splice(i, 1)[0];
    puzzle[r][c] = 0;
  }
}
// 🧩 Debug: log how many clues were left
const count = puzzle.flat().filter(v => v).length;
console.log(`🧩 Generated ${rules.useHyper ? "Hyper" : rules.useX ? "X" : "Classic"} – difficulty: ${difficulty.toUpperCase()} – Clues: ${count}`);

  // Convert 0 -> null for UI
  return puzzle.map((row) => row.map((v) => (v ? v : null)));
}

// ---- Killer cages from a solved grid ----
export function makeKillerCages(solution) {
  // Simple contiguous cage generator (sizes 1..4), sums from solution
  const used = Array.from({ length: 9 }, () => Array(9).fill(false));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const cages = [];

  function inb(r, c) { return r>=0 && r<9 && c>=0 && c<9; }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (used[r][c]) continue;
      const size = Math.min(4, 1 + Math.floor(Math.random() * 4));
      const cells = [[r, c]];
      used[r][c] = true;

      while (cells.length < size) {
        const [br, bc] = cells[Math.floor(Math.random() * cells.length)];
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const nr = br + dr, nc = bc + dc;
        if (inb(nr, nc) && !used[nr][nc]) {
          used[nr][nc] = true;
          cells.push([nr, nc]);
        } else break;
      }

      const sum = cells.reduce((acc, [rr, cc]) => acc + solution[rr][cc], 0);
      cages.push({ cells, sum });
    }
  }
  return { cages };
}
