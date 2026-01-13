import { create } from "zustand";
import type { ArenaRun } from "../types/arenaRun";
import type { ArenaResult } from "../types/arenaResult";
import type { ArenaRuleSet } from "../types/arenaRules";
import { ARENA_ENABLED } from "../config/arenaConfig";

type ArenaState = {
  enabled: false;

  activeRuleSet: ArenaRuleSet | null;
  currentRun: ArenaRun | null;
  lastResult: ArenaResult | null;

  // placeholders (intentionally inert)
  startRun: () => void;
  completeRun: () => void;
  reset: () => void;
};

export const useArenaStore = create<ArenaState>(() => ({
 enabled: ARENA_ENABLED,


  activeRuleSet: null,
  currentRun: null,
  lastResult: null,

  startRun: () => {},
  completeRun: () => {},
  reset: () => {},
}));
