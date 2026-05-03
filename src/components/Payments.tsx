import React, { useState } from 'react';
import { Plus, Search, Receipt, Printer, Download, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Banknote, Building2, Filter, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react';
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
import { cn, formatDate } from '@/lib/utils';

export default function Payments() {
  const { payments, users, treasury, recordPayment, approvePayment, rejectPayment } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  const [newPayment, setNewPayment] = useState<{
    userId: string;
    userName: string;
    amount: string;
    method: string;
    reference: string;
  }>({
    userId: '',
    userName: '',
    amount: '',
    method: 'cash',
    reference: ''
  });

  const handleAddPayment = async () => {
    if (!newPayment.userId || !newPayment.amount) return;

    await recordPayment({
      ...newPayment,
      amount: Number(newPayment.amount),
    });

    setNewPayment({ userId: '', userName: '', amount: '', method: 'cash', reference: '' });
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

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (confirmingId === id) {
      await approvePayment(id);
      setConfirmingId(null);
    } else {
      setConfirmingId(id);
    }
  };

  const filteredPayments = payments.filter(p => 
    ((p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.method || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterDate === '' || p.date.includes(filterDate)) &&
    (filterStatus === 'all' || p.status === filterStatus)
  );

  return (
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Payments</h2>
          <p className="text-slate-500 text-xs font-medium">Transaction ledger and treasury manager</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="w-full sm:w-auto bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl gap-2 h-11 text-sm font-bold px-6 shadow-lg shadow-slate-200 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Record Payment
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[480px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-[#1E293B] p-8 text-white relative overflow-hidden">
                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-2xl font-bold tracking-tight">Add Transaction</DialogTitle>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Ledger Entry</p>
                </DialogHeader>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              </div>
              <div className="p-8">
                <div className="grid gap-6">
                  {/* Customer Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Customer Account
                    </Label>
                    <div className="relative group">
                      <select 
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pr-10 font-semibold text-slate-700 shadow-sm focus:bg-white focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                        value={newPayment.userId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const user = users.find(u => u.id === val);
                          setNewPayment({ ...newPayment, userId: val, userName: user?.name || '' });
                        }}
                      >
                        <option value="" disabled>Choose account...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.pppoeUsername}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Amount and Method Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                        Amount (Rs.)
                      </Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-lg text-slate-800 shadow-sm focus:bg-white transition-all"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                        Method
                      </Label>
                      <div className="relative group">
                        <select 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pr-10 font-semibold text-slate-700 shadow-sm focus:bg-white focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                          value={newPayment.method}
                          onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                        >
                          <option value="cash">Cash Payment</option>
                          <option value="easypaisa">Easypaisa</option>
                          <option value="jazzcash">JazzCash</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reference ID */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Reference / TrxID
                    </Label>
                    <Input 
                      placeholder="e.g. TXN-10293847" 
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl px-4 font-semibold text-slate-700 shadow-sm focus:bg-white transition-all"
                      value={newPayment.reference}
                      onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleAddPayment}
                    className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl h-14 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4"
                  >
                    Post Transaction
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mt-2 px-1">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Treasury Vault</p>
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-2xl font-bold text-slate-800">Rs. {treasury?.balance?.toLocaleString() || '0'}</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Inflow (Today)</p>
          <p className="text-2xl font-bold text-slate-800 relative z-10">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            className="pl-11 rounded-xl border-slate-100 bg-white h-12 text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-40 sm:flex-none">
            <Select onValueChange={setFilterStatus} defaultValue="all">
              <SelectTrigger className="rounded-xl border-slate-100 bg-white h-12 text-xs font-bold shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="all" className="font-bold cursor-pointer">All Status</SelectItem>
                <SelectItem value="pending" className="font-bold cursor-pointer">Pending Only</SelectItem>
                <SelectItem value="approved" className="font-bold cursor-pointer">Approved Only</SelectItem>
                <SelectItem value="rejected" className="font-bold cursor-pointer">Rejected Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            className="rounded-xl border-slate-100 bg-white h-12 text-xs w-36 px-4 font-bold shadow-sm cursor-pointer"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
        {filteredPayments.map((payment, i) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300",
              payment.status === 'rejected' && "opacity-60 saturate-50"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center min-w-0">
                <div className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                  payment.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                )}>
                  {payment.type === 'in' ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-base truncate">{payment.userName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-400 text-[10px] font-bold">{formatDate(payment.date, { month: 'short', day: 'numeric' })}</span>
                    <span className="text-slate-200">/</span>
                    <div className="flex items-center gap-1.5">
                      {getMethodIcon(payment.method)}
                      <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{payment.method}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "font-bold text-lg sm:text-xl",
                  payment.type === 'in' ? 'text-emerald-600' : 'text-rose-500'
                )}>
                  {payment.type === 'in' ? '+' : '-'} Rs.{payment.amount}
                </p>
                <div className="mt-1 flex justify-end">
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {payment.reference && (
                <div className="bg-slate-50/50 px-4 py-3 rounded-xl flex justify-between items-center border border-slate-100/50">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reference ID</p>
                    <p className="text-[11px] font-bold text-slate-600 truncate font-mono tracking-tight">{payment.reference}</p>
                  </div>
                  {payment.screenshot && (
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-xs shrink-0 ml-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Proof Attached</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center gap-4">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                {payment.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => rejectPayment(payment.id)}
                      variant="ghost" 
                      className="h-9 text-rose-500 font-bold text-[10px] px-3 hover:bg-rose-50 rounded-lg tracking-widest uppercase"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleApprove(payment.id)}
                      className={cn(
                        "h-9 px-5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md transition-all active:scale-[0.98]",
                        confirmingId === payment.id 
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200" 
                          : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                      )}
                    >
                      {confirmingId === payment.id ? "Confirm?" : "Approve"}
                    </Button>
                  </div>
                )}
                {payment.status === 'approved' && (
                  <Button variant="ghost" className="h-9 text-primary font-bold text-[10px] px-4 gap-2 hover:bg-slate-50 rounded-lg tracking-widest uppercase">
                    <Receipt className="w-4 h-4" /> Digital Receipt
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
