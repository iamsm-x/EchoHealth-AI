// database/firebaseConfig.js
// Firebase initialization and Firestore DB connection

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBKBJ3p5j54pfd47vHbwwhery6qdAsX2gI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "hack-next.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "hack-next",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "hack-next.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "825585040832",
  appId: process.env.FIREBASE_APP_ID || "1:825585040832:web:b17d6670fc9423cca75c25",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-MDMDFV2JEX"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db, firebaseConfig };
