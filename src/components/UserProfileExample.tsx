import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold text-slate-900 mb-4">User Profile</h2>
      <div className="space-y-3">
        <p><strong className="text-slate-500">Name:</strong> {profile.name}</p>
        <p><strong className="text-slate-500">Email:</strong> {profile.email}</p>
        <p><strong className="text-slate-500">Phone:</strong> {profile.phone}</p>
        <p><strong className="text-slate-500">Role:</strong> <span className="capitalize px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-sm">{profile.role}</span></p>
        <p><strong className="text-slate-500">Status:</strong> <span className="capitalize px-2 py-1 bg-green-50 text-green-600 rounded-md text-sm">{profile.status}</span></p>
        <p className="text-xs text-slate-400 pt-4 font-mono tracking-tight">UID: {profile.uid}</p>
      </div>
    </div>
  );
}
