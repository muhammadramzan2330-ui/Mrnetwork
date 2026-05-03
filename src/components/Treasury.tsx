import React, { useState } from 'react';
import { Search, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download, Plus, Receipt, DollarSign, Tag, FileText, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSystem } from '../contexts/SystemContext';

export default function Treasury() {
  const { treasury, payments, loading, adminWithdrawal } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleWithdraw = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    await adminWithdrawal(Number(withdrawAmount), withdrawDetails);
    setIsWithdrawOpen(false);
    setWithdrawAmount('');
    setWithdrawDetails('');
    setIsConfirming(false);
  };

  const filteredHistory = payments.filter(p => 
    (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Main Treasury</h2>
          <p className="text-slate-500 text-xs font-medium">Manage company funds and overheads</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isWithdrawOpen} onOpenChange={(val) => {
            setIsWithdrawOpen(val);
            if (!val) setIsConfirming(false);
          }}>
            <DialogTrigger
              render={
                <Button className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2 h-11 text-xs font-bold px-6 shadow-lg shadow-rose-200 transition-all active:scale-95">
                  <TrendingDown className="w-4 h-4" /> Withdraw
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="bg-rose-600 p-8 text-white relative overflow-hidden">
                  <DialogHeader className="relative z-10">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Withdraw Funds</DialogTitle>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">External Transfer</p>
                  </DialogHeader>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                </div>
                <div className="p-8">
                  <div className="grid gap-6">
                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-2">
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1.5">Treasury Balance</p>
                      <p className="text-2xl font-bold text-rose-700">Rs. {treasury?.balance?.toLocaleString() || '0'}</p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Cash Out Amount</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-base shadow-sm focus:bg-white"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Transfer Point (Bank/Method)</Label>
                      <Input 
                        placeholder="e.g. Bank Account / JazzCash ID" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-slate-700 shadow-sm focus:bg-white"
                        value={withdrawDetails}
                        onChange={(e) => setWithdrawDetails(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || Number(withdrawAmount) > (treasury?.balance || 0)}
                      className={cn(
                        "rounded-xl h-14 font-bold text-base shadow-lg transition-all active:scale-[0.98]",
                        isConfirming ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 animate-pulse" : "bg-[#1E293B] hover:bg-slate-800 text-white shadow-slate-200 text-white"
                      )}
                    >
                      {isConfirming ? "Confirm Transfer?" : "Execute Withdrawal"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="rounded-xl bg-white border-slate-200 gap-2 h-11 text-xs font-bold px-6 shadow-sm hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Admin Treasury Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1E293B] p-6 sm:p-8 rounded-2xl text-white shadow-xl shadow-slate-200 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">Consolidated Cash Reserve</p>
          <h3 className="text-4xl font-extrabold mb-8 tracking-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5">
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1.5">Cycle Inflow</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-bold text-base">Rs. {treasury?.monthIn?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5">
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1.5">Cycle Outflow</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <span className="font-bold text-base">Rs. {treasury?.monthOut?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100/50 flex flex-col justify-center">
          <p className="text-emerald-600 text-[9px] font-bold uppercase tracking-widest mb-1.5">Today's Revenue</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-emerald-700">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
            <TrendingUp className="w-5 h-5 text-emerald-400/50" />
          </div>
        </div>
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100/50 flex flex-col justify-center">
          <p className="text-rose-600 text-[9px] font-bold uppercase tracking-widest mb-1.5">Operational Expense</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-rose-700">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
            <TrendingDown className="w-5 h-5 text-rose-400/50" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Filter ledger by source or notes..."
            className="pl-12 rounded-xl border-slate-100 bg-white h-12 text-sm font-medium shadow-sm transition-all focus:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 px-1">
        <div className="flex justify-between items-center px-1 py-1">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Registry</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold text-primary tracking-widest uppercase">Live Pulse</span>
          </div>
        </div>

        {filteredHistory.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all"
          >
            <div className="flex gap-4 items-center">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                item.type === 'in' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {item.type === 'in' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate max-w-[140px] sm:max-w-none">
                  {item.category === 'subscription' ? `In: ${item.userName}` : item.category.toUpperCase()}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-slate-200 text-xs">•</span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    item.status === 'approved' ? "text-emerald-500" : "text-amber-500"
                  )}>{item.status}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={cn(
                "font-bold text-base",
                item.type === 'in' ? "text-emerald-600" : "text-rose-600"
              )}>
                {item.type === 'in' ? '+' : '-'} Rs. {item.amount.toLocaleString()}
              </p>
              <div className="flex gap-1 justify-end mt-1.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredHistory.length === 0 && (
          <div className="bg-slate-50/50 rounded-2xl py-20 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-slate-100">
            <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No transaction records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
