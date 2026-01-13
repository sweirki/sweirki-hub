import { FirebaseError } from "firebase/app";

export async function safeFirestoreCall<T>(
  fn: () => Promise<T>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await fn();
  } catch (e: any) {
    if (e instanceof FirebaseError) {
      // 🔒 Silent offline / timeout / unavailable
      return fallback;
    }

    // 🔒 Never crash UI
    return fallback;
  }
}
