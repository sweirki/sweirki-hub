const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCRnjKjiSuzNR9Ds4nbPAu5DOXzu2J9CRM",
  authDomain: "gamesworld-8b301.firebaseapp.com",
  projectId: "gamesworld-8b301",
  storageBucket: "gamesworld-8b301.firebasestorage.app",
  messagingSenderId: "917460206748",
  appId: "1:917460206748:web:d7fbb044ba5bb7437ad959",
  measurementId: "G-ETXDT471WE"
};

const app = initializeApp(firebaseConfig);
const { db } = require("./fixFirebase");

async function fixDifficulty() {
  const snap = await getDocs(collection(db, "leaderboard"));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.difficulty) {
      const lower = data.difficulty.toLowerCase();
      let fixed = null;
      if (lower === "easy") fixed = "Easy";
      if (lower === "medium") fixed = "Medium";
      if (lower === "hard") fixed = "Hard";

      if (fixed && fixed !== data.difficulty) {
        console.log(`Fixing ${d.id}: ${data.difficulty} -> ${fixed}`);
        await updateDoc(doc(db, "leaderboard", d.id), { difficulty: fixed });
      }
    }
  }
}

fixDifficulty().then(() => console.log("✅ Done cleaning difficulties"));
