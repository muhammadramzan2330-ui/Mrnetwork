import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Payments from './components/Payments';
import Requests from './components/Requests';
import Packages from './components/Packages';
import Subdealers from './components/Subdealers';
import Treasury from './components/Treasury';
import AuditLogs from './components/AuditLogs';
import BillingSettings from './components/BillingSettings';
import Reports from './components/Reports';
import Status from './components/Status';
import Bills from './components/Bills';
import Tickets from './components/Tickets';
import SystemCheck from './components/SystemCheck';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import CustomerDashboard from './components/CustomerDashboard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Profile from './components/Profile';
import ExportData from './components/ExportData';
import Expenses from './components/Expenses';
import { SystemProvider } from './contexts/SystemContext';
import { Toaster } from '@/components/ui/sonner';
import { ShieldOff, Loader2, AlertCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, isFirebaseInitialized, firebaseInitError } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function AppRoutes() {
  if (!isFirebaseInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 max-w-md w-full"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-rose-100 shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Firebase configuration error</h1>
          <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
            {firebaseInitError || "The application uplink could not be established. Please verify your environment variables."}
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left font-mono text-[10px] text-slate-600 mb-8 w-full overflow-x-auto shadow-sm">
            <p className="font-bold mb-2 uppercase tracking-widest text-indigo-600">Runtime Context Status:</p>
            <p className="mb-1">API_KEY: ✓ INTEGRATED</p>
            <p className="mb-1">APP_ID: ✓ INTEGRATED</p>
            <p>PROJECT: isp-billing-app-eda7c</p>
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Identity Registry Active
          </p>
        </motion.div>
      </div>
    );
  }

  const { user, profile, loading, isAdmin, isCustomer, error } = useAuth();

  useEffect(() => {
    if (user && profile) {
      console.log("AUTH_ROUTING_TRACE:", {
        email: user.email,
        uid: user.uid,
        firestore_role: profile.role,
        firestore_status: profile.status,
        calculated_isAdmin: isAdmin,
        calculated_isCustomer: isCustomer
      });
    }
  }, [user, profile, isAdmin, isCustomer]);

  const handleLogout = () => signOut(auth);

  const isSignupPath = window.location.pathname === '/signup';

  // If we have a user but profile is still loading, render layout with a nested loading indicator
  // This ensures the header and menu (part of Layout) appear as soon as possible.
  return (
    <SystemProvider>
      <Layout>
        {loading && user ? (
          <div className="flex flex-col items-center justify-center p-12 py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing Secure Profile...</p>
          </div>
        ) : (
          <Routes>
            {!user ? (
              <>
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<Login />} />
              </>
            ) : (profile?.status === 'pending' || profile?.status === 'rejected') && !isAdmin ? (
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center p-6 text-center py-20">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full"
                  >
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border mx-auto relative",
                      profile.status === 'pending' ? "bg-amber-50 text-amber-500 border-amber-100" : "bg-rose-50 text-rose-500 border-rose-100"
                    )}>
                      {profile.status === 'pending' ? <Loader2 className="w-10 h-10 animate-spin" /> : <ShieldOff className="w-10 h-10" />}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-3">
                      {profile.status === 'pending' ? 'Verification Pending' : 'Registration Rejected'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                      {profile.status === 'pending' 
                        ? 'Your account request is currently being reviewed by our administration team. This usually takes less than 24 hours.' 
                        : 'Unfortunately, your registration request was not approved. Please contact our support team for clarification.'}
                    </p>
                    <Button 
                      onClick={handleLogout}
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs"
                    >
                      Sign Out
                    </Button>
                  </motion.div>
                </div>
              } />
            ) : profile?.status === 'suspended' && !isAdmin ? (
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center p-6 text-center py-20">
                  <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-rose-100">
                    <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
                      <ShieldOff className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Service Suspended</h1>
                    <p className="text-slate-500 font-medium mb-8">
                      Access to your internet profile has been restricted. Please resolve pending issues or contact operations to restore service.
                    </p>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
                        onClick={() => window.open('https://wa.me/923000000000', '_blank')}
                      >
                        Connect with HQ Support
                      </Button>
                      <Button variant="outline" className="w-full h-12 rounded-xl" onClick={handleLogout}>Logout</Button>
                    </div>
                  </div>
                </div>
              } />
            ) : isAdmin ? (
              <>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/users" element={<Users />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/subdealers" element={<Subdealers />} />
                <Route path="/treasury" element={<Treasury />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/billing-settings" element={<BillingSettings />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/system-check" element={<SystemCheck />} />
                <Route path="/status" element={<Status />} />
                <Route path="/exports" element={<ExportData />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            ) : isCustomer ? (
              <>
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : !profile ? (
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center p-12 py-32 space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing Secure Profile...</p>
                </div>
              } />
            ) : (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        )}
      </Layout>
    </SystemProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-center" />
      </Router>
    </AuthProvider>
  );
}
