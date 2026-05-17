import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  uid: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get current logged-in user from Firebase Auth
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 2. Query Firestore "user" collection where uid == current user UID
        const q = query(
          collection(db, 'user'), 
          where('uid', '==', user.uid)
        );

        // 3. Listen for changes in real-time (onSnapshot) or fetch once (getDocs)
        const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            // Get the first document found (assuming one profile per UID)
            const docData = querySnapshot.docs[0].data() as UserProfile;
            setProfile(docData);
          } else {
            setError("User profile not found in database.");
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore error:", err);
          setError("Failed to fetch user data.");
          setLoading(false);
        });

        // Cleanup Firestore listener on logout or unmount
        return () => unsubscribeFirestore();
      } else {
        // No user is signed in
        setProfile(null);
        setLoading(false);
      }
    });

    // Cleanup Auth listener on unmount
    return () => unsubscribeAuth();
  }, []);

  if (loading) return <div className="p-4 text-slate-500">Loading user profile...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!profile) return <div className="p-4 text-amber-500">Please sign in to view your profile.</div>;

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-sm mx-auto mt-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="text-xl font-black">{profile.name[0]}</span>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{profile.name}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">{profile.role} account</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
            <span className="text-xs font-bold text-slate-600 truncate ml-4">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</span>
            <span className="text-xs font-bold text-slate-600">{profile.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight",
              profile.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            )}>
              {profile.status}
            </span>
          </div>
        </div>
        <p className="text-[9px] text-slate-300 font-mono text-center tracking-tighter">NODE_ID: {profile.uid}</p>
      </div>
    </div>
  );
}
