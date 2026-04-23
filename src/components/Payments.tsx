import React, { useState } from 'react';
import { Plus, Search, Receipt, Printer, Download, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Banknote, Building2, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-text-main">Payments</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Payment
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-text-main">Record Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Customer</Label>
                <Select onValueChange={(val: string) => {
                  const user = users.find(u => u.id === val);
                  setNewPayment({ ...newPayment, userId: val, userName: user?.name || '' });
                }}>
                  <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-sm">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl max-h-[250px]">
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id} className="rounded-xl font-bold py-3">
                        {u.name} <span className="text-[10px] text-text-muted font-medium ml-2">@{u.pppoeUsername}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Amount</Label>
                  <Input 
                    type="number" 
                    placeholder="1500" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-sm"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Method</Label>
                  <Select onValueChange={(val: string) => setNewPayment({ ...newPayment, method: val })}>
                    <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-sm">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="cash" className="rounded-xl font-bold py-3">Cash</SelectItem>
                      <SelectItem value="easypaisa" className="rounded-xl font-bold py-3">Easypaisa</SelectItem>
                      <SelectItem value="jazzcash" className="rounded-xl font-bold py-3">JazzCash</SelectItem>
                      <SelectItem value="bank" className="rounded-xl font-bold py-3">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Transaction ID (Optional)</Label>
                <Input 
                  placeholder="TXN12345678" 
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-sm"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleAddPayment}
                className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-14 font-black text-base shadow-xl shadow-primary/30"
              >
                Submit Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2 px-1">
        <div className="bg-white p-5 rounded-[24px] border border-[#F3F4F6] shadow-sm">
          <p className="text-[#10B981] text-[10px] font-black uppercase tracking-widest mb-1">Total Treasury</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-text-main">Rs. {treasury?.balance?.toLocaleString() || '0'}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-[#F3F4F6] shadow-sm">
          <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">Today's In</p>
          <p className="text-xl font-black text-text-main">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className="flex gap-2 px-1 py-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search payments..."
            className="pl-11 rounded-[16px] border border-[#F3F4F6] bg-white h-12 text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-32">
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
      </div>
      
      <div className="px-1 flex justify-end">
        <Input
          type="date"
          className="rounded-[16px] border border-[#F3F4F6] bg-white h-10 text-[10px] w-40 px-3 font-bold shadow-sm"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <div className="space-y-3 px-1">
        {filteredPayments.map((payment, i) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-4 rounded-[24px] border border-[#F3F4F6] shadow-sm overflow-hidden ${payment.status === 'rejected' ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center ${payment.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {payment.type === 'in' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-black text-text-main text-sm">{payment.userName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-text-muted text-[10px] font-bold">{formatDate(payment.date, { month: 'short', day: 'numeric' })}</span>
                    <span className="text-slate-200 text-xs">•</span>
                    <div className="flex items-center gap-1">
                      {getMethodIcon(payment.method)}
                      <span className="text-text-muted text-[10px] font-black uppercase tracking-tight">{payment.method}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-base ${payment.type === 'in' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {payment.type === 'in' ? '+' : '-'} Rs. {payment.amount}
                </p>
                <div className="mt-1 flex justify-end">
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            </div>

            {payment.reference && (
              <div className="bg-bg-gray/50 px-3 py-2 rounded-xl mb-4 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">Reference ID</p>
                  <p className="text-[10px] font-bold text-text-main">{payment.reference}</p>
                </div>
                {payment.screenshot && (
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">Attachment</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-text-muted hover:text-primary hover:bg-bg-gray rounded-xl">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-text-muted hover:text-primary hover:bg-bg-gray rounded-xl">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {payment.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => rejectPayment(payment.id)}
                      variant="ghost" 
                      className="h-9 text-rose-600 font-black text-xs px-4 hover:bg-rose-50 rounded-xl gap-2"
                    >
                      <XCircle className="w-4 h-4" /> REJECT
                    </Button>
                    <Button 
                      onClick={() => handleApprove(payment.id)}
                      className={cn(
                        "h-9 font-black text-xs px-5 rounded-xl gap-2 transition-all",
                        confirmingId === payment.id 
                          ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse" 
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" /> 
                      {confirmingId === payment.id ? "CONFIRM?" : "APPROVE"}
                    </Button>
                  </>
                )}
                {payment.status === 'approved' && (
                  <Button variant="ghost" className="h-9 text-primary font-black text-[10px] px-3 gap-2 hover:bg-bg-gray rounded-xl">
                    <Receipt className="w-4 h-4" /> PRINT RECEIPT
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
