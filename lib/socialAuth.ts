import { auth, db } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Handles Firebase authentication and user saving
 * after receiving a valid Google access token.
 */
export async function handleGoogleFirebaseLogin(accessToken: string) {
  try {
    // ðŸ”¹ Convert Google access token into Firebase credential
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const userCred = await signInWithCredential(auth, credential);
    const user = userCred.user;

    // ðŸ”¹ Prepare user data
    const uid = user.uid;
    const email = user.email ?? "";
    const username = email.split("@")[0];

    // ðŸ”¹ Save to Firestore if not already there
    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        email,
        username,
        avatarUri: user.photoURL || "",
        createdAt: new Date().toISOString(),
      });
    }

    // ðŸ”¹ Cache session locally
    const dataToStore: [string, string][] = [
      ["uid", uid],
      ["email", email],
      ["username", username],
    ];
    if (user.photoURL) dataToStore.push(["avatarUri", user.photoURL]);
    await AsyncStorage.multiSet(dataToStore);

    console.log("âœ… Firebase sign-in success for:", email);
    return user;
  } catch (err) {
    console.error("ðŸ”¥ Firebase sign-in error:", err);
    return null;
  }
}

