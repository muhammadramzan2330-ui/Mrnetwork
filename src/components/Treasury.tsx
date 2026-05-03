import React, { useState } from 'react';
import { Search, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download, Plus, Receipt, DollarSign, Tag, FileText, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Header and Action */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Main Treasury</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">Manage company funds & overheads</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Dialog open={isWithdrawOpen} onOpenChange={(val) => {
              setIsWithdrawOpen(val);
              if (!val) setIsConfirming(false);
            }}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-3 h-12 text-[10px] font-bold px-8 shadow-lg shadow-rose-500/20 transition-all active:scale-95 uppercase tracking-wider">
                  <TrendingDown className="w-4 h-4" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
                <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="bg-rose-500 p-8 text-white relative overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-extrabold tracking-tight">Withdraw Funds</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/60 text-[10px] font-bold mt-2 uppercase tracking-widest">External Transfer Initiative</p>
                  </div>
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1.5">Treasury Reserve</p>
                      <p className="text-3xl font-extrabold text-rose-700 tracking-tight leading-none">Rs. {treasury?.balance?.toLocaleString() || '0'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Magnitude (Rs.)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="input-modern h-16 text-center font-extrabold text-2xl"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Destination</Label>
                      <Input 
                        placeholder="e.g. Bank Account / ID" 
                        className="input-modern"
                        value={withdrawDetails}
                        onChange={(e) => setWithdrawDetails(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || Number(withdrawAmount) > (treasury?.balance || 0)}
                      className={cn(
                        "w-full h-14 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 mt-4",
                        isConfirming ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20" : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                      )}
                    >
                      {isConfirming ? "Confirm Transfer?" : "Execute Liquidation"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white gap-3 h-12 text-[10px] font-bold px-6 shadow-sm text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-wider">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6 pb-20">
        {/* Main Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-white border-slate-100 shadow-sm p-8 sm:p-10 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Wallet className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Consolidated Vault Reserve</p>
              </div>
              <h3 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-10 tracking-tight">Rs. {treasury?.balance?.toLocaleString() || '0'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Cycle Inflow</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-xl text-emerald-600 tracking-tight">Rs. {treasury?.monthIn?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Cycle Burn</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-xl text-rose-600 tracking-tight">Rs. {treasury?.monthOut?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border-slate-100 shadow-sm p-6 rounded-2xl group hover:shadow-md transition-all">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Today's Revenue</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-white border-slate-100 shadow-sm p-6 rounded-2xl group hover:shadow-md transition-all">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Active Burn</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all border border-rose-100">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and History */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search history by name or category..."
              className="input-modern pl-12 h-12 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Registry</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Live Log</span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="bg-white border-slate-100 shadow-sm p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all border",
                      item.type === 'in' ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"
                    )}>
                      {item.type === 'in' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm leading-none mt-1">
                        {item.category === 'subscription' ? `${item.userName}` : item.category.toUpperCase()}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest leading-none">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <Badge className={cn(
                          "bg-transparent border-none text-[8px] font-bold p-0 uppercase tracking-widest hover:bg-transparent",
                          item.status === 'approved' ? "text-emerald-500" : "text-orange-500"
                        )}>
                          • {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <p className={cn(
                      "font-extrabold text-xl tracking-tight",
                      item.type === 'in' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {item.type === 'in' ? '+' : '-'} Rs. {item.amount.toLocaleString()}
                    </p>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary transition-all">
                        <Receipt className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary transition-all">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 mx-auto border border-slate-100">
                  <TrendingUp className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
