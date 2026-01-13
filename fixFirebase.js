const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

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
const db = getFirestore(app);

module.exports = { db };
