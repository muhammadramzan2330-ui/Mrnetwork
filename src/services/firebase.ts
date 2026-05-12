import { initializeApp } from 'firebase/app';
import { toast } from 'sonner';
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
  apiKey: "AIzaSyDlMAnRnRVx_UXpfWS1LFu8jAwDbc130iQ",
  authDomain: "isp-billing-app-eda7c.firebaseapp.com",
  projectId: "isp-billing-app-eda7c",
  storageBucket: "isp-billing-app-eda7c.firebasestorage.app",
  messagingSenderId: "11751714792",
  appId: "1:11751714792:web:1d65fa8eb13333bfd8fe5d",
  measurementId: "G-X2BQGLBCC4"
};

// --- SAFE INITIALIZATION ---
let app;
let auth: any;
let db: any;
let secondaryAuth: any;
let isFirebaseInitialized = false;
let firebaseInitError: string | null = null;

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    throw new Error("Missing required Firebase configuration (API Key or App ID).");
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Secondary app instance for managing users without logging out the administrator
  const secondaryApp = initializeApp(firebaseConfig, 'SecondaryManager');
  secondaryAuth = getAuth(secondaryApp);
  
  isFirebaseInitialized = true;
  console.log("Firebase initialized successfully for project:", firebaseConfig.projectId);
} catch (error: any) {
  console.error("CRITICAL: Firebase failed to initialize:", error.message);
  if (error.code === 'auth/api-key-not-valid' || error.message.includes('api-key-not-valid')) {
    console.error("DIAGNOSIS: This error usually means the API Key is restricted. Please check Google Cloud Console Credentials and ensure your Vercel domain is allowed for this API Key.");
  }
  firebaseInitError = error.message;
}

export { app, auth, db, secondaryAuth, isFirebaseInitialized, firebaseInitError };

const googleProvider = new GoogleAuthProvider();

// Essential Helpers used by the app
export const signInWithGoogle = async () => {
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
  try {
    console.log("Attempting signInWithPopup...");
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("signInWithGoogle precise error:", JSON.stringify({
      code: error.code,
      message: error.message,
      domain: window.location.hostname
    }));
    
    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = window.location.hostname;
      console.error("CRITICAL: Unauthorized Domain detected.");
      console.error("Please add the following domain to your Firebase Project's 'Authorized Domains' list:");
      console.error("- " + currentHost);
      console.error("Link: https://console.firebase.google.com/project/" + firebaseConfig.projectId + "/authentication/settings");
      
      const isIframe = window.self !== window.top;
      if (isIframe) {
        toast.error("Auth blocked in preview. Please 'Open in New Tab' to login or add this domain to Firebase Authorized Domains.", {
          description: `Domain: ${currentHost}`,
          duration: 10000
        });
      }
    }
    
    // Explicitly handle unauthorized domain by informing or trying redirect
    // Sometimes redirect works better with iframe/popup constraints
    const redirectCodes = [
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/internal-error',
      'auth/network-request-failed',
      'auth/popup-closed-by-user',
      'auth/web-storage-unsupported',
      'auth/unauthorized-domain'
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

export const loginWithEmail = async (email: string, pass: string) => {
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    console.error("loginWithEmail precise error:", JSON.stringify({
      code: error.code,
      message: error.message,
      customData: error.customData,
      stack: error.stack
    }));
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
  try {
    return await createUserWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    console.error("registerWithEmail precise error:", JSON.stringify({
      code: error.code,
      message: error.message,
      customData: error.customData,
      stack: error.stack
    }));
    throw error;
  }
};

export const resetPassword = (email: string) => {
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
  return sendPasswordResetEmail(auth, email);
};

export const logout = () => {
  if (!isFirebaseInitialized) return Promise.resolve();
  return signOut(auth);
};

export const subscribeToCollection = <T extends { id: string }>(
  collectionPath: string, 
  callback: (data: T[]) => void,
  queryConstraints: QueryConstraint[] = [],
  onError?: (error: any) => void
) => {
  if (!isFirebaseInitialized) return () => {};
  const q = query(collection(db, collectionPath), ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  }, (error) => {
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  });
};

export const addDocument = async (collectionPath: string, data: any) => {
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
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
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
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
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
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
  if (!isFirebaseInitialized) throw new Error("Firebase not initialized");
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
