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
    <div className="p-2 space-y-3 pb-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-text-main">Wallet Dashboard</h2>
        <div className="flex gap-2">
          <Dialog open={isWithdrawOpen} onOpenChange={(val) => {
            setIsWithdrawOpen(val);
            if (!val) setIsConfirming(false);
          }}>
            <DialogTrigger
              render={
                <Button className="bg-rose-500 hover:bg-rose-600 rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-rose-200">
                  <TrendingDown className="w-4 h-4" /> Withdraw
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-rose-600">Withdraw Funds</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-2">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-xl font-black text-rose-700">Rs. {treasury?.balance?.toLocaleString() || '0'}</p>
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Withdraw Amount</Label>
                  <Input 
                    type="number" 
                    placeholder="E.g. 5000" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Transfer Details (Bank/ID)</Label>
                  <Input 
                    placeholder="Bank Al Habib - 0123-XXXX-XXXX" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || Number(withdrawAmount) > (treasury?.balance || 0)}
                  className={cn(
                    "rounded-2xl h-14 font-black text-base shadow-xl transition-all",
                    isConfirming ? "bg-rose-600 text-white animate-pulse" : "bg-primary text-white"
                  )}
                >
                  {isConfirming ? "ARE YOU SURE? CLICK TO CONFIRM" : "SUBMIT WITHDRAWAL"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="rounded-[14px] bg-white border-none gap-2 h-10 text-xs font-bold px-4 shadow-sm">
            <Download className="w-4 h-4" /> Report
          </Button>
        </div>
      </div>

      {/* Admin Treasury Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary to-[#7C3AED] p-6 rounded-[32px] text-white shadow-xl shadow-primary/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Company Treasury</p>
          <h3 className="text-3xl font-black mb-6">Rs. {treasury?.balance?.toLocaleString() || '0'}</h3>
          
          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <p className="text-white/60 text-[9px] font-black uppercase tracking-wider mb-1">THIS MONTH IN</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span className="font-bold text-sm">Rs. {treasury?.monthIn?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <p className="text-white/60 text-[9px] font-black uppercase tracking-wider mb-1">THIS MONTH OUT</p>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3 h-3 text-rose-300" />
                <span className="font-bold text-sm">Rs. {treasury?.monthOut?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="bg-emerald-50 p-4 rounded-[24px] border border-emerald-100/50">
          <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest mb-1">Today's Revenue</p>
          <p className="text-lg font-black text-emerald-700">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-[24px] border border-rose-100/50">
          <p className="text-rose-600 text-[9px] font-black uppercase tracking-widest mb-1">Today's Expenses</p>
          <p className="text-lg font-black text-rose-700">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className="flex gap-2 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search transactions..."
            className="pl-11 rounded-2xl border border-[#F3F4F6] bg-white h-12 text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 px-1">
        <div className="flex justify-between items-center px-1 py-1">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">Transaction Ledger</h3>
          <Badge className="bg-bg-gray text-text-muted border-none text-[9px] font-black tracking-widest px-2">REAL-TIME</Badge>
        </div>

        {filteredHistory.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-4 rounded-3xl border border-[#F3F4F6] shadow-sm flex justify-between items-center"
          >
            <div className="flex gap-4 items-center">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center",
                item.type === 'in' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {item.type === 'in' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-black text-text-main text-sm truncate max-w-[150px]">
                  {item.category === 'subscription' ? `Pay: ${item.userName}` : item.category.toUpperCase()}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-text-muted text-[10px] font-bold">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-slate-200 text-xs">•</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider",
                    item.status === 'approved' ? "text-emerald-500" : "text-amber-500"
                  )}>{item.status}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-black text-base",
                item.type === 'in' ? "text-emerald-600" : "text-rose-600"
              )}>
                {item.type === 'in' ? '+' : '-'} Rs. {item.amount}
              </p>
              <div className="flex gap-1 justify-end mt-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-primary hover:bg-bg-gray rounded-lg">
                  <Receipt className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredHistory.length === 0 && (
          <div className="bg-bg-gray/50 rounded-3xl py-12 flex flex-col items-center justify-center text-center px-6">
            <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-text-muted font-bold text-sm">No transaction records found</p>
            <p className="text-text-muted/60 text-[10px] mt-1">System is monitoring all live wallet activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
