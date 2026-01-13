// /app/theme/types/sudokuTokens.ts

export interface SudokuTokens {
  // Board backgrounds
  cellBackground: string;
  altCellBackground: string;
  highlightCell: string;
  contextHighlight: string;

  // Borders
  cellBorder: string;
  strongBorder: string;

  // Numbers
  givenNumber: string;
  enteredNumber: string;
  wrongNumber: string;
  pencilNumber: string;

  // Wrong cell background
  wrongBackground: string;

  // Selection
  selectionBorder: string;
  selectionBackground: string;

  // Timer / accents
  timerText: string;

  // Premium gold accents
  gold: string;
  goldLight: string;
}

