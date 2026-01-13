import { scoreConfig } from "./scoreConfig";

interface ScoreInput {
  difficulty: "easy" | "medium" | "hard";
  time: number;
  hints: number;
  undos: number;
  streak?: number;
}

export function calculateScore(input: ScoreInput): number {
  const { difficulty, time, hints, undos, streak = 0 } = input;
  const base = scoreConfig.basePoints[difficulty];
  const timeBonus = Math.max(0, Math.floor((1000 - time) * scoreConfig.timeBonusFactor));
  const penalties = hints * scoreConfig.hintPenalty + undos * scoreConfig.undoPenalty;
  const streakBonus = streak * scoreConfig.streakBonus;

  return Math.max(0, base + timeBonus - penalties + streakBonus);
}

