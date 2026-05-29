import React, { useState } from 'react';
import { Plus, Search, Receipt, Printer, Download, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Banknote, Building2, Filter, CheckCircle2, XCircle, Clock, ChevronDown, RefreshCw, MessageSquare, Phone, Loader2 } from 'lucide-react';
import { generateInvoicePDF, generateReceiptPDF } from '@/services/pdfService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/hooks/useAuth';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function Payments() {
  const { profile, isAdmin } = useAuth();
  const { payments, users, treasury, recordPayment, approvePayment, rejectPayment, bills, markBillAsPaid, generateMonthlyBills, addLog } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [billFilter, setBillFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<'payments' | 'dues'>('payments');
  const [isOpen, setIsOpen] = useState(false);

  const [newPayment, setNewPayment] = useState<{
    userId: string;
    userName: string;
    amount: string;
    method: string;
    reference: string;
  }>({
    userId: profile?.id || '',
    userName: profile?.name || '',
    amount: '',
    method: 'cash',
    reference: ''
  });

  const selectedPaymentUserId = isAdmin ? newPayment.userId : profile?.id;
  const selectedPaymentUser = users.find(u => u.id === selectedPaymentUserId || u.uid === selectedPaymentUserId);
  const selectedUnpaidBill = bills
    .filter(b => b.userId === selectedPaymentUser?.id && b.status === 'unpaid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  const secureAmount = selectedUnpaidBill?.amount || selectedPaymentUser?.packagePrice || '';
  const requiresReference = newPayment.method !== 'cash';
  const canSubmitPayment = Boolean(
    (isAdmin ? newPayment.userId : profile?.id) &&
    Number(newPayment.amount) > 0 &&
    (!requiresReference || newPayment.reference.trim().replace(/\s+/g, '').length >= 6)
  );

  const handleAddPayment = async () => {
    if ((isAdmin && !newPayment.userId) || !newPayment.amount) return;
    if (requiresReference && newPayment.reference.trim().replace(/\s+/g, '').length < 6) {
      toast.error("Secure transaction reference is required");
      return;
    }

    if (!isAdmin && selectedUnpaidBill && Number(newPayment.amount) !== Number(selectedUnpaidBill.amount || 0)) {
      toast.error(`Amount must match your unpaid bill: Rs. ${Number(selectedUnpaidBill.amount || 0).toLocaleString()}`);
      return;
    }

    await recordPayment({
      ...newPayment,
      userId: isAdmin ? newPayment.userId : profile?.id,
      userName: isAdmin ? newPayment.userName : profile?.name,
      amount: Number(newPayment.amount),
      billId: selectedUnpaidBill?.id || '',
    });

    setNewPayment({ userId: profile?.id || '', userName: profile?.name || '', amount: '', method: 'cash', reference: '' });
    setIsOpen(false);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'easypaisa': return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'jazzcash': return <CreditCard className="w-4 h-4 text-rose-600" />;
      case 'bank': return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'cash': return <Banknote className="w-4 h-4 text-amber-600" />;
      default: return <CreditCard className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-50 text-amber-600 border-none gap-1 text-[9px] font-bold"><Clock className="w-3 h-3" /> PENDING</Badge>;
      case 'approved': return <Badge className="bg-emerald-50 text-emerald-600 border-none gap-1 text-[9px] font-bold"><CheckCircle2 className="w-3 h-3" /> APPROVED</Badge>;
      case 'rejected': return <Badge className="bg-rose-50 text-rose-600 border-none gap-1 text-[9px] font-bold"><XCircle className="w-3 h-3" /> REJECTED</Badge>;
      default: return null;
    }
  };

  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Payment approve karni hai? Pehle apne Easypaisa/JazzCash/Bank account mein amount confirm kar lein.');
    if (!confirmed) return;

    setProcessingPaymentId(id);
    try {
      await approvePayment(id);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Payment reject karni hai?');
    if (!confirmed) return;

    setProcessingPaymentId(id);
    try {
      await rejectPayment(id);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const filteredPayments = payments
    .filter(p => isAdmin || p.userId === profile?.id)
    .filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (p.userName || '').toLowerCase().includes(searchLower) || 
        (p.method || '').toLowerCase().includes(searchLower) ||
        (p.reference || '').toLowerCase().includes(searchLower) ||
        (p.amount || 0).toString().includes(searchLower);

      return matchesSearch &&
        (filterDate === '' || p.date.includes(filterDate)) &&
        (filterStatus === 'all' || p.status === filterStatus);
    });

  const filteredBills = bills
    .filter(b => isAdmin || b.userId === profile?.id)
    .filter(b => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (b.userName || '').toLowerCase().includes(searchLower) || 
        (b.packageName || '').toLowerCase().includes(searchLower) ||
        (b.month || '').toLowerCase().includes(searchLower) ||
        (b.status || '').toLowerCase().includes(searchLower) ||
        (b.dueDate || '').toLowerCase().includes(searchLower);

      const matchesDate = (filterDate === '' || b.dueDate.includes(filterDate));
      
      let matchesFilter = true;
      if (billFilter === 'paid') matchesFilter = b.status === 'paid';
      if (billFilter === 'unpaid') matchesFilter = b.status === 'unpaid';
      if (billFilter === 'overdue') matchesFilter = (b.status === 'unpaid' && new Date(b.dueDate) < new Date());
      
      return matchesSearch && matchesDate && matchesFilter;
    });

  const displayData = viewMode === 'payments' ? filteredPayments : filteredBills;

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-8">
      {/* Sticky Top Header Section */}
      <div className="bg-white border-b border-slate-200/60 pt-6 pb-4 shadow-sm transition-all duration-300">
        <div className="px-4 sm:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Financials</h2>
              <div className="flex items-center gap-2 mt-1.5 font-mono">
                <p className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] leading-none">Ledger active</p>
                {isAdmin && (
                  <Badge variant="outline" className="text-[8px] font-bold border-slate-200 text-slate-500 uppercase h-4 px-1 rounded bg-white">ADMIN VIEW</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {isAdmin && (
                <Button 
                  onClick={() => {
                    generateMonthlyBills();
                    toast.success("Billing generation cycle started");
                  }}
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl gap-2 h-11 text-[10px] font-black uppercase tracking-widest px-6 shadow-sm transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" /> Bills
                </Button>
              )}
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 h-11 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> {isAdmin ? 'Add Payment' : 'Pay Online'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
                  <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="header-gradient p-8 text-white relative">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">{isAdmin ? 'Record Payment' : 'Submit Payment'}</DialogTitle>
                      </DialogHeader>
                      <p className="text-white/60 text-[11px] font-bold mt-2 uppercase tracking-widest">{isAdmin ? 'Manually record customer payment' : 'Submit your payment details'}</p>
                    </div>
                    <div className="p-6 sm:p-8 space-y-6 text-slate-900">
                      <div className="grid gap-6">
                        {isAdmin && (
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subscriber</Label>
                            <Select 
                              value={newPayment.userId} 
                              onValueChange={(val) => {
                                const user = users.find(u => u.id === val);
                                const unpaidBill = bills
                                  .filter(b => b.userId === val && b.status === 'unpaid')
                                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
                                setNewPayment({
                                  ...newPayment,
                                  userId: val,
                                  userName: user?.name || '',
                                  amount: unpaidBill?.amount ? String(unpaidBill.amount) : ''
                                });
                              }}
                            >
                              <SelectTrigger className="input-modern w-full px-4 h-12">
                                <SelectValue placeholder="Select Subscriber" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                                {users.map(u => (
                                  <SelectItem key={u.id} value={u.id} className="font-bold text-slate-900 rounded-lg py-3 cursor-pointer hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                                    {u.name} — ({u.pppoeUsername})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Amount (Rs)</Label>
                            <Input 
                              type="number" 
                              placeholder={secureAmount ? String(secureAmount) : "0.00"} 
                              className="input-modern font-bold text-lg px-4 h-12"
                              value={newPayment.amount}
                              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                            />
                            {selectedUnpaidBill && (
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">
                                Secure due amount: Rs. {Number(selectedUnpaidBill.amount || 0).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Method</Label>
                            <Select value={newPayment.method} onValueChange={(val) => setNewPayment({ ...newPayment, method: val })}>
                              <SelectTrigger className="input-modern w-full px-4 h-12">
                                <SelectValue placeholder="Method" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                                {isAdmin && <SelectItem value="cash" className="font-bold py-3 text-[10px] tracking-widest">Cash Payment</SelectItem>}
                                <SelectItem value="easypaisa" className="font-bold py-3 text-[10px] tracking-widest">Easypaisa</SelectItem>
                                <SelectItem value="jazzcash" className="font-bold py-3 text-[10px] tracking-widest">JazzCash</SelectItem>
                                <SelectItem value="bank" className="font-bold py-3 text-[10px] tracking-widest">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Transaction Reference</Label>
                          <Input 
                            placeholder={requiresReference ? "Required: TXN-10293847" : "Optional for cash payment"} 
                            className="input-modern px-4 h-12"
                            value={newPayment.reference}
                            onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value.toUpperCase() })}
                          />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Duplicate transaction IDs are blocked before approval.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                          <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Secure Payment Flow</p>
                          <p className="text-[10px] font-bold text-indigo-500 mt-1 leading-relaxed">
                            Payment stays pending until admin approval. After approval, subdealer commission goes to subdealer wallet and remaining amount goes to treasury.
                          </p>
                        </div>
                        <Button 
                          onClick={handleAddPayment}
                          disabled={!canSubmitPayment}
                          className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                        >
                          {isAdmin ? 'Record Payment' : 'Submit Payment Request'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-200/40 shadow-inner">
              <button
                onClick={() => setViewMode('payments')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'payments' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Payments
              </button>
              <button
                onClick={() => setViewMode('dues')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'dues' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Bills
              </button>
            </div>

            <div className="relative group w-full md:max-w-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 group-focus-within:border-indigo-100 transition-all">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder={viewMode === 'payments' ? "Search Payments (Name, Reference, Amount)..." : "Search Bills (Customer, Month, Status)..."}
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

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar ml-auto">
                {viewMode === 'dues' && (
                  <div className="flex items-center bg-white/50 p-1 rounded-xl border border-slate-200/60 shadow-sm whitespace-nowrap">
                    {(['all', 'unpaid', 'paid', 'overdue'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setBillFilter(filter)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          billFilter === filter 
                            ? (filter === 'overdue' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-indigo-600 text-white shadow-md shadow-indigo-500/20")
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
                <div className="min-w-[120px]">
                  <Select onValueChange={setFilterStatus} defaultValue="all">
                    <SelectTrigger className="input-modern h-11 text-[9px] font-black uppercase tracking-widest px-4 border-slate-200/60 bg-white/50 shadow-sm">
                      <SelectValue placeholder="STATUS" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                      <SelectItem value="all" className="font-bold py-3 text-[9px] tracking-widest">All Status</SelectItem>
                      <SelectItem value="pending" className="font-bold py-3 text-[9px] tracking-widest text-orange-500">Pending</SelectItem>
                      <SelectItem value="approved" className="font-bold py-3 text-[9px] tracking-widest text-emerald-500">Approved</SelectItem>
                      <SelectItem value="rejected" className="font-bold py-3 text-[9px] tracking-widest text-rose-500">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-8">
        {/* Treasury Stats Grid */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden p-6 group hover:shadow-md transition-all">
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-2 leading-none">Net Balance</p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</span>
              </div>
            </Card>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden p-6 group hover:shadow-md transition-all">
              <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2 leading-none">Today's Revenue</p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</span>
              </div>
            </Card>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden p-6 group hover:shadow-md transition-all">
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mb-2 leading-none">Pending Bills</p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-rose-500 rounded-full" />
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Rs. {bills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* Transaction Feed */}
      <div className="px-4 sm:px-8">
        {displayData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayData.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className={cn(
                  "bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col relative",
                  item.status === 'rejected' && "opacity-60 bg-slate-50/50",
                  viewMode === 'dues' && "border-rose-100"
                )}>
                  <div className="p-6 pb-4 flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-105",
                        viewMode === 'payments' 
                          ? (item.type === 'in' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100')
                          : 'bg-rose-50 text-rose-500 border-rose-100'
                      )}>
                        {viewMode === 'payments' 
                          ? (item.type === 'in' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />)
                          : <Receipt className="w-6 h-6" />
                        }
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate tracking-tight text-sm uppercase">{item.userName}</h4>
                        {(() => {
                          const itemUser = users.find(u => u.id === item.userId);
                          return itemUser?.phone ? (
                            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest truncate mt-1">{itemUser.phone}</p>
                          ) : null;
                        })()}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{formatDate(item.date || item.dueDate, { month: 'short', day: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100">
                            {viewMode === 'payments' ? getMethodIcon(item.method) : <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
                            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-none">
                              {viewMode === 'payments' ? item.method : `Bill: ${item.month}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 flex justify-between items-end mb-4">
                    <div>
                      <p className={cn(
                        "font-extrabold text-xl tracking-tight leading-none",
                        (viewMode === 'payments' && item.type === 'in') ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {viewMode === 'payments' ? (item.type === 'in' ? '+' : '-') : ''} RS.{item.amount?.toLocaleString()}
                      </p>
                    </div>
                    {viewMode === 'payments' ? getStatusBadge(item.status) : (
                      <Badge className={cn(
                        "border-none text-[8px] font-black tracking-widest uppercase",
                        item.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {item.status || 'UNPAID'}
                      </Badge>
                    )}
                  </div>

                  <div className="px-6 pb-6 mt-auto">
                    {(item.reference || viewMode === 'dues') && (
                      <div className={cn(
                        "px-4 py-3 rounded-xl border flex justify-between items-center group-hover:bg-slate-100/50 transition-colors",
                        viewMode === 'dues' ? "bg-rose-50/30 border-rose-100" : "bg-slate-50 border-slate-100"
                      )}>
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            {viewMode === 'payments' ? 'Reference ID' : 'Service Unit'}
                          </p>
                          <p className={cn(
                            "text-[10px] font-bold truncate font-mono",
                            viewMode === 'dues' ? "text-slate-600" : "text-indigo-600"
                          )}>
                            {viewMode === 'payments' ? item.reference : (item.packageName || 'Monthly Bill')}
                          </p>
                        </div>
                      </div>
                    )}                     <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-50">
                       <div className="flex gap-2">
                        <button
                          aria-label={viewMode === 'dues' ? 'Print invoice' : 'Print receipt'}
                          onClick={() => {
                            const user = users.find(u => u.id === item.userId);
                            if (viewMode === 'dues') {
                              generateInvoicePDF({
                                invoiceNumber: item.id.slice(-8).toUpperCase(),
                                customerName: item.userName || user?.name || 'Customer',
                                phone: user?.phone || user?.whatsapp || item.phone || item.userPhone || 'N/A',
                                packageName: item.packageName || 'Service',
                                speed: user?.packageSpeed || 'Standard',
                                amount: item.amount,
                                dueDate: formatDate(item.dueDate),
                                status: item.status || 'UNPAID',
                                createdDate: formatDate(item.date || new Date())
                              });
                              if (addLog) addLog('Invoice Printed', item.userName, 'admin', `Invoice #${item.id.slice(-8)}`);
                            } else if (viewMode === 'payments' && item.status === 'approved') {
                              generateReceiptPDF({
                                invoiceNumber: item.id.slice(-8).toUpperCase(),
                                customerName: item.userName || user?.name || 'Customer',
                                phone: user?.phone || user?.whatsapp || item.phone || item.userPhone || 'N/A',
                                packageName: item.packageName || 'Account Recharge',
                                speed: 'N/A',
                                amount: item.amount,
                                dueDate: 'N/A',
                                status: 'PAID',
                                createdDate: formatDate(item.date),
                                paymentMethod: item.method,
                                reference: item.reference || item.id.slice(-8)
                              });
                              if (addLog) addLog('Receipt Printed', item.userName, 'admin', `Ref: ${item.reference}`);
                            } else {
                              toast.error("Only approved payments or bills can be printed");
                            }
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          aria-label={viewMode === 'dues' ? 'Download invoice' : 'Download receipt'}
                          onClick={() => {
                            const user = users.find(u => u.id === item.userId);
                            if (viewMode === 'dues') {
                              generateInvoicePDF({
                                invoiceNumber: item.id.slice(-8).toUpperCase(),
                                customerName: item.userName || user?.name || 'Customer',
                                phone: user?.phone || user?.whatsapp || item.phone || item.userPhone || 'N/A',
                                packageName: item.packageName || 'Service',
                                speed: user?.packageSpeed || 'Standard',
                                amount: item.amount,
                                dueDate: formatDate(item.dueDate),
                                status: item.status || 'UNPAID',
                                createdDate: formatDate(item.date || new Date())
                              });
                              if (addLog) addLog('Invoice Downloaded', item.userName, 'admin', `Invoice #${item.id.slice(-8)}`);
                            } else if (viewMode === 'payments' && item.status === 'approved') {
                              generateReceiptPDF({
                                invoiceNumber: item.id.slice(-8).toUpperCase(),
                                customerName: item.userName || user?.name || 'Customer',
                                phone: user?.phone || user?.whatsapp || item.phone || item.userPhone || 'N/A',
                                packageName: item.packageName || 'Account Recharge',
                                speed: 'N/A',
                                amount: item.amount,
                                dueDate: 'N/A',
                                status: 'PAID',
                                createdDate: formatDate(item.date),
                                paymentMethod: item.method,
                                reference: item.reference || item.id.slice(-8)
                              });
                              if (addLog) addLog('Receipt Downloaded', item.userName, 'admin', `Ref: ${item.reference}`);
                            } else {
                              toast.error("Only approved payments or bills can be exported");
                            }
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {viewMode === 'payments' && item.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReject(item.id)}
                            disabled={processingPaymentId === item.id}
                            className="h-9 px-3 text-rose-500 font-bold text-[9px] hover:bg-rose-50 rounded-lg uppercase tracking-wider"
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            disabled={processingPaymentId === item.id}
                            className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                          >
                            {processingPaymentId === item.id ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Processing
                              </>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                        </div>
                      )}
                      {viewMode === 'dues' && item.status !== 'paid' && (
                        <div className="flex items-center gap-2">
                           {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const user = users.find(u => u.id === item.userId);
                                if (!user?.phone) {
                                  toast.error("No phone number found for this customer");
                                  return;
                                }
                                const cleanPhone = user.phone.replace(/\D/g, '');
                                const formattedDate = formatDate(item.dueDate);
                                const message = encodeURIComponent(
                                  `Dear ${item.userName || user.name}, your internet bill is due. Please pay your bill before due date.\n\n` +
                                  `Customer: ${item.userName || user.name}\n` +
                                  `Package: ${item.packageName || 'Internet Service'}\n` +
                                  `Amount: RS. ${item.amount?.toLocaleString()}\n` +
                                  `Due Date: ${formattedDate}`
                                );
                                const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone}?text=${message}`;
                                window.open(whatsappUrl, '_blank');
                                toast.success("WhatsApp reminder opened");
                              }}
                              className="h-9 px-3 text-emerald-600 font-black text-[9px] hover:bg-emerald-50 rounded-lg uppercase tracking-widest gap-2 bg-emerald-50/50 border border-emerald-100"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Remind
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => markBillAsPaid(item.id)}
                            className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-slate-200" />
             </div>
             <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">No records found</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Try searching with different keywords</p>
             <Button 
               variant="link" 
               onClick={() => {
                 setSearchTerm('');
                 setFilterDate('');
                 setFilterStatus('all');
               }}
               className="mt-4 text-indigo-600 font-extrabold uppercase text-[10px] tracking-[0.2em]"
             >
               Clear all filters
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
