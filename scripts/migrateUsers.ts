import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateUsers() {
  const usersSnap = await db.collection("users").get();

  for (const doc of usersSnap.docs) {
    const data = doc.data();

    // Skip already-canonical docs
    if (data.uid && doc.id === data.uid) {
      continue;
    }

    // We only migrate if username looks valid
    const username =
      data.username || data.displayName || data.name || null;

    if (!username) continue;

    // If legacy doc contains a UID reference
    const uid = data.uid;
    if (!uid) continue;

    const canonicalRef = db.collection("users").doc(uid);
    const canonicalSnap = await canonicalRef.get();

    if (!canonicalSnap.exists) {
      await canonicalRef.set({
        uid,
        username,
        migratedFrom: doc.id,
        migratedAt: Date.now(),
      });

      console.log(`✅ Migrated ${doc.id} → ${uid}`);
    }
  }

  console.log("🎯 Migration complete");
}

migrateUsers().catch(console.error);
