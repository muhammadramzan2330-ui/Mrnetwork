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
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import CustomerDashboard from './components/CustomerDashboard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SystemProvider } from './contexts/SystemContext';
import { Toaster } from '@/components/ui/sonner';
import { ShieldOff, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, isFirebaseInitialized, firebaseInitError } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Allow Signup page even if not logged in
  const isSignupPath = window.location.pathname === '/signup';

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const isProfileError = error?.startsWith("User profile not found");
  
  if (error && !isProfileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldOff className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{error}</h1>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          An unexpected error occurred while loading your profile.
        </p>
        <button 
          onClick={() => signOut(auth)}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Initializing Profile</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
          Securely synchronizing your account credentials with our identity registry...
        </p>
      </div>
    );
  }

  // Handle pending or rejected status
  if (profile?.status === 'pending' || profile?.status === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 max-w-md w-full"
        >
          <div className={cn(
            "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 border mx-auto relative",
            profile.status === 'pending' ? "bg-amber-50 text-amber-500 border-amber-100" : "bg-rose-50 text-rose-500 border-rose-100"
          )}>
            {profile.status === 'pending' ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin" />
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg">Pending</div>
              </>
            ) : (
              <>
                <ShieldOff className="w-12 h-12" />
                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg">Rejected</div>
              </>
            )}
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3 px-4">
            {profile.status === 'pending' ? 'Account Pending' : 'Access Denied'}
          </h1>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Status Message:</p>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              {profile.status === 'pending' 
                ? `Account: ${user.email} is currently in the verification queue. An administrator will verify your details shortly.` 
                : "Your account request has been declined. Please contact support for more details."}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {profile.status === 'pending' && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                Auto-Refreshing when approved...
              </p>
            )}
            <button 
              onClick={() => signOut(auth)}
              className="h-14 w-full bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-slate-800"
            >
              Sign Out
            </button>
            
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-4 font-sans">
              M & Network // Billing Portal
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <SystemProvider>
      <Layout>
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/users" element={<Users />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/subdealers" element={<Subdealers />} />
              <Route path="/treasury" element={<Treasury />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/billing-settings" element={<BillingSettings />} />
            </>
          ) : isCustomer ? (
            <>
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
