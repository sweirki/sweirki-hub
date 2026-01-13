const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function cleanText(value) {
  if (typeof value !== "string") return value;

  return value
    .replace(/ðŸ”¥/g, "🔥")
    .replace(/ðŸŽ²/g, "🎲")
    .replace(/ðŸ†/g, "🏆")
    .replace(/ðŸ“Š/g, "📊")
    .replace(/ðŸ’°/g, "💰")
    .replace(/ðŸ“–/g, "📖")
    .replace(/ðŸ“œ/g, "📝")
    .replace(/âœ…/g, "✅")
    .replace(/âš ï¸/g, "⚠️")
    .replace(/â±/g, "⏱")
    .replace(/â€”/g, "—")
    .replace(/â€¢/g, "•")
    .trim();
}

async function cleanUsers() {
  const snap = await db.collection("users").get();

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.stats) continue;

    let changed = false;

    if (Array.isArray(data.stats.badges)) {
      const fixed = data.stats.badges.map(cleanText);
      if (JSON.stringify(fixed) !== JSON.stringify(data.stats.badges)) {
        data.stats.badges = fixed;
        changed = true;
      }
    }

    if (Array.isArray(data.stats.achievements)) {
      const fixed = data.stats.achievements.map(cleanText);
      if (JSON.stringify(fixed) !== JSON.stringify(data.stats.achievements)) {
        data.stats.achievements = fixed;
        changed = true;
      }
    }

    if (typeof data.stats.rank === "string") {
      const fixed = cleanText(data.stats.rank);
      if (fixed !== data.stats.rank) {
        data.stats.rank = fixed;
        changed = true;
      }
    }

    if (changed) {
      await doc.ref.update({ stats: data.stats });
      console.log("✔ cleaned user:", doc.id);
    }
  }
}

async function cleanGameHistory() {
  const users = await db.collection("gameHistory").get();

  for (const user of users.docs) {
    const games = await user.ref.collection("games").get();

    for (const game of games.docs) {
      const d = game.data();
      let changed = false;

      ["mode", "label", "resultText"].forEach((k) => {
        if (typeof d[k] === "string") {
          const fixed = cleanText(d[k]);
          if (fixed !== d[k]) {
            d[k] = fixed;
            changed = true;
          }
        }
      });

      if (changed) {
        await game.ref.update(d);
        console.log(`✔ cleaned game ${game.id} for user ${user.id}`);
      }
    }
  }
}

(async () => {
  console.log("Starting Firestore cleanup...");
  await cleanUsers();
  await cleanGameHistory();
  console.log("✅ Firestore cleanup complete.");
})();
