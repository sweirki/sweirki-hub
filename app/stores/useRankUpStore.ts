import { create } from "zustand";

interface RankUpState {
  visible: boolean;
  oldRank: string | null;
  newRank: string | null;
  showRankUp: (oldRank: string, newRank: string) => void;
  hideRankUp: () => void;
}

export const useRankUpStore = create<RankUpState>((set) => ({
  visible: false,
  oldRank: null,
  newRank: null,

  showRankUp: (oldRank, newRank) =>
    set({
      visible: true,
      oldRank,
      newRank,
    }),

  hideRankUp: () =>
    set({
      visible: false,
      oldRank: null,
      newRank: null,
    }),
}));
