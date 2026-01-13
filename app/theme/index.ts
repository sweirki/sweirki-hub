// /app/theme/index.ts
// MASTER THEME (STAGE 1)
// ---------------------------------------------------
// We only define the STRUCTURE here. No color details yet.

import { LightTheme } from "./colors/light";
import { DarkTheme } from "./colors/dark";
import { BlueTheme } from "./colors/blue";

// Temporary â€” we will update this once all screens are migrated.
let currentTheme: "light" | "dark" | "blue" = "light";

export const setTheme = (mode: "light" | "dark" | "blue") => {
  currentTheme = mode;
};

export const getColors = () => {
  if (currentTheme === "dark") return DarkTheme;
  if (currentTheme === "blue") return BlueTheme;
  return LightTheme;
};

