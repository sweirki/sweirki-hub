import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCRnjKjiSuzNR9Ds4nbPAu5DOXzu2J9CRM",
  authDomain: "gamesworld-8b301.firebaseapp.com",
  projectId: "gamesworld-8b301",
  storageBucket: "gamesworld-8b301.appspot.com",
  messagingSenderId: "917460206748",
  appId: "1:917460206748:web:d7fbb044ba5bb7437ad959",
  measurementId: "G-ETXDT471WE"
};

// Initialize app once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth ONCE with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };

