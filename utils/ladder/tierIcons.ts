// GLOBAL tier → icon mapping

export const TIER_ICONS: Record<string, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💠",
  Diamond: "💎",
  Master: "🔥",
  Grandmaster: "👑",
  Legend: "👑", // optional top tier alias
};

// Convert XP to tier (UNIFIED for entire app)
export function getTierFromXP(xp: number): string {
  if (xp >= 100000) return "Grandmaster";
  if (xp >= 50000) return "Master";
  if (xp >= 25000) return "Diamond";
  if (xp >= 12000) return "Platinum";
  if (xp >= 5000)  return "Gold";
  if (xp >= 2000)  return "Silver";
  return "Bronze";
}
