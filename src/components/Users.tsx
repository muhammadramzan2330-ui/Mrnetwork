import React, { useState } from 'react';
import { Plus, Search, XCircle, MoreVertical, Phone, MapPin, Calendar, Shield, ShieldOff, RefreshCw, Package, Edit2, Ban, Trash2, DollarSign, Wallet, ArrowRightLeft, UserCircle2, Smartphone, CreditCard, Eye, EyeOff, QrCode, Lock, CheckCircle2, Download, Loader2, History as HistoryIcon, MessageSquare } from 'lucide-react';
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
import { updateDocument, deleteDocument, secondaryAuth, createUserProfile } from '../services/firebase';
import { createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/services/pdfService';

export default function Users() {
  const { users, packages, subdealers, settings, recordPayment, bills, markBillAsPaid, payments, generateManualBill } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [billingFilter, setBillingFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'expired'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [ledgerUser, setLedgerUser] = useState<any>(null);
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
      const selectedPkg = packages.find(p => p.id === newUser.packageId);

      // 2. Create Firestore Profile with UID as Document ID
      await createUserProfile(uid, {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        pppoeUsername: newUser.pppoeUsername || newUser.email.split('@')[0],
        pppoePassword: newUser.pppoePassword || newUser.password,
        packageId: newUser.packageId,
        packageName: selectedPkg?.name || '',
        packageSpeed: selectedPkg?.speed || '',
        packagePrice: selectedPkg?.price || 0,
        subdealerId: newUser.subdealerId,
        role: 'customer',
        status: 'active',
        balance: 0,
        walletBalance: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

  const handleAssignPackage = async () => {
    if (!assignTarget || !selectedPackageId) return;
    const pkg = packages.find(p => p.id === selectedPackageId);
    if (!pkg) return;

    try {
      await updateDocument('user', assignTarget.id, {
        packageId: pkg.id,
        packageName: pkg.name,
        packageSpeed: pkg.speed,
        packagePrice: pkg.price
      });
      setIsAssignOpen(false);
      setSelectedPackageId('');
      toast.success(`Package ${pkg.name} assigned to ${assignTarget.name}`);
    } catch (e) {
      toast.error('Assignment failed');
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

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchLower) || 
      (u.pppoeUsername || '').toLowerCase().includes(searchLower) ||
      (u.phone || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.packageName || '').toLowerCase().includes(searchLower) ||
      (u.status || '').toLowerCase().includes(searchLower);

    const matchesBilling = billingFilter === 'all' || u.billingStatus === billingFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return u.status !== 'pending' && matchesSearch && matchesBilling && matchesStatus;
  });

  const pendingUsers = users.filter(u => u.status === 'pending');

  const handleApprove = async (id: string) => {
    try {
      await updateDocument('user', id, { status: 'active' });
      toast.success('Account approved successfully');
    } catch (e) {
      toast.error('Failed to approve account');
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Reject this registration?')) {
      try {
        await updateDocument('user', id, { status: 'rejected' });
        toast.info('Account rejected');
      } catch (e) {
        toast.error('Failed to reject account');
      }
    }
  };

  const sendWhatsAppReminder = (user: any) => {
    const phone = user.phone || '';
    if (!phone) {
      toast.error('No phone number found for this user');
      return;
    }
    
    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Dear ${user.name}, your internet bill is due. Please pay on time. Total Due: Rs. ${user.balance || 0}`);
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Sticky Top Header Section */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 pt-6 pb-4 shadow-sm transition-all duration-300">
        <div className="px-4 sm:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Customers</h2>
              <div className="flex items-center gap-2 mt-1.5 font-mono">
                <p className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] leading-none">Database active</p>
                {users.filter(u => u.billingStatus === 'unpaid').length > 0 && (
                  <Badge className="bg-rose-500 text-white border-none text-[8px] font-black h-4 px-1.5 rounded-md uppercase tracking-tighter shadow-sm shadow-rose-500/20">
                    {users.filter(u => u.billingStatus === 'unpaid').length} UNPAID
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 h-11 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> New Subscriber
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
                  <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="header-gradient p-8 text-white relative">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">Subscriber Registration</DialogTitle>
                      </DialogHeader>
                      <p className="text-white/60 text-[11px] font-bold mt-2 uppercase tracking-widest">Create a new customer account</p>
                    </div>
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                          <Input 
                            placeholder="e.g. MUHAMMAD RAMZAN" 
                            className="input-modern px-4"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                            <Input 
                              type="email"
                              placeholder="customer@email.com" 
                              className="input-modern px-4"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                            <Input 
                              type="password" 
                              placeholder="••••••••"
                              className="input-modern px-4"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile Number</Label>
                          <Input 
                            placeholder="+92 3XX XXXXXXX" 
                            className="input-modern px-4"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">PPPoE Credentials</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input 
                              placeholder="Username"
                              className="input-modern h-12 text-xs px-4"
                              value={newUser.pppoeUsername}
                              onChange={(e) => setNewUser({ ...newUser, pppoeUsername: e.target.value })}
                            />
                            <Input 
                              placeholder="Password"
                              type="password"
                              className="input-modern h-12 text-xs px-4"
                              value={newUser.pppoePassword}
                              onChange={(e) => setNewUser({ ...newUser, pppoePassword: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Plan</Label>
                            <Select onValueChange={(val: string) => setNewUser({ ...newUser, packageId: val })}>
                              <SelectTrigger className="input-modern w-full px-4 h-12">
                                <SelectValue placeholder="Select Plan" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                                {packages.map(p => (
                                  <SelectItem key={p.id} value={p.id} className="font-bold text-slate-900 rounded-lg py-3 cursor-pointer hover:bg-slate-50 uppercase text-[10px] tracking-widest">{p.name} • RS.{p.price}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sub Dealer</Label>
                            <Select onValueChange={(val: string) => setNewUser({ ...newUser, subdealerId: val })}>
                              <SelectTrigger className="input-modern w-full px-4 h-12">
                                <SelectValue placeholder="Select Dealer" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                                <SelectItem value="admin" className="font-bold text-slate-900 rounded-lg py-3 cursor-pointer hover:bg-slate-50 uppercase text-[10px] tracking-widest">Main Admin</SelectItem>
                                {subdealers.map(s => (
                                  <SelectItem key={s.id} value={s.id} className="font-bold text-slate-900 rounded-lg py-3 cursor-pointer hover:bg-slate-50 uppercase text-[10px] tracking-widest">{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button 
                          onClick={handleAddUser}
                          disabled={creating}
                          className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                        >
                          {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2">
              <div className="relative group w-full md:max-w-xl">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 group-focus-within:border-indigo-100 transition-all">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  placeholder="Search Customers (Name, Phone, Email, Package)..."
                  className="input-modern pl-14 pr-12 h-14 text-sm font-bold border-slate-200 bg-white shadow-md focus:shadow-lg focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-2xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 ml-auto">
                <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 shadow-inner">
                  {(['all', 'active', 'suspended', 'expired'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        statusFilter === filter 
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/80"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 shadow-inner">
                  {(['all', 'paid', 'unpaid'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBillingFilter(filter)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        billingFilter === filter 
                          ? (filter === 'unpaid' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-indigo-600 text-white shadow-md shadow-indigo-500/20")
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/80"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6">
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredUsers.map((user, i) => {
              const pkg = packages.find(p => p.id === user.packageId);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col relative">
                    <div className="p-6 pb-4 flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                          <UserCircle2 className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate tracking-tight">{user.name}</h4>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate mt-0.5">@{user.pppoeUsername}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-50 rounded-lg">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 bg-white shadow-xl w-48 p-1">
                          {user.billingStatus === 'unpaid' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => {
                                  const unpaidBill = bills.find(b => b.userId === user.id && b.status === 'unpaid');
                                  if (unpaidBill) markBillAsPaid(unpaidBill.id);
                                }}
                                className="gap-2 text-xs font-black py-3 rounded-lg cursor-pointer uppercase tracking-wider text-emerald-600 hover:bg-emerald-50"
                              >
                                <DollarSign className="w-4 h-4" /> Resolve Bill
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => sendWhatsAppReminder(user)}
                                className="gap-2 text-xs font-black py-3 rounded-lg cursor-pointer uppercase tracking-wider text-green-600 hover:bg-green-50"
                              >
                                <MessageSquare className="w-4 h-4" /> WhatsApp Reminder
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => generateManualBill(user.id)}
                            className="gap-2 text-[10px] font-bold py-3 rounded-lg cursor-pointer uppercase tracking-wider text-slate-600 hover:text-indigo-600"
                          >
                            <CreditCard className="w-4 h-4" /> Generate Manual Bill
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setAssignTarget(user); setIsAssignOpen(true); }}
                            className="gap-2 text-[10px] font-bold py-3 rounded-lg cursor-pointer uppercase tracking-wider text-slate-600 hover:text-primary"
                          >
                            <Package className="w-4 h-4" /> Assign Package
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setLedgerUser(user); setIsLedgerOpen(true); }}
                            className="gap-2 text-[10px] font-bold py-3 rounded-lg cursor-pointer uppercase tracking-wider text-slate-600 hover:text-primary"
                          >
                            <HistoryIcon className="w-4 h-4" /> Billing Ledger
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setEditingUser(user); setIsEditOpen(true); }}
                            className="gap-2 text-[10px] font-bold py-3 rounded-lg cursor-pointer uppercase tracking-wider text-slate-600 hover:text-primary"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleStatus(user)}
                            className="gap-2 text-[10px] font-bold py-3 rounded-lg cursor-pointer uppercase tracking-wider text-slate-600"
                          >
                            {user.status === 'active' ? <Ban className="w-4 h-4 text-orange-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />} 
                            {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </DropdownMenuItem>
                          <div className="h-px bg-slate-50 my-1" />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)}
                            className="gap-2 text-[10px] font-bold py-3 rounded-lg cursor-pointer text-rose-500 uppercase tracking-widest hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="px-6 grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <p className="text-emerald-600/60 text-[8px] font-bold uppercase tracking-widest mb-1 leading-none">Wallet</p>
                        <p className="text-sm font-extrabold text-emerald-600 leading-none">RS.{user.walletBalance?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <p className="text-rose-600/60 text-[8px] font-bold uppercase tracking-widest mb-1 leading-none">Balance</p>
                        <p className="text-sm font-extrabold text-rose-600 leading-none">RS.{user.balance?.toLocaleString() || '0'}</p>
                      </div>
                    </div>

                    <div className="px-6 space-y-3 mb-6">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{pkg?.name || 'NO PLAN'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{formatDate(user.expiryDate, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[10px] font-mono text-slate-500 font-bold overflow-hidden">
                            {showPasswords[user.id] ? user.pppoePassword : '••••••••'}
                          </span>
                        </div>
                        <button 
                          onClick={() => setShowPasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                          className="p-1 hover:bg-white rounded-lg transition-all"
                        >
                          {showPasswords[user.id] ? <EyeOff className="w-3.5 h-3.5 text-primary" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Badge className={cn(
                          "rounded-lg font-bold text-[8px] px-2 py-1 border-none uppercase tracking-widest transition-colors",
                          user.status === 'active' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : 
                          user.status === 'suspended' ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : 
                          "bg-orange-500 text-white shadow-lg shadow-orange-200"
                        )}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1.5 ml-auto">
                        <Button 
                          onClick={() => toggleStatus(user)}
                          variant="ghost"
                          className={cn(
                            "h-9 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all gap-1.5",
                            user.status === 'active' 
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white" 
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          )}
                        >
                          {user.status === 'active' ? <Ban className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                          {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </Button>
                        <Button 
                          onClick={() => { setRenewTarget(user); setIsRenewOpen(true); }}
                          className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-black uppercase tracking-widest shadow-sm transition-all shadow-indigo-100"
                        >
                          Renew
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm mx-4 sm:mx-0">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-slate-200" />
             </div>
             <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">No results found</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Try searching with different keywords</p>
             <Button 
               variant="link" 
               onClick={() => setSearchTerm('')}
               className="mt-4 text-indigo-600 font-extrabold uppercase text-[10px] tracking-[0.2em]"
             >
               Clear all filters
             </Button>
          </div>
        )}
      </div>

      {/* Assign Package Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
          {assignTarget && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-slate-50 p-8 border-b border-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight">Assign Package</DialogTitle>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Select a plan for {assignTarget.name}</p>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Plan</Label>
                    <Select 
                      value={selectedPackageId}
                      onValueChange={setSelectedPackageId}
                    >
                      <SelectTrigger className="input-modern w-full px-4 h-12">
                        <SelectValue placeholder="Choose a package" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                        {packages.map(p => (
                          <SelectItem key={p.id} value={p.id} className="font-bold text-slate-900 rounded-lg py-3 cursor-pointer hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                            {p.name} • {p.speed} • RS.{p.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedPackageId && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Package</span>
                          <span className="text-xs font-bold text-indigo-600 uppercase">{packages.find(p => p.id === selectedPackageId)?.name}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speed</span>
                          <span className="text-xs font-bold text-indigo-600 uppercase">{packages.find(p => p.id === selectedPackageId)?.speed}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
                          <span className="text-xs font-bold text-indigo-600 uppercase">Rs. {packages.find(p => p.id === selectedPackageId)?.price}</span>
                       </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleAssignPackage}
                    disabled={!selectedPackageId}
                    className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl"
                  >
                    Assign Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog - Light */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
          {editingUser && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-slate-50 p-8 border-b border-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight">Edit Subscriber</DialogTitle>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Update customer information</p>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                    <Input 
                      className="input-modern"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile Number</Label>
                    <Input 
                      className="input-modern"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Assigned Plan</Label>
                    <Select 
                      value={editingUser.packageId}
                      onValueChange={(val: string) => setEditingUser({ ...editingUser, packageId: val })}
                    >
                      <SelectTrigger className="input-modern w-full px-4 h-12">
                        <SelectValue placeholder="Select Plan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                        {packages.map(p => (
                          <SelectItem key={p.id} value={p.id} className="font-bold text-slate-900 rounded-lg py-3 cursor-pointer hover:bg-slate-50 uppercase text-[10px] tracking-widest">{p.name} • RS.{p.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 ml-1">Wallet Balance</Label>
                      <Input 
                        type="number"
                        className="input-modern border-emerald-100 focus:border-emerald-500 text-emerald-600 font-bold"
                        value={editingUser.walletBalance}
                        onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-rose-500 ml-1">Remaining Balance</Label>
                      <Input 
                        type="number"
                        className="input-modern border-rose-100 focus:border-rose-500 text-rose-600 font-bold"
                        value={editingUser.balance}
                        onChange={(e) => setEditingUser({ ...editingUser, balance: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateUser}
                    className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Package Dialog - Light */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
          {renewTarget && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="header-gradient p-10 text-white relative">
                <div className="relative z-10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">Account Renewal</DialogTitle>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Process payment and renew account</p>
                  </DialogHeader>
                  <div className="mt-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Total Amount</p>
                    <h3 className="text-4xl font-extrabold tracking-tight">RS.{packages.find(p => p.id === renewTarget.packageId)?.price || '0'}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transfer Gateway</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['easypaisa', 'jazzcash', 'cash'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group relative overflow-hidden h-24 justify-center",
                          paymentMethod === method ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        {method === 'easypaisa' || method === 'jazzcash' ? (
                          <Smartphone className={cn("w-6 h-6 transition-colors", paymentMethod === method ? "text-primary" : "text-slate-300")} />
                        ) : (
                          <Wallet className={cn("w-6 h-6 transition-colors", paymentMethod === method ? "text-primary" : "text-slate-300")} />
                        )}
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest transition-colors", paymentMethod === method ? "text-primary" : "text-slate-400")}>{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl space-y-6 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {paymentMethod === 'cash' ? 'LOCAL UPLINK' : 'PAYMENT DETAILS'}
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">SECURE</span>
                    </div>
                  </div>
                  
                  {paymentMethod !== 'cash' ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1E3A8A&data=${paymentMethod === 'easypaisa' ? (settings?.easypaisaNumber || '03001234567') : (settings?.jazzcashNumber || '03451234567')}`}
                          alt="Payment QR"
                          className="w-32 h-32"
                        />
                      </div>
                      <div className="w-full space-y-3">
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 group">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ACCOUNT</span>
                          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                            {paymentMethod === 'easypaisa' ? (settings?.easypaisaNumber || '03001234567') : (settings?.jazzcashNumber || '03451234567')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 group">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NAME</span>
                          <span className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">
                            {paymentMethod === 'easypaisa' ? (settings?.easypaisaName || 'MUHAMMAD RAMZAN') : (settings?.jazzcashName || 'MUHAMMAD RAMZAN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 px-4 bg-white rounded-xl border border-slate-100 text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/10">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Physical Payment</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Visit central office for cash payment</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Transaction ID</Label>
                    <div className="relative group">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="TRX ID (e.g. 12345678901)"
                        className="input-modern pl-12 h-14 text-base font-extrabold tracking-tight"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Proof of Transfer (Optional)</Label>
                    <Input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setScreenshot(file.name);
                      }}
                      className="input-modern h-12 py-3 px-4 text-[10px] uppercase font-bold text-slate-400 cursor-pointer file:bg-slate-100 file:text-slate-600 file:border-none file:rounded file:px-2 file:py-0.5 file:mr-4 file:font-bold file:text-[9px]"
                    />
                    {screenshot && <p className="text-[9px] font-bold text-emerald-500 ml-1 flex items-center gap-1 uppercase tracking-widest"><CheckCircle2 className="w-3 h-3" /> Proof Attached: {screenshot}</p>}
                  </div>

                  <Button 
                    onClick={handleRenew}
                    disabled={!transactionId}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-100 mt-4 uppercase tracking-widest"
                  >
                    Process Renewal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Financial Ledger Dialog */}
      <Dialog open={isLedgerOpen} onOpenChange={setIsLedgerOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
          {ledgerUser && (
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="header-gradient p-8 text-white relative">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight">Financial Ledger</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-4 mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserCircle2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate text-base">{ledgerUser.name}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{ledgerUser.pppoeUsername}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Wallet Balance</span>
                    </div>
                    <p className="text-xl font-black text-emerald-600 tracking-tight">RS.{ledgerUser.walletBalance?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3 h-3 text-rose-500" />
                       <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Remaining Balance</span>
                    </div>
                    <p className="text-xl font-black text-rose-600 tracking-tight">RS.{ledgerUser.balance?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Transaction History</h4>
                    <Badge variant="outline" className="text-[8px] font-bold text-slate-400 uppercase">Synced</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      ...bills.filter(b => b.userId === ledgerUser.id).map(b => ({ ...b, ledgerType: 'bill' })),
                      ...payments.filter(p => p.userId === ledgerUser.id).map(p => ({ ...p, ledgerType: 'payment' }))
                    ]
                    .sort((a, b) => new Date(b.date || b.dueDate || b.createdAt).getTime() - new Date(a.date || a.dueDate || a.createdAt).getTime())
                    .map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            item.ledgerType === 'bill' 
                              ? (item.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-rose-50 border-rose-100 text-rose-500")
                              : "bg-primary/5 border-primary/10 text-primary"
                          )}>
                            {item.ledgerType === 'bill' ? <CreditCard className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {item.ledgerType === 'bill' ? `Monthly Dues - ${item.month}` : 'Payment Received'}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              {formatDate(item.date || item.dueDate || item.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.ledgerType === 'bill' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                onClick={() => {
                                  generateInvoicePDF({
                                    invoiceNumber: item.id.slice(-8).toUpperCase(),
                                    customerName: ledgerUser.name,
                                    phone: ledgerUser.phone || 'N/A',
                                    packageName: item.packageName,
                                    speed: ledgerUser.packageSpeed || 'N/A',
                                    amount: item.amount,
                                    dueDate: formatDate(item.dueDate),
                                    status: item.status,
                                    createdDate: formatDate(item.createdAt)
                                  });
                                }}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <p className={cn(
                              "text-sm font-black tracking-tight",
                              item.ledgerType === 'bill' ? "text-slate-900" : "text-primary"
                            )}>
                              {item.ledgerType === 'bill' ? '-' : '+'} RS.{item.amount?.toLocaleString()}
                            </p>
                          </div>
                          {item.ledgerType === 'bill' && (
                            <Badge className={cn(
                              "text-[8px] font-black uppercase tracking-widest h-4 px-1.5 mt-1",
                              item.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                            )}>
                              {item.status}
                            </Badge>
                          )}
                          {item.ledgerType === 'payment' && (
                            <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-1 block">{item.method}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {bills.filter(b => b.userId === ledgerUser.id).length === 0 && payments.filter(p => p.userId === ledgerUser.id).length === 0 && (
                      <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No transaction history detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
