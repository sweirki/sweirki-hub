import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist } from "zustand/middleware";

interface SoundState {
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      soundEnabled: false, // DEFAULT OFF
      setSoundEnabled: (value) => set({ soundEnabled: value }),
    }),
    {
      name: "sound-settings",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);
