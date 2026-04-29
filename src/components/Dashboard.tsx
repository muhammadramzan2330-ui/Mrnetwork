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
    { label: 'Plans', value: packages.length.toString(), icon: Package, color: 'bg-purple-100 text-purple-600' },
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
    <div className="flex flex-col min-h-full bg-white pb-0">
      {/* Header with Gradient */}
      <div className="header-gradient pt-2 pb-5 px-4 text-white relative">
        <div className="flex justify-between items-center">
          <div className="flex flex-col -space-y-1">
            <p className="text-[10px] font-black opacity-70 uppercase tracking-[0.2em]">ISP MANAGER</p>
            <h1 className="text-xl font-black tracking-tight">{isAdmin ? 'Admin Console' : 'Customer Portal'}</h1>
          </div>
          <div className="flex items-center gap-3">
            {headerActions.filter(a => isAdmin || a.label === 'Logout').map((action, i) => (
              <button 
                key={i} 
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                className="hover:opacity-70 transition-opacity p-1"
              >
                <action.icon className="w-5 h-5 stroke-[2.5px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[320px] rounded-[30px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Sign Out?</DialogTitle>
            <DialogDescription className="text-xs font-medium text-text-muted">
              Are you sure you want to logout from the {isAdmin ? 'admin panel' : 'portal'}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 rounded-xl font-bold h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              className="flex-1 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold h-11 text-white border-none"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treasury Card - Admin Only or modified for Customer */}
      {isAdmin && (
        <div className="px-4 mt-3 mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/treasury')}
              className="lg:col-span-2 treasury-gradient rounded-[32px] p-6 shadow-2xl shadow-purple-200 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white/80">Main Vault</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </div>
                
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">AVAILABLE BALANCE</p>
                  <h2 className="text-3xl font-black leading-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-0.5">Today In</p>
                      <p className="font-black text-sm truncate">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <ArrowDownRight className="w-5 h-5 text-rose-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-0.5">Today Out</p>
                      <p className="font-black text-sm truncate">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl" />
            </motion.div>

            {/* Stats Cards Integrated into Desktop Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-4 min-w-0"
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-black text-text-main leading-none mb-1 truncate">{stat.value}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isAdmin && profile && (
        <div className="px-4 mt-3 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-[32px] p-8 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                    <Users className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black leading-tight tracking-tight">{profile.name}</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{profile.role}</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  {profile.status} Account
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">PHONE NUMBER</p>
                  <p className="text-base font-bold tracking-tight">{profile.phone || 'Not added'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">ACCOUNT EMAIL</p>
                  <p className="text-base font-bold tracking-tight truncate">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      )}
      <div className="px-4 space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 pb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{isAdmin ? 'Recent Ledger' : 'My Payments'}</h3>
            <button onClick={() => navigate('/payments')} className="text-[10px] font-black text-primary uppercase tracking-widest">Details</button>
          </div>
          <div className="space-y-3">
            {userPayments.length > 0 ? (
              userPayments.slice(0, 4).map((payment) => (
                <div key={payment.id} className="bg-bg-gray/40 p-5 rounded-[28px] flex items-center justify-between border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0",
                      payment.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    )}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-text-main truncate">{payment.userName}</p>
                      <p className="text-[10px] text-text-muted font-bold capitalize truncate">{payment.method} • {formatDate(payment.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-sm font-black",
                      payment.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                    )}>+ Rs. {payment.amount}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{payment.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-bg-gray/40 p-8 rounded-[32px] text-center">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No recent payments</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{isAdmin ? 'Live Priority' : 'My Requests'}</h3>
            <button onClick={() => navigate('/requests')} className="text-[10px] font-black text-primary uppercase tracking-widest">{isAdmin ? 'Board' : 'New Request'}</button>
          </div>
          <div className="space-y-3">
            {userRequests.length > 0 ? (
              userRequests.slice(0, 4).map((req) => (
                <div key={req.id} className="bg-bg-gray/40 p-5 rounded-[28px] flex items-center justify-between border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-text-main truncate">{req.type}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{formatDate(req.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full",
                      req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    )}>{req.status}</span>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-bg-gray/40 p-10 rounded-[32px] flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  </div>
                </div>
                <p className="text-text-muted text-[11px] font-black uppercase tracking-widest">No active requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
