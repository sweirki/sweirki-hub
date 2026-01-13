const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function auditUsers() {
  const snap = await db.collection("users").get();

  let migratable = 0;
  let canonical = 0;
  let anonymous = 0;

  console.log("---- USERS AUDIT ----");

  for (const doc of snap.docs) {
    const data = doc.data();

    const isCanonical = data.uid && doc.id === data.uid;
    if (isCanonical) {
      canonical++;
      continue;
    }

    const username =
      data.username || data.displayName || data.name || null;

    if (data.uid && username) {
      migratable++;
      console.log("🟢 MIGRATABLE", {
        legacyId: doc.id,
        uid: data.uid,
        username,
      });
    } else {
      anonymous++;
      console.log("🔴 UNRECOVERABLE", {
        legacyId: doc.id,
        hasUid: !!data.uid,
        hasName: !!username,
      });
    }
  }

  console.log("---- SUMMARY ----");
  console.log({
    canonical,
    migratable,
    anonymous,
    total: snap.size,
  });
}

auditUsers().catch(console.error);
