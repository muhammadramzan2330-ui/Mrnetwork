import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Wallet, 
  ShieldOff, 
  SlidersHorizontal, 
  LogOut, 
  RefreshCw,
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  UserCheck, 
  Package, 
  CreditCard, 
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Calendar,
  History,
  Activity,
  AlertCircle,
  LayoutDashboard,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/services/firebase';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isAdmin, isCustomer } = useAuth();
  const { users, subdealers, packages, requests, payments, bills, treasury, loading, checkExpiries, generateMonthlyBills } = useSystem();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkExpiries();
    }
  }, [loading]);

  const handleSyncBills = async () => {
    setIsSyncing(true);
    try {
      await generateMonthlyBills();
      toast.success("Billing data synchronized");
    } catch (e) {
      toast.error("Billing sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended').length;
  const expiredUsersCount = users.filter(u => u.status === 'expired').length;
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const recentPayments = payments.slice(0, 5);
  const userPayments = isAdmin ? payments : payments.filter(p => p.userId === profile?.uid);
  const userRequests = isAdmin ? pendingRequests : pendingRequests.filter(r => r.userId === profile?.uid);

  const totalIncome = payments
    .filter(p => p.status === 'approved' && p.type === 'in')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const pendingUsersCount = users.filter(u => u.status === 'pending').length;
  const unpaidBillsCount = bills.filter(b => b.status === 'unpaid').length;
  const paidBillsCount = bills.filter(b => b.status === 'paid').length;
  const overdueBillsCount = bills.filter(b => b.status === 'unpaid' && new Date(b.dueDate) < new Date()).length;

  const stats = isAdmin ? [
    { label: 'Active', value: activeUsersCount.toString(), icon: UserCheck, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Suspended', value: suspendedUsersCount.toString(), icon: ShieldOff, color: 'bg-rose-100 text-rose-600' },
    { label: 'Expired', value: expiredUsersCount.toString(), icon: AlertCircle, color: 'bg-amber-100 text-amber-600' },
    { label: 'Unpaid Bills', value: unpaidBillsCount.toString(), icon: CreditCard, color: 'bg-rose-100 text-rose-600' },
    { label: 'Paid Bills', value: paidBillsCount.toString(), icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Invoiced', value: `Rs. ${totalIncome.toLocaleString()}`, icon: Wallet, color: 'bg-indigo-100 text-indigo-600' },
  ] : [
    { label: 'Active', value: activeUsersCount.toString(), icon: UserCheck, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Dealers', value: subdealers.length.toString(), icon: Store, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Plans', value: packages.length.toString(), icon: Package, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Pending', value: pendingRequests.length.toString(), icon: Activity, color: 'bg-amber-100 text-amber-600' },
  ];

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      // signOut will trigger onAuthStateChanged in useAuth, which clears state
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Failed to sign out");
    }
  };

  const headerActions = [
    { icon: RefreshCw, label: isSyncing ? 'Syncing...' : 'Sync Bills', action: handleSyncBills },
    { icon: TrendingUp, label: 'Reports', path: '/reports' },
    { icon: History, label: 'System Logs', path: '/audit-logs' },
    { icon: SlidersHorizontal, label: 'Billing Settings', path: '/billing-settings' },
    { icon: LogOut, label: 'Logout', action: () => setShowLogoutConfirm(true) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      {/* Global Search & Actions Header */}
      <div className="sticky top-[60px] md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 pt-6 pb-6 shadow-sm transition-all duration-300">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Admin HQ</h2>
                <div className="flex items-center gap-2 mt-1.5 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none">System Terminal // Live</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80 lg:w-[480px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 group-focus-within:border-indigo-100 transition-all">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  placeholder="Global Search (Customers, Bills, Reports)..."
                  className="input-modern pl-14 h-14 text-sm font-bold border-slate-200 bg-white shadow-md focus:shadow-lg focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-2xl cursor-pointer"
                  onClick={() => navigate('/users')} // Redirect to users for search by default
                  readOnly
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-400 rounded-md border border-slate-200 uppercase tracking-tighter">Enter</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Header with Modern Gradient */}
      <div className="header-gradient pt-8 pb-20 px-4 sm:px-8 text-white relative overflow-hidden md:rounded-b-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto relative z-10 gap-6">
          <div>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-1">M & Network // Admin</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{isAdmin ? 'Overview Dashboard' : 'Customer Console'}</h1>
            <p className="text-white/80 text-sm mt-2 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              {formatDate(new Date())}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {headerActions.filter(a => isAdmin || a.label === 'Logout').map((action, i) => (
              <button 
                key={i} 
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                className="bg-white/10 hover:bg-white/20 transition-all px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs font-bold whitespace-nowrap"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 rounded-full -ml-10 -mb-10 blur-3xl opacity-50" />
      </div>

      <div className="px-4 sm:px-8 -mt-10 max-w-7xl mx-auto w-full relative z-20 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all duration-300"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", 
                stat.color
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Treasury Card */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/treasury')}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md transition-all duration-300 overflow-hidden relative"
          >
            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Ledger Balance</h3>
                    <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">Rs. {treasury?.balance?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cash Inflow</p>
                      <p className="text-base font-bold text-emerald-600">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin Payouts</p>
                      <p className="text-base font-bold text-rose-600">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center h-full self-center">
                <div className="bg-slate-50 p-4 rounded-full group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          </motion.div>
        )}

        {!isAdmin && profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Network Operator</p>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">{profile.email}</p>
              </div>
            </div>
            <div className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 mt-2 sm:mt-0",
              profile.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
            )}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {profile.status}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Quick List - Payments */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Recent Payments
              </h3>
              <button 
                onClick={() => navigate('/payments')} 
                className="text-[11px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {userPayments.length > 0 ? (
                userPayments.slice(0, 5).map((payment, idx) => (
                  <div 
                    key={payment.id}
                    className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex items-center justify-between hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        payment.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{payment.userName}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formatDate(payment.date)} • {payment.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 leading-none">Rs. {payment.amount?.toLocaleString()}</p>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-wider mt-1",
                        payment.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                      )}>{payment.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-medium italic">No recent transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick List - Requests */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Active Requests
              </h3>
              <button 
                onClick={() => navigate('/requests')} 
                className="text-[11px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
              >
                 {isAdmin ? 'Manage' : 'Request'}
              </button>
            </div>
            <div className="space-y-4">
              {userRequests.length > 0 ? (
                userRequests.slice(0, 5).map((req) => (
                  <div 
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex items-center justify-between hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight capitalize">{req.type}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>{req.status}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-medium italic">{isAdmin ? 'No pending requests' : 'All clear'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Sign Out</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
              Are you sure you want to log out? Your active session will be terminated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 mt-8">
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 rounded-xl h-12 font-bold text-slate-600 border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              className="flex-1 bg-rose-600 hover:bg-rose-700 rounded-xl h-12 text-white font-bold border-none shadow-sm transition-all active:scale-[0.98]"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
