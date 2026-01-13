// utils/premiumManager.ts
// Handles Premium (ad-free) toggle state with AsyncStorage

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "adFree";

export async function setAdFree(value: boolean) {
  try {
    await AsyncStorage.setItem(KEY, value ? "1" : "0");
  } catch (err) {
    console.error("setAdFree error:", err);
  }
}

export async function isAdFree(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === "1";
  } catch (err) {
    console.error("isAdFree error:", err);
    return false;
  }
}

