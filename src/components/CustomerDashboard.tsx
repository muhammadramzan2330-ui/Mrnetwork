import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSystem } from '@/contexts/SystemContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
  CheckCircle2,
  LogOut,
  MessageSquare,
  Shield,
  Smartphone,
  MapPin,
  ExternalLink,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const { bills, settings, packages } = useSystem();
  const navigate = useNavigate();

  if (!profile) return null;

  const userBills = bills.filter(b => b.userId === profile.id);
  const currentBill = userBills
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())[0];
  
  const assignedPackage = packages.find(p => p.id === profile.packageId);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const supportNumber = settings?.easypaisaNumber || "03001234567"; // Fallback to settings or default

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Premium Gradient Header */}
      <div className="header-gradient pt-8 pb-32 px-4 sm:px-8 text-white relative overflow-hidden md:rounded-b-[2.5rem]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto relative z-10 gap-6">
          <div className="flex flex-col">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">M & Network // Customer Portal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome, {profile.name?.split(' ')[0]}</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              Membership ID: <span className="text-white font-bold opacity-100">{profile.uid?.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Connection Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <p className="text-sm font-bold text-white tracking-wide uppercase">Active</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 w-12 p-0 rounded-xl transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent opacity-50" />
      </div>

      <div className="px-4 sm:px-8 -mt-20 max-w-7xl mx-auto w-full relative z-20 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Account Status Card - Now with Dialog */}
          <Dialog>
            <DialogTrigger asChild nativeButton={false}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</CardTitle>
                    <Shield className="h-4 w-4 text-indigo-600/40 group-hover:text-indigo-600 transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-slate-900 uppercase">{profile.status || 'Verified'}</div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full", profile.status === 'active' ? "bg-emerald-500" : "bg-indigo-600")} />
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ID: {profile.uid?.slice(-6) || 'N/A'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 p-0 overflow-hidden text-slate-900">
              <div className="bg-indigo-600 p-8 text-white relative">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight">Account Intelligence</DialogTitle>
                  <DialogDescription className="text-white/60 text-xs font-medium">Detailed secure profile overview</DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <Badge className={cn("capitalize font-bold border-none", profile.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600")}>{profile.status}</Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                    <p className="text-xs font-extrabold text-slate-700">{formatDate(profile.createdAt) || 'May 2024'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Linked Mobile</p>
                      <p className="text-xs font-bold text-slate-700">{profile.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Service Area</p>
                      <p className="text-xs font-bold text-slate-700">Lahore District, Sector Z</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full cursor-pointer" onClick={() => navigate('/packages')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</CardTitle>
                <Package className="h-4 w-4 text-indigo-600/40 group-hover:text-indigo-600 transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900 truncate">
                  {assignedPackage?.name || profile.package || 'No plan assigned yet'}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", profile.status === 'active' ? "bg-emerald-500" : "bg-rose-500")} />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {assignedPackage ? `${assignedPackage.speed} Speed` : `Status: ${profile.status === 'active' ? 'Online' : 'Offline'}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full cursor-pointer flex flex-col" onClick={() => navigate('/payments')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Contact</CardTitle>
                <Phone className="h-4 w-4 text-indigo-600/40 group-hover:text-indigo-600 transition-colors" />
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="text-xl font-bold text-slate-900">{supportNumber}</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-9 text-[10px] font-bold gap-2"
                    onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${supportNumber}`, '_blank'); }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-lg h-9 text-[10px] font-bold gap-2 border-slate-200 text-slate-600"
                    onClick={(e) => { e.stopPropagation(); window.open(`tel:${supportNumber}`); }}
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className={cn(
              "shadow-lg rounded-2xl overflow-hidden hover:opacity-95 transition-all text-white border-none h-full cursor-pointer",
              currentBill?.status === 'unpaid' ? "bg-rose-500 shadow-rose-500/20" : "bg-indigo-600 shadow-indigo-600/20"
            )} onClick={() => navigate('/payments')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  {currentBill?.status === 'unpaid' ? 'Pending Balance' : 'Payment Status'}
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
                      <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest uppercase">ACCOUNT CLEAR</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden min-h-[400px]">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Billing History</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1 text-slate-400">Chronological transaction history</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl px-4"
                  onClick={() => navigate('/payments')}
                >
                  Full History
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {userBills.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {userBills.map((bill) => (
                      <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                            bill.status === 'paid' 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-900">Monthly Bill - {bill.month}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Due: {formatDate(bill.dueDate)}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-base font-black text-slate-900 tracking-tight">{formatCurrency(bill.amount)}</p>
                          <Badge className={cn(
                            "px-3 py-1 font-bold text-[9px] uppercase tracking-widest rounded-lg border-none",
                            bill.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <History className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Transaction Registry Empty</h3>
                    <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-4 font-medium">
                      Your billing history will appear here once your account has activity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden relative group h-full">
              <CardHeader className="bg-slate-50/50 py-8 px-8 relative overflow-hidden border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 relative z-10 flex items-center gap-3 text-indigo-600 uppercase tracking-widest text-[10px]">
                  <User className="w-4 h-4" />
                  Account Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="relative">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">Member Name</label>
                    <p className="text-slate-900 font-extrabold text-lg leading-tight">{profile.name}</p>
                    <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">Electronic Mail</label>
                    <p className="text-slate-900 font-semibold text-sm break-all">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">Access Level</label>
                    <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                      <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.1em] leading-none">{profile.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-14 rounded-2xl border border-slate-100 px-6 hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"
                    onClick={() => toast.info("Profile settings coming soon")}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Update Security</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
