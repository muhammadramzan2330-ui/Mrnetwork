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

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Login />;
  }

  return (
    <SystemProvider>
      <Layout>
        <Routes>
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
