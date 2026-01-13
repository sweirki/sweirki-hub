import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const usernameCache = new Map<string, string>();

export async function resolveUsername(uid?: string): Promise<string> {
  if (!uid) {
    return "Player";
  }

  console.log("🟢 resolveUsername CALLED for", uid);

  if (usernameCache.has(uid)) {
    return usernameCache.get(uid)!;
  }

  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const name =
        snap.data().username ||
        snap.data().displayName ||
        snap.data().name;

      if (typeof name === "string" && name.length > 0) {
        usernameCache.set(uid, name);
        return name;
      }
    }
  } catch (e) {
    console.warn("⚠️ Username resolve failed:", uid);
  }

  const fallback = "Player";
  usernameCache.set(uid, fallback);
  return fallback;
}
