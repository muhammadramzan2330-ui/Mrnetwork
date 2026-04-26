import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Phone, MapPin, Calendar, Shield, ShieldOff, RefreshCw, Package, Edit2, Ban, Trash2, DollarSign, Wallet, ArrowRightLeft, UserCircle2, Smartphone, CreditCard, Eye, EyeOff, QrCode, Lock } from 'lucide-react';
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
import { addDocument, updateDocument, deleteDocument } from '../services/firebase';
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

  const [newUser, setNewUser] = useState({
    name: '',
    pppoeUsername: '',
    pppoePassword: '',
    packageId: '',
    phone: '',
    subdealerId: 'admin',
  });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.pppoeUsername) return;
    
    try {
      await addDocument('user', {
        ...newUser,
        status: 'active',
        balance: 0,
        walletBalance: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });
      setNewUser({ name: '', pppoeUsername: '', pppoePassword: '', packageId: '', phone: '', subdealerId: 'admin' });
      setIsOpen(false);
      toast.success('User created successfully');
    } catch (e) {
      toast.error('Failed to create user');
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
    <div className="p-2 space-y-4 pb-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-text-main">Customers</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> New Customer
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Register Customer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Full Name</Label>
                <Input 
                  placeholder="Muhammad Ramzan" 
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">PPPoE Username</Label>
                  <Input 
                    placeholder="ramzan123" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newUser.pppoeUsername}
                    onChange={(e) => setNewUser({ ...newUser, pppoeUsername: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••"
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newUser.pppoePassword}
                    onChange={(e) => setNewUser({ ...newUser, pppoePassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Package Plan</Label>
                <Select onValueChange={(val: string) => setNewUser({ ...newUser, packageId: val })}>
                  <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold">
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    {packages.map(p => (
                      <SelectItem key={p.id} value={p.id} className="font-bold rounded-xl">{p.name} - Rs. {p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Assigned Subdealer</Label>
                <Select onValueChange={(val: string) => setNewUser({ ...newUser, subdealerId: val })}>
                  <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold">
                    <SelectValue placeholder="Select Dealer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="admin" className="font-bold rounded-xl">Main Branch (Admin)</SelectItem>
                    {subdealers.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-bold rounded-xl">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddUser}
                className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-14 font-black shadow-xl"
              >
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search by name or username..."
          className="pl-12 rounded-[18px] border border-[#F3F4F6] bg-white h-12 text-sm font-medium shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3 px-1">
        {filteredUsers.map((user, i) => {
          const pkg = packages.find(p => p.id === user.packageId);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-[28px] border border-[#F3F4F6] shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary">
                    <UserCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-text-main text-base">{user.name}</h4>
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">@{user.pppoeUsername}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-text-muted hover:bg-bg-gray rounded-xl">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl w-48 p-2">
                    <DropdownMenuItem 
                      onClick={() => { setEditingUser(user); setIsEditOpen(true); }}
                      className="gap-3 text-xs font-black py-3 rounded-xl cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" /> EDIT PROFILE
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(user.id)}
                      className="gap-3 text-xs font-black py-3 rounded-xl cursor-pointer text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" /> DELETE USER
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-bg-gray/40 p-4 rounded-2xl border border-white">
                  <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">WALLET CREDIT</p>
                  <p className="text-lg font-black text-emerald-600">Rs. {user.walletBalance?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-bg-gray/40 p-4 rounded-2xl border border-white">
                  <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">DUE BALANCE</p>
                  <p className="text-lg font-black text-rose-500">Rs. {user.balance?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary/60" />
                    <span className="text-[11px] font-bold text-text-main">{pkg?.name || 'No Plan'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/60" />
                    <span className="text-[11px] font-bold text-text-main">{formatDate(user.expiryDate, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2 bg-bg-gray/50 px-2 py-1 rounded-lg">
                    <Lock className="w-3 h-3 text-text-muted" />
                    <span className="text-[10px] font-bold font-mono text-text-main">
                      {showPasswords[user.id] ? user.pppoePassword : '••••••••'}
                    </span>
                    <button 
                      onClick={() => setShowPasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      {showPasswords[user.id] ? <EyeOff className="w-3 h-3 text-primary" /> : <Eye className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => { setRenewTarget(user); setIsRenewOpen(true); }}
                      className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                      Renew Plan
                    </Button>
                    <Badge className={cn(
                      "rounded-lg font-black text-[9px] px-3 py-1 border-none tracking-widest shadow-none",
                      user.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}>
                      {user.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Edit Customer</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Full Name</Label>
                <Input 
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Phone Number</Label>
                <Input 
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Wallet Credit</Label>
                  <Input 
                    type="number"
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-emerald-600"
                    value={editingUser.walletBalance}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Due Balance</Label>
                  <Input 
                    type="number"
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-rose-600"
                    value={editingUser.balance}
                    onChange={(e) => setEditingUser({ ...editingUser, balance: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateUser}
                className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-14 font-black shadow-xl shadow-primary/20"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Package Dialog */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-[30px] border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Renew Service</DialogTitle>
          </DialogHeader>
          {renewTarget && (
            <div className="space-y-5 py-4">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Package Price</p>
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-black text-primary">Rs. {packages.find(p => p.id === renewTarget.packageId)?.price || '0'}</h3>
                  <span className="text-[10px] font-bold text-slate-500 mb-1 italic">Incl. all taxes</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Select Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {['easypaisa', 'jazzcash', 'cash'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentMethod === method ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 bg-white shadow-sm"
                      )}
                    >
                      {method === 'easypaisa' || method === 'jazzcash' ? (
                        <Smartphone className={cn("w-5 h-5", paymentMethod === method ? "text-primary" : "text-slate-400")} />
                      ) : (
                        <Wallet className={cn("w-5 h-5", paymentMethod === method ? "text-primary" : "text-slate-400")} />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-tighter capitalize">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {paymentMethod === 'cash' ? 'Visit Office:' : 'Scan to Pay:'}
                  </p>
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-2 uppercase tracking-tighter">
                    {paymentMethod === 'cash' ? 'In-Person' : 'Instant Approval'}
                  </Badge>
                </div>
                
                {paymentMethod !== 'cash' ? (
                  <div className="flex justify-center py-2 bg-white rounded-xl border border-dashed border-slate-200">
                    <div className="relative group">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${paymentMethod === 'easypaisa' ? (settings?.easypaisaNumber || '03001234567') : (settings?.jazzcashNumber || '03451234567')}`}
                        alt="Payment QR"
                        className="w-32 h-32"
                      />
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <QrCode className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 px-3 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-black text-text-main">ISP Main Office</p>
                    <p className="text-[10px] font-medium text-text-muted tracking-tight">Visit our collection branch to pay by cash</p>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  {paymentMethod !== 'cash' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">Account No:</span>
                        <span className="text-sm font-black text-primary tracking-wider">
                          {paymentMethod === 'easypaisa' ? (settings?.easypaisaNumber || '03001234567') : (settings?.jazzcashNumber || '03451234567')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">Account Name:</span>
                        <span className="text-[11px] font-black text-slate-700">
                          {paymentMethod === 'easypaisa' ? (settings?.easypaisaName || 'Muhammad Ramzan') : (settings?.jazzcashName || 'Muhammad Ramzan')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center bg-primary/5 p-2 rounded-lg">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Office Timings:</span>
                      <span className="text-[10px] font-bold text-text-main">09:00 AM - 09:00 PM</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Transaction ID / TrxID</Label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Enter 11-digit ID"
                    className="rounded-2xl bg-bg-gray border-none h-12 pl-11 font-bold text-sm tracking-widest"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Payment Proof (Optional)</Label>
                <div className="relative">
                  <Input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setScreenshot(file.name);
                    }}
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 py-3 font-bold text-xs"
                  />
                </div>
                {screenshot && <p className="text-[9px] font-bold text-emerald-600 ml-1 italic">File selected: {screenshot}</p>}
              </div>

              <Button 
                onClick={handleRenew}
                disabled={!transactionId}
                className="w-full bg-primary hover:bg-primary-dark rounded-2xl h-14 font-black text-base shadow-xl shadow-primary/30 gap-2 mt-2"
              >
                Submit Renewal Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
