import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, isFirebaseInitialized } from '@/services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDocs, limit } from 'firebase/firestore';
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

        const currentUserUid = firebaseUser.uid.trim();
        console.log("AUTH_DEBUG: Session Active:", {
          email: firebaseUser.email,
          uid: currentUserUid
        });
        
        // Use document reference instead of query for better reliability
        const userDocRef = doc(db, 'user', currentUserUid);

        unsubscribeProfile = onSnapshot(userDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data() as UserProfile;
            console.log("AUTH_DEBUG: Profile Found:", userData.role);

            // Role Elevation for developer
            const isDev = firebaseUser.email?.toLowerCase() === 'muhammadramzan2330@gmail.com';
            if (isDev && (userData.role !== 'admin' || userData.status !== 'active')) {
              console.log("AUTH_DEBUG: Elevating developer to admin...");
              const { updateDoc } = await import('firebase/firestore');
              try {
                await updateDoc(docSnapshot.ref, { 
                  role: 'admin', 
                  status: 'active' 
                });
              } catch (err) {
                console.error("Elevation failed (check rules):", err);
              }
            }

            setProfile({ ...userData, id: docSnapshot.id } as any);
            setError(null);
            setLoading(false);
          } else {
            console.warn("AUTH_DEBUG: No profile doc. Checking for email-linked profile...");
            try {
              const { setDoc, serverTimestamp } = await import('firebase/firestore');
              const isDeveloper = firebaseUser.email?.toLowerCase() === 'muhammadramzan2330@gmail.com';
              const email = firebaseUser.email?.toLowerCase() || '';

              if (email) {
                const existingProfileQuery = query(
                  collection(db, 'user'),
                  where('email', '==', email),
                  limit(1)
                );
                const existingProfile = await getDocs(existingProfileQuery);

                if (!existingProfile.empty) {
                  const existingDoc = existingProfile.docs[0];
                  const existingData = existingDoc.data() as UserProfile;

                  console.log("AUTH_DEBUG: Email-linked profile found:", existingDoc.id);
                  setProfile({ ...existingData, id: existingDoc.id } as any);
                  setError(null);
                  setLoading(false);
                  return;
                }
              }
              
              await setDoc(userDocRef, {
                uid: currentUserUid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Account',
                email,
                phone: '', 
                role: isDeveloper ? 'admin' : 'customer',
                status: isDeveloper ? 'active' : 'pending',
                plan: "",
                paymentStatus: "pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              setLoading(false);
            } catch (err) {
              console.error("Provisioning failed:", err);
              setProfile(null);
              setLoading(false);
            }
          }
        }, (err) => {
          console.error("AUTH_DEBUG: Profile Snapshot Error:", err);
          setError("Identity verification service unavailable. Please check your connection.");
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
      }
    });

    // Auto-logout after 60 mins of inactivity (increased from 30)
    let inactivityTimeout: any;
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        auth.signOut();
        toast.info("Session expired due to inactivity");
      }, 60 * 60 * 1000);
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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
