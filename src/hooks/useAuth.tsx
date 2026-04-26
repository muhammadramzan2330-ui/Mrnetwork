import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
        console.log("Searching profile for UID:", firebaseUser.uid);
        const q = query(
          collection(db, 'user'), 
          where('uid', '==', firebaseUser.uid)
        );

        unsubscribeProfile = onSnapshot(q, (snapshot) => {
          console.log(`Query result count: ${snapshot.size}`);
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as UserProfile;
            setProfile(userData);
            setError(null);
          } else {
            console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
            setProfile(null);
            setError(`User profile not found for UID: ${firebaseUser.uid}`);
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
