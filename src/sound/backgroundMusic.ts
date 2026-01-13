import { Audio } from "expo-av";
import { useSoundStore } from "../store/useSoundStore";

let musicSound: Audio.Sound | null = null;

export async function startBackgroundMusic(
  source: number,
  volume = 0.15
) {
  const { soundEnabled } = useSoundStore.getState();
  if (!soundEnabled) return;

  if (musicSound) return; // already playing

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });

  const { sound } = await Audio.Sound.createAsync(source, {
    volume,
    isLooping: true,
  });

  musicSound = sound;
  await sound.playAsync();
}

export async function stopBackgroundMusic() {
  if (!musicSound) return;

  await musicSound.stopAsync();
  await musicSound.unloadAsync();
  musicSound = null;
}
