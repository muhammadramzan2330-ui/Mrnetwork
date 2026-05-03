import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Wallet, 
  ShieldOff, 
  SlidersHorizontal, 
  LogOut, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  UserCheck, 
  Package, 
  CreditCard, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Calendar,
  History,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const { users, subdealers, packages, requests, payments, treasury, loading, checkExpiries } = useSystem();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkExpiries();
    }
  }, [loading]);

  const activeUsers = users.filter(u => u.status === 'active');
  const expiredUsers = users.filter(u => u.status === 'expired' || u.status === 'suspended');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const recentPayments = payments.slice(0, 5);
  const userPayments = isAdmin ? payments : payments.filter(p => p.userId === profile?.uid);
  const userRequests = isAdmin ? pendingRequests : pendingRequests.filter(r => r.userId === profile?.uid);

  const stats = [
    { label: 'Active', value: activeUsers.length.toString(), icon: UserCheck, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Dealers', value: subdealers.length.toString(), icon: Store, color: 'bg-blue-100 text-blue-600' },
    { label: 'Plans', value: packages.length.toString(), icon: Package, color: 'bg-blue-100 text-blue-600' },
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
    { icon: TrendingUp, label: 'Reports', path: '/reports' },
    { icon: History, label: 'Audit Logs', path: '/audit-logs' },
    { icon: SlidersHorizontal, label: 'Settings', path: '/billing-settings' },
    { icon: LogOut, label: 'Logout', action: () => setShowLogoutConfirm(true) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-gray">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-0 overflow-x-hidden">
      {/* Header with Gradient */}
      <div className="header-gradient pt-6 pb-12 px-4 text-white relative">
        <div className="flex justify-between items-start max-w-7xl mx-auto">
          <div className="flex flex-col">
            <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest mb-1">ISP Manager</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{isAdmin ? 'Admin Dashboard' : 'My Account'}</h1>
            <p className="text-white/60 text-xs mt-1 font-medium">{formatDate(new Date())}</p>
          </div>
          <div className="flex items-center gap-2">
            {headerActions.filter(a => isAdmin || a.label === 'Logout').map((action, i) => (
              <button 
                key={i} 
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                className="hover:bg-white/10 transition-colors p-2.5 rounded-xl backdrop-blur-md"
                title={action.label}
              >
                <action.icon className="w-5 h-5 stroke-[2px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[360px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-2 w-full bg-rose-500" />
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Sign Out?</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                Are you sure you want to log out? Any unsaved changes might be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 mt-8">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl font-bold h-12 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLogout}
                className="flex-1 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold h-12 text-white border-none shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
              >
                Sign Out
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="px-4 -mt-8 max-w-7xl mx-auto w-full">
        {/* Treasury Card - Admin Only or modified for Customer */}
        {isAdmin && (
          <div className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/treasury')}
                className="lg:col-span-2 bg-[#1E293B] rounded-2xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:bg-primary transition-colors">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white/70">Total Balance</span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <div className="mb-8 px-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">{formatTime(new Date())} Latest Update</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Income</p>
                        <p className="font-bold text-sm text-emerald-400 truncate">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <ArrowDownRight className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Expense</p>
                        <p className="font-bold text-sm text-rose-400 truncate">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full -ml-24 -mb-24 blur-[60px]" />
              </motion.div>

              {/* Stats Cards Integrated into Desktop Grid */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 min-w-0"
                  >
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", stat.color.replace('blue', 'indigo'))}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg sm:text-xl font-bold text-slate-800 leading-none mb-1 truncate">{stat.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isAdmin && profile && (
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shrink-0">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{profile.name}</h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Account Role: {profile.role}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    profile.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {profile.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                    <p className="text-sm sm:text-base font-semibold text-slate-700 underline underline-offset-4 decoration-primary/20 decoration-2">{profile.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                    <p className="text-sm sm:text-base font-semibold text-slate-700 truncate">{profile.email}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 md:pb-8">
          {/* Quick List - Payments */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isAdmin ? 'Recent Transactions' : 'Billing History'}</h3>
              <button 
                onClick={() => navigate('/payments')} 
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {userPayments.length > 0 ? (
                userPayments.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        payment.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{payment.userName}</p>
                        <p className="text-[10px] text-slate-400 font-medium capitalize truncate">{payment.method} • {formatDate(payment.date)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-sm font-bold",
                        payment.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                      )}>Rs. {payment.amount}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">{payment.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-xs font-medium text-slate-400">No payment activity found</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick List - Requests */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isAdmin ? 'Live Requests' : 'Support Tickets'}</h3>
              <button 
                onClick={() => navigate('/requests')} 
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                {isAdmin ? 'Manage Board' : 'New Ticket'} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {userRequests.length > 0 ? (
                userRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{req.type}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      )}>{req.status}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/50 p-10 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">Everything is up to date</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
