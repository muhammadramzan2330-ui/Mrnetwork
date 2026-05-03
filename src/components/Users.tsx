import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Phone, MapPin, Calendar, Shield, ShieldOff, RefreshCw, Package, Edit2, Ban, Trash2, DollarSign, Wallet, ArrowRightLeft, UserCircle2, Smartphone, CreditCard, Eye, EyeOff, QrCode, Lock, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'motion/react';
import { useSystem } from '../contexts/SystemContext';
import { addDocument, updateDocument, deleteDocument, secondaryAuth } from '../services/firebase';
import { createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';

export default function Users() {
  const { users, packages, subdealers, settings, recordPayment } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [creating, setCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    packageId: '',
    phone: '',
    subdealerId: 'admin',
    pppoeUsername: '',
    pppoePassword: '',
  });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Name, Email and Password are required');
      return;
    }
    
    setCreating(true);
    try {
      // 1. Create Auth User using secondary instance
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        newUser.email, 
        newUser.password
      );
      
      const uid = userCredential.user.uid;

      // 2. Create Firestore Profile
      await addDocument('user', {
        uid: uid,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        pppoeUsername: newUser.pppoeUsername || newUser.email.split('@')[0],
        pppoePassword: newUser.pppoePassword || newUser.password,
        packageId: newUser.packageId,
        subdealerId: newUser.subdealerId,
        role: 'customer',
        status: 'active',
        balance: 0,
        walletBalance: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });

      // 3. Immediately sign out from secondary app to keep it clean
      await secondarySignOut(secondaryAuth);

      setNewUser({ 
        name: '', 
        email: '', 
        password: '', 
        packageId: '', 
        phone: '', 
        subdealerId: 'admin',
        pppoeUsername: '',
        pppoePassword: '',
      });
      setIsOpen(false);
      toast.success('Customer account created successfully');
    } catch (e: any) {
      console.error('Error creating user:', e);
      toast.error(e.message || 'Failed to create customer');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateDocument('user', editingUser.id, editingUser);
      setIsEditOpen(false);
      toast.success('User updated');
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const toggleStatus = async (user: any) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDocument('user', user.id, { status: newStatus });
      toast.info(`User ${newStatus}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this user permanently?')) {
      try {
        await deleteDocument('user', id);
        toast.success('User deleted');
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  const handleRenew = async () => {
    if (!renewTarget || !transactionId) return;
    const pkg = packages.find(p => p.id === renewTarget.packageId);
    if (!pkg) return;

    try {
      await recordPayment({
        userId: renewTarget.id,
        userName: renewTarget.name,
        amount: pkg.price,
        method: paymentMethod,
        reference: transactionId,
        screenshot: screenshot, // Simulated upload
        subdealerId: renewTarget.subdealerId || 'admin'
      });
      setIsRenewOpen(false);
      setTransactionId('');
      setScreenshot(null);
    } catch (e) {
      toast.error('Submission failed');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.pppoeUsername || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customers</h2>
          <p className="text-slate-500 text-xs font-medium">Manage and monitor client accounts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] hover:opacity-90 rounded-xl gap-2 h-11 text-sm font-bold px-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Add Customer
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[500px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">New Registration</DialogTitle>
                </DialogHeader>
                <p className="text-white/70 text-xs font-medium mt-1 uppercase tracking-widest">Client Onboarding</p>
              </div>
              <div className="p-8">
                <div className="grid gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                    <Input 
                      placeholder="e.g. Muhammad Ramzan" 
                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm focus:bg-white transition-all"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                      <Input 
                        type="email"
                        placeholder="customer@isp.com" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm focus:bg-white transition-all"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Account Password</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm focus:bg-white transition-all"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                    <Input 
                      placeholder="+92 3XX XXXXXXX" 
                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm focus:bg-white transition-all"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">PPPoE Credentials</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Username"
                        className="rounded-xl bg-slate-50 border-slate-200 h-11 px-4 font-semibold text-xs"
                        value={newUser.pppoeUsername}
                        onChange={(e) => setNewUser({ ...newUser, pppoeUsername: e.target.value })}
                      />
                      <Input 
                        placeholder="Password"
                        type="password"
                        className="rounded-xl bg-slate-50 border-slate-200 h-11 px-4 font-semibold text-xs"
                        value={newUser.pppoePassword}
                        onChange={(e) => setNewUser({ ...newUser, pppoePassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Package</Label>
                      <Select onValueChange={(val: string) => setNewUser({ ...newUser, packageId: val })}>
                        <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm">
                          <SelectValue placeholder="Choose Plan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1">
                          {packages.map(p => (
                            <SelectItem key={p.id} value={p.id} className="font-semibold text-slate-700 rounded-lg py-2.5 cursor-pointer">{p.name} - Rs.{p.price}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Branch</Label>
                      <Select onValueChange={(val: string) => setNewUser({ ...newUser, subdealerId: val })}>
                        <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm">
                          <SelectValue placeholder="Choose Dealer" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1">
                          <SelectItem value="admin" className="font-semibold text-slate-700 rounded-lg py-2.5 cursor-pointer">Main Branch</SelectItem>
                          {subdealers.map(s => (
                            <SelectItem key={s.id} value={s.id} className="font-semibold text-slate-700 rounded-lg py-2.5 cursor-pointer">{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddUser}
                    disabled={creating}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl mt-4 h-14 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register New User'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, username or ID..."
          className="pl-12 rounded-2xl border-slate-100 bg-white h-12 text-sm font-medium shadow-sm transition-all focus:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
        {filteredUsers.map((user, i) => {
          const pkg = packages.find(p => p.id === user.packageId);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <UserCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-base sm:text-lg truncate">{user.name}</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">@{user.pppoeUsername}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-50 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl w-48 p-1">
                    <DropdownMenuItem 
                      onClick={() => { setEditingUser(user); setIsEditOpen(true); }}
                      className="gap-3 text-[11px] font-bold py-2.5 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-primary" /> Modify Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleStatus(user)}
                      className="gap-3 text-[11px] font-bold py-2.5 rounded-lg cursor-pointer"
                    >
                      {user.status === 'active' ? <Ban className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />} 
                      {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(user.id)}
                      className="gap-3 text-[11px] font-bold py-2.5 rounded-lg cursor-pointer text-rose-500 mt-1 bg-rose-50/50"
                    >
                      <Trash2 className="w-4 h-4" /> Permanent Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-50/30 p-3 sm:p-4 rounded-xl border border-emerald-50/50">
                  <p className="text-emerald-600/60 text-[9px] font-bold uppercase tracking-widest mb-1">Credit</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-600">Rs.{user.walletBalance?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-rose-50/30 p-3 sm:p-4 rounded-xl border border-rose-50/50">
                  <p className="text-rose-600/60 text-[9px] font-bold uppercase tracking-widest mb-1">Dues</p>
                  <p className="text-base sm:text-lg font-bold text-rose-600">Rs.{user.balance?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex flex-wrap gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-600">{pkg?.name || 'No Active Plan'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-600">{formatDate(user.expiryDate, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50/80 px-3 py-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold font-mono text-slate-600">
                      {showPasswords[user.id] ? user.pppoePassword : '••••••••'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowPasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                    className="p-1 hover:bg-white rounded-lg transition-colors shadow-sm"
                  >
                    {showPasswords[user.id] ? <EyeOff className="w-3.5 h-3.5 text-primary" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                <Badge className={cn(
                  "rounded-full font-bold text-[10px] px-4 py-1 border-none shadow-none uppercase tracking-widest",
                  user.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {user.status}
                </Badge>
                <Button 
                  onClick={() => { setRenewTarget(user); setIsRenewOpen(true); }}
                  className="h-9 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-[11px] font-bold uppercase tracking-widest shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  Renew Plan
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          {editingUser && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-slate-900 p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Edit Client</DialogTitle>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Profile Management</p>
                </DialogHeader>
              </div>
              <div className="p-8">
                <div className="grid gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                    <Input 
                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                    <Input 
                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-sm"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-emerald-500/60 ml-1">Wallet Amount</Label>
                      <Input 
                        type="number"
                        className="rounded-xl bg-emerald-50/20 border-emerald-100 h-12 px-4 font-bold text-emerald-600"
                        value={editingUser.walletBalance}
                        onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-rose-500/60 ml-1">Due Amount</Label>
                      <Input 
                        type="number"
                        className="rounded-xl bg-rose-50/20 border-rose-100 h-12 px-4 font-bold text-rose-600"
                        value={editingUser.balance}
                        onChange={(e) => setEditingUser({ ...editingUser, balance: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateUser}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl mt-4 h-14 font-bold text-base shadow-lg shadow-primary/20"
                  >
                    Confirm Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Package Dialog */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          {renewTarget && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-primary p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Service Renewal</DialogTitle>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Transaction Portal</p>
                  </DialogHeader>
                  <div className="mt-8 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Payable Amount</p>
                      <h3 className="text-3xl font-extrabold text-white">Rs.{packages.find(p => p.id === renewTarget.packageId)?.price || '0'}</h3>
                    </div>
                    <Badge className="bg-white/10 text-white border-none py-1 px-3 text-[10px] font-bold uppercase tracking-widest mb-1">Inclusive Tax</Badge>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              </div>
              
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['easypaisa', 'jazzcash', 'cash'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          paymentMethod === method ? "border-primary bg-primary/5 shadow-inner" : "border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200"
                        )}
                      >
                        {method === 'easypaisa' || method === 'jazzcash' ? (
                          <Smartphone className={cn("w-5 h-5", paymentMethod === method ? "text-primary" : "text-slate-300")} />
                        ) : (
                          <Wallet className={cn("w-5 h-5", paymentMethod === method ? "text-primary" : "text-slate-300")} />
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-tight capitalize text-center leading-none">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {paymentMethod === 'cash' ? 'Branch Details' : 'Payment QR'}
                    </p>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-slate-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                  
                  {paymentMethod !== 'cash' ? (
                    <div className="flex justify-center flex-col items-center gap-4">
                      <div className="p-3 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${paymentMethod === 'easypaisa' ? (settings?.easypaisaNumber || '03001234567') : (settings?.jazzcashNumber || '03451234567')}`}
                          alt="Payment QR"
                          className="w-32 h-32"
                        />
                      </div>
                      <div className="w-full space-y-2">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Account</span>
                          <span className="text-sm font-bold text-primary tracking-tight">
                            {paymentMethod === 'easypaisa' ? (settings?.easypaisaNumber || '03001234567') : (settings?.jazzcashNumber || '03451234567')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Name</span>
                          <span className="text-[11px] font-bold text-slate-700">
                            {paymentMethod === 'easypaisa' ? (settings?.easypaisaName || 'Muhammad Ramzan') : (settings?.jazzcashName || 'Muhammad Ramzan')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 px-4 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Visit Main Collection Center</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-[200px] mx-auto mt-1">Available 09:00 AM to 09:00 PM for manual payments</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirmation TrxID</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input 
                        placeholder="11-digit Transaction ID"
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 pl-11 font-bold text-base tracking-widest focus:bg-white transition-all"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Proof Upload (Optional)</Label>
                    <div className="relative group">
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setScreenshot(file.name);
                        }}
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 py-3 font-semibold text-xs cursor-pointer group-hover:bg-slate-100"
                      />
                      <Download className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                    {screenshot && <p className="text-[10px] font-bold text-emerald-600 ml-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {screenshot} added</p>}
                  </div>

                  <Button 
                    onClick={handleRenew}
                    disabled={!transactionId}
                    className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl h-14 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2"
                  >
                    Confirm & Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
