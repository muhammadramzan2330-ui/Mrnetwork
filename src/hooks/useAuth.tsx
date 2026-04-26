import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  status: string;
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
        console.log("Current Auth UID:", currentUserUid);
        
        const q = query(
          collection(db, 'user'), 
          where('uid', '==', currentUserUid)
        );

        unsubscribeProfile = onSnapshot(q, async (snapshot) => {
          console.log(`Query "user" result count for ${currentUserUid}: ${snapshot.size}`);
          
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as UserProfile;
            console.log("Profile found:", snapshot.docs[0].id);
            // Inject doc ID as 'id' for easier reference in SystemContext
            setProfile({ ...userData, id: snapshot.docs[0].id } as any);
            setError(null);
          } else {
            console.warn("User profile not found in Firestore for UID:", currentUserUid);
            
            // Auto-create profile if missing
            try {
              console.log("Auto-creating profile for:", firebaseUser.email);
              const docRef = await addDoc(collection(db, 'user'), {
                uid: currentUserUid,
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || "Muhammad Ramzan",
                phone: "",
                role: "admin",
                status: "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              console.log("Created profile with ID:", docRef.id);
              // onSnapshot will fire again when document is created
            } catch (createErr: any) {
              console.error("Error auto-creating profile:", createErr);
              setProfile(null);
              setError(`Profile creation failed: ${createErr.message}`);
            }
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore Profile Error:", err);
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

  const isAdmin = profile?.role === 'admin';
  const isCustomer = profile?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isCustomer, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
