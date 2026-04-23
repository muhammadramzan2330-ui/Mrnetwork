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

export default function Dashboard() {
  const navigate = useNavigate();
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

  const stats = [
    { label: 'Active', value: activeUsers.length.toString(), icon: UserCheck, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Dealers', value: subdealers.length.toString(), icon: Store, color: 'bg-blue-100 text-blue-600' },
    { label: 'Plans', value: packages.length.toString(), icon: Package, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending', value: pendingRequests.length.toString(), icon: Activity, color: 'bg-amber-100 text-amber-600' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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
            <h1 className="text-xl font-black tracking-tight">Admin Console</h1>
          </div>
          <div className="flex items-center gap-3">
            {headerActions.map((action, i) => (
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
              Are you sure you want to logout from the admin panel?
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

      {/* Treasury Card */}
      <div className="px-4 mt-3 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/treasury')}
          className="treasury-gradient rounded-[32px] p-4 shadow-2xl shadow-purple-200 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Main Vault</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
            
            <div className="mb-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">AVAILABLE BALANCE</p>
              <h2 className="text-2xl font-black leading-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/50">Today In</p>
                  <p className="font-black text-xs">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-rose-300" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/50">Today Out</p>
                  <p className="font-black text-xs">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-3 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-black text-text-main leading-none mb-0.5">{stat.value}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Sections */}
      <div className="px-4 space-y-5">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Recent Ledger</h3>
            <button onClick={() => navigate('/payments')} className="text-[10px] font-black text-primary uppercase tracking-widest">Details</button>
          </div>
          <div className="space-y-2.5">
            {payments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="bg-bg-gray/40 p-4 rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                    payment.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  )}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-main">{payment.userName}</p>
                    <p className="text-[10px] text-text-muted font-bold capitalize">{payment.method} • {formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    payment.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                  )}>+ Rs. {payment.amount}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Live Priority</h3>
            <button onClick={() => navigate('/requests')} className="text-[10px] font-black text-primary uppercase tracking-widest">Board</button>
          </div>
          <div className="space-y-2.5 pb-6">
            {pendingRequests.length > 0 ? (
              pendingRequests.slice(0, 2).map((req) => (
                <div key={req.id} className="bg-bg-gray/40 p-4 rounded-[24px] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-main">{req.userName}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{req.type} Plan</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              ))
            ) : (
              <div className="bg-bg-gray/40 p-8 rounded-[32px] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                </div>
                <p className="text-text-muted text-[11px] font-black uppercase tracking-widest">All tasks cleared</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
