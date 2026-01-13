import { Audio } from "expo-av";
import { useSoundStore } from "../store/useSoundStore";

/**
 * Cached sounds (loaded once, reused)
 */
let numpadSound: Audio.Sound | null = null;
let controlSound: Audio.Sound | null = null;

/**
 * Ensure a sound is loaded once and cached
 */
async function ensureSound(
  current: Audio.Sound | null,
  set: (s: Audio.Sound) => void,
  source: number,
  volume: number
): Promise<Audio.Sound> {
  if (current) return current;

  const { sound } = await Audio.Sound.createAsync(source, { volume });
  set(sound);
  return sound;
}

/**
 * 🔢 NUMPAD CLICK
 */
export async function playNumpadClick(): Promise<void> {
  const { soundEnabled } = useSoundStore.getState();
  if (!soundEnabled) return;

  try {
    const sound = await ensureSound(
      numpadSound,
      (s) => {
        numpadSound = s;
      },
      require("../../assets/sounds/click-numpad.mp3"),
      0.45
    );

    await sound.replayAsync();
  } catch {
    // silent fail
  }
}

/**
 * 🎛️ CONTROL / BUTTON CLICK
 */
export async function playControlClick(): Promise<void> {
  const { soundEnabled } = useSoundStore.getState();
  if (!soundEnabled) return;

  try {
    const sound = await ensureSound(
      controlSound,
      (s) => {
        controlSound = s;
      },
      require("../../assets/sounds/click-control.mp3"),
      0.35
    );

    await sound.replayAsync();
  } catch {
    // silent fail
  }
}
