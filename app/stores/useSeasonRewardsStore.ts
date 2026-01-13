import { create } from "zustand";

export interface SeasonReward {
  id: string;
  xpRequired: number;
  type: "crate" | "coins" | "badge" | "booster";
  amount?: number;
  claimed: boolean;
}

interface SeasonRewardsState {
  rewards: SeasonReward[];
  unclaimed: SeasonReward[];
  addXP: (xp: number) => void;
  markClaimed: (id: string) => void;
  resetSeasonRewards: () => void;
}

export const useSeasonRewardsStore = create<SeasonRewardsState>((set, get) => ({
  // ⭐ Default milestone rewards
  rewards: [
    { id: "reward_100", xpRequired: 100, type: "crate", claimed: false },
    { id: "reward_500", xpRequired: 500, type: "coins", amount: 200, claimed: false },
    { id: "reward_1000", xpRequired: 1000, type: "crate", claimed: false },
    { id: "reward_2500", xpRequired: 2500, type: "booster", amount: 1, claimed: false },
    { id: "reward_5000", xpRequired: 5000, type: "badge", claimed: false },
  ],

  unclaimed: [],

  // ⭐ Add XP and auto-unlock rewards
  addXP: (xp: number) => {
    const { rewards } = get();
    const newlyUnlocked = rewards.filter(
      (r) => xp >= r.xpRequired && !r.claimed
    );

    set({ unclaimed: newlyUnlocked });
  },

  // ⭐ Mark reward as claimed
  markClaimed: (id: string) => {
    set((state) => ({
      rewards: state.rewards.map((r) =>
        r.id === id ? { ...r, claimed: true } : r
      ),
      unclaimed: state.unclaimed.filter((r) => r.id !== id),
    }));
  },

  // ⭐ When new season starts
  resetSeasonRewards: () =>
    set({
      rewards: [
        { id: "reward_100", xpRequired: 100, type: "crate", claimed: false },
        { id: "reward_500", xpRequired: 500, type: "coins", amount: 200, claimed: false },
        { id: "reward_1000", xpRequired: 1000, type: "crate", claimed: false },
        { id: "reward_2500", xpRequired: 2500, type: "booster", amount: 1, claimed: false },
        { id: "reward_5000", xpRequired: 5000, type: "badge", claimed: false },
      ],
      unclaimed: [],
    }),
}));
