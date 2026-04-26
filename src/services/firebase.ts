import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  Timestamp,
  type QueryConstraint
} from 'firebase/firestore';

import firebaseConfigData from "../../firebase-applet-config.json";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
  measurementId?: string;
}

const firebaseConfig = firebaseConfigData as FirebaseConfig;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

// Essential Helpers used by the app
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.warn("Auth operation failed, trying redirect fallback...", error.code);
    const redirectCodes = [
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/internal-error',
      'auth/network-request-failed'
    ];
    
    if (redirectCodes.includes(error.code)) {
      return await signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};
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
