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
// Firebase configuration using environment variables for high security
// and hardcoded values for project identifiers as requested by the user.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "isp-billing-app-eda7c.firebaseapp.com",
  projectId: "isp-billing-app-eda7c", // Forced to target project as per requirements
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// --- ENV DIAGNOSTICS ---
const mask = (val: string | undefined): string => {
  if (!val) return 'MISSING (undefined)';
  if (val.length <= 8) return '****';
  return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.error("CRITICAL: VITE_FIREBASE_API_KEY is not defined in environment variables.");
}

console.group('--- NEXUS SECURITY INITIALIZATION ---');
console.log('Active Node:', firebaseConfig.projectId);
console.log('Identity API:', mask(import.meta.env.VITE_FIREBASE_API_KEY));
console.log('Uplink Status:', mask(import.meta.env.VITE_FIREBASE_APP_ID));
console.log('Auth Domain:', firebaseConfig.authDomain);
console.groupEnd();

export const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app); // Default database
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
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
};

export const addDocument = async (collectionPath: string, data: any) => {
  try {
    return await addDoc(collection(db, collectionPath), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
};

export const createUserProfile = async (uid: string, data: any) => {
  try {
    return await setDoc(doc(db, 'user', uid), {
      uid,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `user/${uid}`);
  }
};

export const updateDocument = async (collectionPath: string, id: string, data: any) => {
  const docRef = doc(db, collectionPath, id);
  try {
    return await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
  }
};

export const deleteDocument = async (collectionPath: string, id: string) => {
  const docRef = doc(db, collectionPath, id);
  try {
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${id}`);
  }
};

// --- MANDATORY ERROR HANDLING ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { onAuthStateChanged, type FirebaseUser };
export default app;
