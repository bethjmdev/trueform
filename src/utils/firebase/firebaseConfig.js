import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "trueform-b27c0.firebaseapp.com",
  projectId: "trueform-b27c0",
  storageBucket: "trueform-b27c0.firebasestorage.app",
  messagingSenderId: "100618470487",
  appId: "1:100618470487:web:a74625ad2b522b34988f12",
  measurementId: "G-8900F43SG0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
