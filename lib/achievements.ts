import AsyncStorage from "@react-native-async-storage/async-storage";

export async function unlockAchievements(email: string, stats: any) {
  let list: string[] = [];
  const key = `achievements:${email}`;

  const stored = await AsyncStorage.getItem(key);
  if (stored) list = JSON.parse(stored);

  // Conditions
  if (stats.completed >= 1 && !list.includes("")) list.push(""); // First Victory
  if (stats.bestTime && stats.bestTime < 300 && !list.includes("")) list.push(""); // Speedster <5min
  if (stats.completed > 0 && stats.hints === 0 && !list.includes("")) list.push(""); // No Hints Win
  if (stats.completed >= 3 && !list.includes("")) list.push(""); // Streak Master (3 wins in a row, simplified)

  await AsyncStorage.setItem(key, JSON.stringify(list));
  return list;
}

export async function getAchievements(email: string) {
  const key = `achievements:${email}`;
  const stored = await AsyncStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

