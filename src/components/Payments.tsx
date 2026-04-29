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
    <div className="p-2 space-y-2 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
        <h2 className="text-xl font-black text-text-main">Payments</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Payment
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-text-main tracking-tight">Record Payment</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6">
                  {/* Customer Selection */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Customer Account
                    </Label>
                    <div className="relative group">
                      <select 
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 pr-10 font-semibold text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all"
                        value={newPayment.userId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const user = users.find(u => u.id === val);
                          setNewPayment({ ...newPayment, userId: val, userName: user?.name || '' });
                        }}
                      >
                        <option value="" disabled>Choose a customer account</option>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                        Amount (Rs.)
                      </Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-lg text-slate-800 shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                        Payment Method
                      </Label>
                      <div className="relative group">
                        <select 
                          className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 pr-10 font-semibold text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all"
                          value={newPayment.method}
                          onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                        >
                          <option value="cash">Cash</option>
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
                  <div className="flex flex-col gap-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Reference ID (Optional)
                    </Label>
                    <Input 
                      placeholder="e.g. TXN-12345" 
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-medium text-slate-800 shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                      value={newPayment.reference}
                      onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddPayment}
                  className="w-full bg-primary hover:bg-primary-dark rounded-2xl mt-8 h-14 font-black text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  Submit Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 px-1">
        <div className="bg-white p-5 rounded-[24px] border border-[#F3F4F6] shadow-sm flex flex-col justify-center">
          <p className="text-[#10B981] text-[10px] font-black uppercase tracking-widest mb-1">Total Treasury</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-text-main">Rs. {treasury?.balance?.toLocaleString() || '0'}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-[#F3F4F6] shadow-sm flex flex-col justify-center">
          <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">Today's In</p>
          <p className="text-xl font-black text-text-main">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 px-1 py-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search payments..."
            className="pl-11 rounded-[16px] border border-[#F3F4F6] bg-white h-12 text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-32 sm:flex-none">
            <Select onValueChange={setFilterStatus} defaultValue="all">
              <SelectTrigger className="rounded-[16px] border border-[#F3F4F6] bg-white h-12 text-[11px] font-bold shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="all" className="font-bold">All</SelectItem>
                <SelectItem value="pending" className="font-bold">Pending</SelectItem>
                <SelectItem value="approved" className="font-bold">Approved</SelectItem>
                <SelectItem value="rejected" className="font-bold">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            className="rounded-[16px] border border-[#F3F4F6] bg-white h-12 text-[10px] w-32 px-3 font-bold shadow-sm"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-1">
        {filteredPayments.map((payment, i) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-6 rounded-[32px] border border-[#F3F4F6] shadow-sm relative overflow-hidden flex flex-col h-full group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${payment.status === 'rejected' ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center min-w-0">
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shrink-0 ${payment.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {payment.type === 'in' ? <ArrowUpRight className="w-8 h-8" /> : <ArrowDownRight className="w-8 h-8" />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-text-main text-base truncate">{payment.userName}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-text-muted text-[11px] font-bold">{formatDate(payment.date, { month: 'short', day: 'numeric' })}</span>
                    <span className="text-slate-200 text-xs hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5">
                      {getMethodIcon(payment.method)}
                      <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.1em]">{payment.method}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-black text-xl ${payment.type === 'in' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {payment.type === 'in' ? '+' : '-'} Rs. {payment.amount}
                </p>
                <div className="mt-1 flex justify-end">
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {payment.reference && (
                <div className="bg-bg-gray/50 px-4 py-3 rounded-2xl flex justify-between items-center border border-white">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-0.5">Reference ID</p>
                    <p className="text-[11px] font-bold text-text-main truncate font-mono tracking-wider">{payment.reference}</p>
                  </div>
                  {payment.screenshot && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm shrink-0 ml-4">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Proof</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-5 mt-6 border-t border-slate-50">
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-text-muted hover:text-primary hover:bg-bg-gray rounded-xl transition-all">
                  <Printer className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-text-muted hover:text-primary hover:bg-bg-gray rounded-xl transition-all">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                {payment.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => rejectPayment(payment.id)}
                      variant="ghost" 
                      className="h-10 text-rose-600 font-black text-[10px] px-3 lg:px-4 hover:bg-rose-50 rounded-xl gap-2 tracking-widest"
                    >
                      <XCircle className="w-4 h-4 hidden sm:inline" /> REJECT
                    </Button>
                    <Button 
                      onClick={() => handleApprove(payment.id)}
                      className={cn(
                        "h-10 font-black text-[10px] px-4 lg:px-6 rounded-xl gap-2 tracking-widest transition-all",
                        confirmingId === payment.id 
                          ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse" 
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 hidden sm:inline" /> 
                      {confirmingId === payment.id ? "CONFIRM?" : "APPROVE"}
                    </Button>
                  </div>
                )}
                {payment.status === 'approved' && (
                  <Button variant="ghost" className="h-10 text-primary font-black text-[10px] px-4 gap-2 hover:bg-bg-gray rounded-xl tracking-widest uppercase">
                    <Receipt className="w-5 h-5" /> Receipt
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
