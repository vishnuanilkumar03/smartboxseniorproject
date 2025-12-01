// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrT4YngcYDLBEAs4aVMwK5kb6QJmBR-Gw",
  authDomain: "smartdropboxapp.firebaseapp.com",
  databaseURL: "https://smartdropboxapp-default-rtdb.firebaseio.com",
  projectId: "smartdropboxapp",
  storageBucket: "smartdropboxapp.firebasestorage.app",
  messagingSenderId: "574450782351",
  appId: "1:574450782351:web:a8d46eacea1af4685220fa"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
