import React from 'react';
import { ShieldCheck, Globe, Database, UserCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseInitialized, firebaseInitError } from '@/services/firebase';

export default function Status() {
  const { user, profile, isAdmin } = useAuth();
  
  const statusItems = [
    { 
      label: 'Firebase Core', 
      status: isFirebaseInitialized ? 'Connected' : 'Error',
      description: isFirebaseInitialized ? 'Cloud Infrastructure is operational.' : (firebaseInitError || 'Connection failed.'),
      active: isFirebaseInitialized,
      icon: Globe
    },
    { 
      label: 'Authentication', 
      status: user ? 'Authenticated' : 'Offline',
      description: user ? `Logged in as ${user.email}` : 'No active session detected.',
      active: !!user,
      icon: UserCheck
    },
    { 
      label: 'Identity Registry', 
      status: profile ? 'Synchronized' : 'Missing',
      description: profile ? `Role: ${profile.role} | Status: ${profile.status}` : 'No profile data found for current UID.',
      active: !!profile,
      icon: Database
    },
    { 
      label: 'Security Clearance', 
      status: isAdmin ? 'Admin' : 'Restricted',
      description: isAdmin ? 'Full system access granted.' : 'Standard user permissions.',
      active: isAdmin,
      icon: ShieldCheck
    }
  ];

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-full">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">System Status</h1>
          <p className="text-slate-500 font-medium">Real-time diagnostics and infrastructure monitoring</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statusItems.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.label}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4"
            >
              <div className={`p-4 rounded-2xl ${item.active ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">{item.label}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Technical Diagnostics</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-slate-600">
              <p className="mb-2 uppercase font-black text-indigo-600 tracking-widest text-[10px]">Environment Snapshot:</p>
              <div className="grid grid-cols-2 gap-2 uppercase tracking-tighter">
                <p>User Agent: {window.navigator.userAgent.split(')')[0]})</p>
                <p>Resolution: {window.innerWidth}x{window.innerHeight}</p>
                <p>Domain: {window.location.hostname}</p>
                <p>App Mode: {import.meta.env.MODE}</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-[10px] text-slate-400">
              <p className="mb-2 uppercase font-black text-indigo-400 tracking-widest">Network Node Trace:</p>
              <p>PING isp-billing-app-eda7c.firebaseapp.com ... [OK]</p>
              <p>AUTH_UPLINK ... [STABLE]</p>
              <p>FIRESTORE_SYNC ... [ACTIVE]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
