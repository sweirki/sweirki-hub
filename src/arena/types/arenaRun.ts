import { ArenaRuleSet } from "./arenaRules";

export type ArenaRun = {
  runId: string;
  startedAt: number;
  completedAt: number;

  ruleSetId: ArenaRuleSet["id"];

  completed: boolean;
  aborted: boolean;
  invalidated: boolean;
};
