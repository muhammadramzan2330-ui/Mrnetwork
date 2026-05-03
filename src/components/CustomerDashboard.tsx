import React from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Wifi
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CustomerDashboard() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="p-3 sm:p-4 space-y-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome, {profile.name?.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage your ISP subscription and view invoices.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 pr-5 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-auto">
          <div className="w-11 h-11 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-105">
            <Wifi className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1.5">Connection Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200" />
              <p className="text-sm font-bold text-slate-800 tracking-tight">Active Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-1">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Package</CardTitle>
              <Package className="h-4 w-4 text-primary/40" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-lg sm:text-2xl font-bold text-slate-800 truncate">{profile.package || 'Base 5Mbps'}</div>
              <p className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-primary/30" /> Renewed: Monthly
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscription</CardTitle>
              <Settings className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center gap-2">
                <div className="text-lg sm:text-2xl font-bold text-slate-800 capitalize">{profile.status}</div>
                <div className="bg-emerald-50 text-emerald-600 font-bold border-none rounded-lg px-2 py-0.5 text-[8px] uppercase tracking-widest">Valid</div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-wide">Verified Customer</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Contact</CardTitle>
              <Phone className="h-4 w-4 text-primary/40" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-lg sm:text-2xl font-bold text-slate-800 truncate">{profile.phone || 'N/A'}</div>
              <p className="text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-wide line-clamp-1">Support Contact Link</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-[#1E293B] border-none shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all h-full text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5">
              <CardTitle className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Wallet Due</CardTitle>
              <CreditCard className="h-4 w-4 text-white/30" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-lg sm:text-2xl font-bold tracking-tight">Rs. 0.00</div>
              <p className="text-[10px] text-primary/80 font-bold mt-2 uppercase tracking-widest">Next Bill: Cycle End</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-1 pb-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Invoicing History</CardTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Status of your service payments.</p>
                </div>
                <Button variant="ghost" className="text-primary hover:bg-primary/5 hover:text-primary font-bold text-xs gap-1 py-0 px-2 tracking-widest uppercase h-8">
                  Export PDF <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t border-slate-50">
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <CreditCard className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Clear Ledger</h3>
                <p className="text-slate-400 max-w-xs mx-auto mt-2 text-[11px] font-medium leading-relaxed">
                  Historical statements will generate here as cycles conclude.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-[#1E293B] text-white py-6 px-8 relative overflow-hidden">
              <CardTitle className="text-lg font-bold relative z-10">Subscriber Profile</CardTitle>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-800 transition-transform hover:rotate-6">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-6 pt-6">
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 transition-colors group-hover:text-primary">Master ID</label>
                  <p className="text-slate-700 font-bold text-sm tracking-tight">{profile.name}</p>
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 transition-colors group-hover:text-primary">Digital Contact</label>
                  <p className="text-slate-700 font-bold text-sm tracking-tight break-all">{profile.email}</p>
                </div>
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 transition-colors group-hover:text-primary">Member Tier</label>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-primary font-bold text-sm uppercase tracking-wider">{profile.role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
