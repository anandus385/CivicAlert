// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNhFsJL3INp7yy-3j-8zZd8dO5YH3CbsM",
  authDomain: "civicalert-2ecfb.firebaseapp.com",
  projectId: "civicalert-2ecfb",
  storageBucket: "civicalert-2ecfb.firebasestorage.app",
  messagingSenderId: "366280861706",
  appId: "1:366280861706:web:afa2d44e1510047132d7f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);