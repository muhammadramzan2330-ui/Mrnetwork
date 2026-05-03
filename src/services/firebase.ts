import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  Timestamp,
  serverTimestamp,
  type QueryConstraint
} from 'firebase/firestore';

// Firebase configuration using environment variables for sensitive data
// and hardcoded values for project identifiers as requested.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "isp-billing-app-eda7c.firebaseapp.com",
  projectId: "isp-billing-app-eda7c",
  storageBucket: "isp-billing-app-eda7c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Simple validation to help debug missing keys
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. Please set VITE_FIREBASE_API_KEY in environment variables.");
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Secondary instance for admin-led user creation to avoid session swap
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);

// Essential Helpers used by the app
export const signInWithGoogle = async () => {
  try {
    console.log("Attempting signInWithPopup...");
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("signInWithPopup failed:", error.code, error.message);
    
    // Explicitly handle unauthorized domain by informing or trying redirect
    // Sometimes redirect works better with iframe/popup constraints
    const redirectCodes = [
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/internal-error',
      'auth/network-request-failed',
      'auth/popup-closed-by-user',
      'auth/web-storage-unsupported',
      'auth/unauthorized-domain' // Adding it to trigger redirect fallback
    ];
    
    if (redirectCodes.includes(error.code)) {
      console.warn("Switching to signInWithRedirect due to error:", error.code);
      try {
        await signInWithRedirect(auth, googleProvider);
        // signInWithRedirect doesn't return anything; the page will reload
        return null;
      } catch (redirectError: any) {
        console.error("signInWithRedirect error:", redirectError.code, redirectError.message);
        throw redirectError;
      }
    }
    throw error;
  }
};

export const loginWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const registerWithEmail = (email: string, pass: string) => 
  createUserWithEmailAndPassword(auth, email, pass);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export const subscribeToCollection = <T extends { id: string }>(
  collectionPath: string, 
  callback: (data: T[]) => void,
  queryConstraints: QueryConstraint[] = []
) => {
  const q = query(collection(db, collectionPath), ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  });
};

export const addDocument = async (collectionPath: string, data: any) => {
  return await addDoc(collection(db, collectionPath), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

export const createUserProfile = async (uid: string, data: any) => {
  return await setDoc(doc(db, 'user', uid), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateDocument = async (collectionPath: string, id: string, data: any) => {
  const docRef = doc(db, collectionPath, id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

export const deleteDocument = async (collectionPath: string, id: string) => {
  const docRef = doc(db, collectionPath, id);
  return await deleteDoc(docRef);
};

export { onAuthStateChanged, type FirebaseUser };
export default app;
