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
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SystemProvider } from './contexts/SystemContext';
import { Toaster } from '@/components/ui/sonner';
import { ShieldOff } from 'lucide-react';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';

function AppRoutes() {
  const { user, profile, loading, isAdmin, isCustomer, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Setting up your profile...</h2>
        <p className="text-sm text-slate-500">This will only take a moment.</p>
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
              <Route path="/" element={<Dashboard />} />
              {/* Add customer specific routes here if needed */}
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
