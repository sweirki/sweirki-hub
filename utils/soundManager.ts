// utils/soundManager.ts

import { Audio } from "expo-av";

type SoundKey = "error" | "win";
// preload & cache
const soundCache: Record<SoundKey, Audio.Sound | null> = {
  error: null,
  win: null,
};

// file paths (adjust if your asset folder differs)
const sources: Record<SoundKey, any> = {
error: require("../assets/sounds/error.mp3"),
  win: require("../assets/sounds/win.mp3"),
};

let initialized = false;

/**
 * preload all sounds once (call this early, e.g. in _layout.tsx useEffect)
 */
export async function initSounds() {
  if (initialized) return;
  
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    for (const key of Object.keys(sources) as SoundKey[]) {
      const { sound } = await Audio.Sound.createAsync(sources[key]);
      soundCache[key] = sound;
    }
    initialized = true;
  } catch (err) {
    console.warn("ðŸ”ˆ Sound init error:", err);
  }
}

/**
 * play a sound from cache (safe if not yet loaded)
 */
export async function playSound(key: SoundKey) {
  try {
    console.log("🔊 soundManager.playSound called with:", key);

    const snd = soundCache[key];
    if (!snd) return;
    await snd.setPositionAsync(0);
    await snd.playAsync();
  } catch (err) {
    console.log("sound play error:", err);
  }
}

/**
 * unload sounds on cleanup (optional at app exit)
 */
export async function unloadSounds() {
  for (const key of Object.keys(soundCache) as SoundKey[]) {
    if (soundCache[key]) {
      await soundCache[key]!.unloadAsync();
      soundCache[key] = null;
    }
  }
  initialized = false;
}

