import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnN5Ys1vI8Os515rZkDV_3QUnbhbXbzfI",
  authDomain: "drawslop.firebaseapp.com",
  projectId: "drawslop",
  storageBucket: "drawslop.firebasestorage.app",
  messagingSenderId: "722198118515",
  appId: "1:722198118515:web:380fc6d522c38df84aaa06",
  measurementId: "G-BRPTK8FQHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app); 