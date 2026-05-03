import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSystem } from '@/contexts/SystemContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Package, 
  Settings, 
  Phone, 
  CreditCard, 
  Calendar,
  ChevronRight,
  Wifi,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const { bills } = useSystem();

  if (!profile) return null;

  const currentBill = bills
    .filter(b => b.userId === profile.id)
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())[0];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-10">
      {/* Premium Gradient Header */}
      <div className="header-gradient pt-8 pb-20 px-4 sm:px-8 text-white relative overflow-hidden md:rounded-t-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto relative z-10 gap-6">
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Subscriber Terminal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome, {profile.name?.split(' ')[0]}</h1>
            <p className="text-white/80 text-sm mt-2 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              Billing Cycle: Monthly
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Connection</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <p className="text-sm font-bold text-white tracking-wide uppercase">Active</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
      </div>

      <div className="px-4 sm:px-8 -mt-10 max-w-7xl mx-auto w-full relative z-20 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</CardTitle>
                <Package className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900 truncate">{profile.package || 'Standard 5Mbps'}</div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status: Verified</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</CardTitle>
                <Settings className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900 uppercase">{profile.status}</div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Plan: Unlimited</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Node</CardTitle>
                <Phone className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900">{profile.phone || 'N/A'}</div>
                <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-wider">Emergency Line Active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className={cn(
              "shadow-lg rounded-2xl overflow-hidden hover:opacity-95 transition-all text-white border-none h-full",
              currentBill?.status === 'unpaid' ? "bg-rose-500 shadow-rose-500/20" : "bg-primary shadow-primary/20"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  {currentBill?.status === 'unpaid' ? 'Pending Dues' : 'Current Status'}
                </CardTitle>
                <CreditCard className="h-4 w-4 text-white/40" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {currentBill ? formatCurrency(currentBill.amount) : 'Rs. 0.00'}
                </div>
                <div className="mt-4">
                  {currentBill?.status === 'unpaid' ? (
                    <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded inline-flex">
                      <AlertCircle className="w-3 h-3 text-white" />
                      <p className="text-[10px] text-white font-black uppercase tracking-widest">DUE: {formatDate(currentBill.dueDate)}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-400/10 px-2.5 py-1 rounded inline-flex">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">ACCOUNT CLEAR</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden h-full">
              <CardHeader className="p-6 border-b border-slate-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Billing History</CardTitle>
                    <p className="text-xs text-slate-500 mt-1">Review your recent transaction logs</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 font-bold text-xs gap-2">
                    Report Issue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bills.filter(b => b.userId === profile.id).length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {bills.filter(b => b.userId === profile.id).map((bill) => (
                      <div key={bill.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            bill.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-rose-50 border-rose-100 text-rose-500"
                          )}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Monthly Bill - {bill.month}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Due Date: {formatDate(bill.dueDate)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{formatCurrency(bill.amount)}</p>
                          <Badge variant={bill.status === 'paid' ? 'outline' : 'destructive'} className={cn(
                            "text-[8px] font-black uppercase tracking-widest h-5",
                            bill.status === 'paid' && "border-emerald-200 text-emerald-600 bg-emerald-50"
                          )}>
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50/30">
                    <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                      <CreditCard className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No Transactions Found</h3>
                    <p className="text-xs text-slate-500 max-w-[240px] mx-auto mt-2 font-medium">
                      Your billing history will appear here once your account has activity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden relative group">
              <CardHeader className="bg-slate-50 py-6 px-6 relative overflow-hidden border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 relative z-10 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subscriber ID</label>
                    <p className="text-slate-900 font-bold text-base leading-tight">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Communication Channel</label>
                    <p className="text-slate-900 font-medium text-sm break-all">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Security Tier</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-primary font-bold text-xs uppercase tracking-widest leading-none">{profile.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
