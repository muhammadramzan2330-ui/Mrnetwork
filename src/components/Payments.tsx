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
  const { payments, users, treasury, recordPayment, approvePayment, rejectPayment, bills, markBillAsPaid } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'payments' | 'dues'>('payments');
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
     (p.method || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterDate === '' || p.date.includes(filterDate)) &&
    (filterStatus === 'all' || p.status === filterStatus)
  );

  const filteredBills = bills.filter(b => 
    (b.status === 'unpaid') &&
    ((b.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
     (b.month || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterDate === '' || b.dueDate.includes(filterDate))
  );

  const displayData = viewMode === 'payments' ? filteredPayments : filteredBills;

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Header and Action */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Ledger Master</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Financial Transmission Control</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white rounded-xl gap-2 h-12 text-xs font-bold uppercase tracking-wider px-8 shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="header-gradient p-8 text-white relative">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">Insert Payment</DialogTitle>
                  </DialogHeader>
                  <p className="text-white/60 text-[10px] font-bold mt-2 uppercase tracking-widest">Manual Energy Allocation</p>
                </div>
                <div className="p-6 sm:p-8 space-y-6 text-slate-900">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Identity Node</Label>
                      <Select 
                        value={newPayment.userId} 
                        onValueChange={(val) => {
                          const user = users.find(u => u.id === val);
                          setNewPayment({ ...newPayment, userId: val, userName: user?.name || '' });
                        }}
                      >
                        <SelectTrigger className="input-modern w-full">
                          <SelectValue placeholder="SELECT FREQUENCY..." />
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Amount (Rs)</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="input-modern font-bold text-lg"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Method</Label>
                        <Select value={newPayment.method} onValueChange={(val) => setNewPayment({ ...newPayment, method: val })}>
                          <SelectTrigger className="input-modern w-full">
                            <SelectValue placeholder="METHOD" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                            <SelectItem value="cash" className="font-bold py-3 text-[10px] tracking-widest">Physical Currency</SelectItem>
                            <SelectItem value="easypaisa" className="font-bold py-3 text-[10px] tracking-widest">Easypaisa Node</SelectItem>
                            <SelectItem value="jazzcash" className="font-bold py-3 text-[10px] tracking-widest">JazzCash Node</SelectItem>
                            <SelectItem value="bank" className="font-bold py-3 text-[10px] tracking-widest">Bank Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Signal Hash / TrxID</Label>
                      <Input 
                        placeholder="e.g. TXN-10293847" 
                        className="input-modern"
                        value={newPayment.reference}
                        onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={handleAddPayment}
                      className="btn-gradient w-full mt-4 h-14 font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                      EMIT TO LEDGER
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Treasury Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden p-6 group hover:shadow-md transition-all">
            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-2 leading-none">Total Liquidity</p>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</span>
            </div>
          </Card>
          <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden p-6 group hover:shadow-md transition-all">
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-2 leading-none">Daily Inflow</p>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</span>
            </div>
          </Card>
          <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden p-6 group hover:shadow-md transition-all">
            <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mb-2 leading-none">Total Dues</p>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-rose-500 rounded-full" />
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Rs. {bills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setViewMode('payments')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'payments' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Payments
          </button>
          <button
            onClick={() => setViewMode('dues')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'dues' ? "bg-white text-rose-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Outstanding Dues
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center pt-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Scan database: Name, ID..."
              className="input-modern pl-12 h-12 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
            <div className="min-w-[140px]">
              <Select onValueChange={setFilterStatus} defaultValue="all">
                <SelectTrigger className="input-modern h-12 text-[10px] font-bold uppercase tracking-widest">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                  <SelectItem value="all" className="font-bold py-3 text-[10px] tracking-widest">Global Status</SelectItem>
                  <SelectItem value="pending" className="font-bold py-3 text-[10px] tracking-widest text-orange-500">Waitlisted</SelectItem>
                  <SelectItem value="approved" className="font-bold py-3 text-[10px] tracking-widest text-emerald-500">Validated</SelectItem>
                  <SelectItem value="rejected" className="font-bold py-3 text-[10px] tracking-widest text-rose-500">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="date"
              className="input-modern h-12 text-[10px] font-bold w-40 px-4"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                  <Badge className="bg-rose-50 text-rose-600 border-none text-[8px] font-black tracking-widest">UNPAID</Badge>
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
                        {viewMode === 'payments' ? 'Reference ID' : 'Target Hub'}
                      </p>
                      <p className={cn(
                        "text-[10px] font-bold truncate font-mono",
                        viewMode === 'dues' ? "text-slate-600" : "text-primary"
                      )}>
                        {viewMode === 'payments' ? item.reference : 'Subscriber Registry'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-50">
                   <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {viewMode === 'payments' && item.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => rejectPayment(item.id)}
                        className="h-9 px-3 text-rose-500 font-bold text-[9px] hover:bg-rose-50 rounded-lg uppercase tracking-wider"
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className={cn(
                          "h-9 px-4 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm",
                          confirmingId === item.id ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-primary hover:bg-primary/95 text-white"
                        )}
                      >
                        {confirmingId === item.id ? "Confirm?" : "Approve"}
                      </Button>
                    </div>
                  )}
                  {viewMode === 'dues' && (
                    <Button 
                      size="sm"
                      onClick={() => markBillAsPaid(item.id)}
                      className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
