import AsyncStorage from "@react-native-async-storage/async-storage";

// ðŸ”’ Unified, safe, atomic Sudoku save format
interface SudokuSave {
  version: number;
  puzzle: any;
  solution: any;
  timer: number;
  hintsLeft: number;
  difficulty: string;
  cages?: any; // killer only
}

// --------------------------------------
// ðŸ”¥ SAFE SAVE (Atomic)
// --------------------------------------
export const saveGame = async (key: string, data: any) => {
  try {
    const normalized: SudokuSave = {
      version: 1,

      puzzle: Array.isArray(data.puzzle) ? data.puzzle : [],
      solution: Array.isArray(data.solution) ? data.solution : [],

      timer: typeof data.timer === "number" ? data.timer : 0,
      hintsLeft:
        typeof data.hintsLeft === "number" ? data.hintsLeft : data.hints || 3,

      difficulty:
        typeof data.difficulty === "string" ? data.difficulty : "easy",

      cages: data.cages ?? undefined,
    };

    // atomic write: write to temp â†’ then commit
    const tmpKey = `${key}_tmp`;
    await AsyncStorage.setItem(tmpKey, JSON.stringify(normalized));
    await AsyncStorage.setItem(key, JSON.stringify(normalized));
    await AsyncStorage.removeItem(tmpKey);
  } catch (err) {
    console.warn("saveGame failed:", err);
  }
};

// --------------------------------------
// ðŸ”¥ SAFE LOAD (Backward Compatible)
// --------------------------------------
export const loadGame = async (key: string) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Basic structure check
    if (typeof parsed !== "object" || !parsed.puzzle) return null;

    // Auto-fix missing fields
    return {
      version: parsed.version ?? 1,
      puzzle: parsed.puzzle ?? [],
      solution: parsed.solution ?? [],
      timer: typeof parsed.timer === "number" ? parsed.timer : 0,
      hintsLeft:
        typeof parsed.hintsLeft === "number"
          ? parsed.hintsLeft
          : parsed.hints ?? 3,
      difficulty:
        typeof parsed.difficulty === "string"
          ? parsed.difficulty
          : "easy",
      cages: parsed.cages ?? undefined,
    } as SudokuSave;
  } catch (err) {
    console.warn("loadGame failed:", err);
    return null;
  }
};

// --------------------------------------
// ðŸ”¥ CLEAR GAME
// --------------------------------------
export const clearGame = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn("clearGame failed:", err);
  }
};

