import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, isFirebaseInitialized } from '@/services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  status: string;
  package?: string;
  packageId?: string;
  packageName?: string;
  packageSpeed?: string;
  packagePrice?: number;
  plan?: string;
  paymentStatus?: string;
  createdAt?: any;
  updatedAt?: any;
  id?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true, 
  isAdmin: false, 
  isCustomer: false,
  error: null 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseInitialized) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | undefined;

    // Handle redirect result
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Redirect login success:", result.user.email);
      }
    }).catch((err) => {
      console.error("Redirect login error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(`Login error: ${err.message}`);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Clear previous profile subscription if any
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }

        // Query Firestore "user" collection where uid == current user UID
        const currentUserUid = firebaseUser.uid.trim();
        console.log("AUTH_DEBUG: Current User UID:", currentUserUid);
        
        const userRef = doc(db, 'user', currentUserUid);

        unsubscribeProfile = onSnapshot(userRef, async (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data() as UserProfile;
            console.log("AUTH_DEBUG: Profile Found:", {
              uid: currentUserUid,
              role: userData.role,
              status: userData.status,
              email: userData.email
            });

            // Role Elevation for developer
            const isDev = firebaseUser.email?.toLowerCase() === 'muhammadramzan2330@gmail.com';
            if (isDev && (userData.role !== 'admin' || userData.status !== 'active')) {
              console.log("AUTH_DEBUG: Elevating developer to admin...");
              const { updateDoc, doc } = await import('firebase/firestore');
              await updateDoc(doc(db, 'user', currentUserUid), { 
                role: 'admin', 
                status: 'active' 
              });
            }

            setProfile({ ...userData, id: snapshot.id } as any);
            setError(null);
            setLoading(false);
          } else {
            console.warn("AUTH_DEBUG: No profile found in 'user' collection for UID:", currentUserUid);
            // AUTO-ADAPT: Auto-create profile for ALL authenticated users if missing
            try {
              const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
              const isDeveloper = firebaseUser.email?.toLowerCase() === 'muhammadramzan2330@gmail.com';
              
              await setDoc(doc(db, 'user', currentUserUid), {
                uid: currentUserUid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer Account',
                email: firebaseUser.email,
                phone: '', 
                role: isDeveloper ? 'admin' : 'customer',
                status: isDeveloper ? 'active' : 'pending',
                plan: "",
                paymentStatus: "pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              console.log("Profile Auto-Provisioned for:", firebaseUser.email);
              // Profile creation will trigger snapshot again
            } catch (err) {
              console.error("Auto-provisioning failed:", err);
              setProfile(null);
              setLoading(false);
            }
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `user/${currentUserUid}`);
          setError("Failed to load user profile");
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }
        setProfile(null);
        setError(null);
        setLoading(false);
        // Force clear local storage on clear logout
        localStorage.clear();
        sessionStorage.clear();
      }
    });

    // Auto-logout after 30 mins of inactivity
    let inactivityTimeout: any;
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        auth.signOut();
        toast.info("Session expired due to inactivity");
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(inactivityTimeout);
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === 'muhammadramzan2330@gmail.com';
  const isCustomer = profile?.role === 'customer' && !isAdmin;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isCustomer, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
