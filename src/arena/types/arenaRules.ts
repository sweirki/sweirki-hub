export type ArenaRuleSet = {
  id: string;
  name: string;
  description: string;

  difficulty: "easy" | "medium" | "hard" | "expert";

  maxErrors: number;
  allowHints: false;
  allowUndo: false;

  timeLimitSeconds?: number;
};
