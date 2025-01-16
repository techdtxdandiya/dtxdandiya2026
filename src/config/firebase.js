import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCq_Y1NlXxCUPl1S__I_lzuCwl6hbFU5Ig",
  authDomain: "dtx-dandiya-70009.firebaseapp.com",
  projectId: "dtx-dandiya-70009",
  storageBucket: "dtx-dandiya-70009.firebasestorage.app",
  messagingSenderId: "1076264572586",
  appId: "1:1076264572586:web:2584848166107a1470a2d3",
  measurementId: "G-TTLSG9PW7W",
  databaseURL: "https://dtx-dandiya-70009-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Get database instance
export const db = getDatabase(app); 