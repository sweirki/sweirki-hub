export type GameResult = {
  mode: "classic" | "daily" | "hyper" | "x" | "killer";
  win: boolean;
  time: number;     // seconds
  errors: number;
};
