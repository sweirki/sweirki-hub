export function getRankTitle(winCount: number): string {
  if (winCount <= 0) return "Unranked";
  if (winCount <= 5) return "Rookie ";
  if (winCount <= 20) return "Solver ";
  if (winCount <= 50) return "Thinker ";
  if (winCount <= 100) return "Strategist ";
  if (winCount <= 200) return "Mastermind ";
  if (winCount <= 500) return "Sudoku Pro ";
  return "Legend ";
}

