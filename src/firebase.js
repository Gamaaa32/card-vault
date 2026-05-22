import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup as firebaseSignInWithPopup } from 'firebase/auth';

// ============================================================================
// FIREBASE CONFIGURATION — Card Vault
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDfSpidtqzDa8MPlchBstdaKgX-xjgHciA",
  authDomain: "cardvault-4566c.firebaseapp.com",
  projectId: "cardvault-4566c",
  storageBucket: "cardvault-4566c.firebasestorage.app",
  messagingSenderId: "127784051152",
  appId: "1:127784051152:web:2df1be135491168850d9d5",
  measurementId: "G-3KNTXNHV0N"
};

// Initialize Firebase with error handling
let auth = null;
let googleProvider = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

// Re-export signInWithPopup from firebase/auth
const signInWithPopup = firebaseSignInWithPopup;

export { auth, googleProvider, signInWithPopup };
