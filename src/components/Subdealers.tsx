import React, { useState } from 'react';
import { Plus, Search, Store, MoreVertical, Phone, MapPin, Shield, ShieldOff, RefreshCw, Package, Wallet, TrendingUp, DollarSign, History, CheckCircle2, XCircle } from 'lucide-react';
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
import { addDocument } from '../services/firebase';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';

export default function Subdealers() {
  const { subdealers, users, requests, processWithdrawal, requestWithdrawal } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [actionDealer, setActionDealer] = useState<any>(null);

  const handleWithdrawRequest = async (dealerId: string, dealerName: string) => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    // Simulation: setting temporal subdealerId in localStorage for SystemContext to pick up
    localStorage.setItem('subdealerId', dealerId);
    await requestWithdrawal(Number(withdrawAmount), withdrawDetails);
    setWithdrawAmount('');
    setWithdrawDetails('');
    setIsConfirming(false);
  };

  const [newDealer, setNewDealer] = useState({
    name: '',
    area: '',
    commissionType: 'percentage',
    commissionValue: '',
  });

  const handleAddDealer = async () => {
    if (!newDealer.name || !newDealer.commissionValue) return;

    try {
      await addDocument('subdealers', {
        ...newDealer,
        commissionValue: Number(newDealer.commissionValue),
        walletBalance: 0,
        totalEarnings: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      toast.success('Subdealer added successfully');
      setIsOpen(false);
    } catch (e) {
      toast.error('Failed to add subdealer');
    }
  };

  const filteredDealers = subdealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const withdrawalRequests = requests.filter(r => r.type === 'withdrawal');

  return (
    <div className="p-2 space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
        <h2 className="text-xl font-black text-text-main">Subdealers</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setViewHistory(!viewHistory)} variant="outline" className="flex-1 sm:flex-none rounded-[14px] gap-2 h-10 text-[10px] font-black border-none bg-white shadow-sm px-4">
            <History className="w-4 h-4" /> {viewHistory ? 'DEALERS' : 'REQUESTS'}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> New
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-8">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black tracking-tight">Configure Subdealer</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Full Name</Label>
                      <Input 
                        placeholder="Zain Ali" 
                        className="rounded-2xl bg-bg-gray border-none h-14 px-5 font-bold text-base focus-visible:ring-primary/20"
                        value={newDealer.name}
                        onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Area / Base</Label>
                      <Input 
                        placeholder="Model Town, Lahore" 
                        className="rounded-2xl bg-bg-gray border-none h-14 px-5 font-bold text-base focus-visible:ring-primary/20"
                        value={newDealer.area}
                        onChange={(e) => setNewDealer({ ...newDealer, area: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="block text-[11px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Comm. Type</Label>
                        <Select onValueChange={(val: any) => setNewDealer({ ...newDealer, commissionType: val })}>
                          <SelectTrigger className="w-full rounded-2xl bg-border/20 border-none h-16 px-6 font-bold text-base focus:ring-2 focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Select Type" className="h-full flex items-center" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                            <SelectItem value="percentage" className="rounded-xl font-bold py-3 cursor-pointer">Percentage (%)</SelectItem>
                            <SelectItem value="fixed" className="rounded-xl font-bold py-3 cursor-pointer">Fixed (Rs.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="block text-[11px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Commission Value</Label>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          className="rounded-2xl bg-bg-gray border-none h-16 px-6 font-bold text-lg focus-visible:ring-primary/20"
                          value={newDealer.commissionValue}
                          onChange={(e) => setNewDealer({ ...newDealer, commissionValue: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddDealer}
                      className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-16 font-black text-lg shadow-xl shadow-primary/30 transition-all hover:scale-[1.01]"
                    >
                      Create Partner
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!viewHistory ? (
        <>
          <div className="relative px-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search by name or area..."
              className="pl-12 rounded-[18px] border border-[#F3F4F6] bg-white h-12 text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-1">
            {filteredDealers.map((dealer, i) => {
              const dealerUsers = users.filter(u => u.subdealerId === dealer.id);
              return (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-[32px] border border-[#F3F4F6] shadow-sm flex flex-col h-full group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-[22px] bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Store className="w-8 h-8" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-text-main text-base truncate">{dealer.name}</h4>
                        <p className="text-text-muted text-[10px] font-black flex items-center gap-1 uppercase tracking-widest mt-1">
                          <MapPin className="w-3 h-3 text-primary/40" /> {dealer.area}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest shrink-0">
                      {dealer.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-bg-gray/50 p-4 rounded-2xl border border-white">
                      <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">BALANCE</p>
                      <p className="text-lg font-black text-emerald-600">Rs. {dealer.walletBalance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-bg-gray/50 p-4 rounded-2xl border border-white">
                      <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">TOTAL IN</p>
                      <p className="text-lg font-black text-primary">Rs. {dealer.totalEarnings?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex justify-between items-center border-t border-slate-50 pt-5 mt-auto">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">COMMISSION</span>
                          <span className="text-xs font-bold text-text-main">{dealer.commissionValue}{dealer.commissionType === 'percentage' ? '%' : ' Rs'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">CUSTOMERS</span>
                          <span className="text-xs font-bold text-text-main">{dealerUsers.length} Users</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button onClick={() => setActionDealer(dealer)} variant="ghost" className="h-10 rounded-xl font-black text-[10px] text-primary hover:bg-primary/5 px-3">
                                <Wallet className="w-4 h-4 mr-2" /> WITHDRAW
                              </Button>
                            }
                          />
                          <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                              <div className="p-8">
                                <DialogHeader className="mb-6">
                                  <DialogTitle className="text-2xl font-black tracking-tight">Request Withdrawal</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6">
                                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Balance</p>
                                      <p className="text-xl font-black text-emerald-700">Rs. {dealer.walletBalance?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-emerald-100/50">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subdealer</p>
                                      <p className="text-xs font-bold text-slate-600 truncate max-w-[200px]">{dealer.name}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Amount to Withdraw</Label>
                                    <Input 
                                      type="number"
                                      placeholder="Max: Rs. 10,000"
                                      className="rounded-2xl bg-bg-gray border-none h-14 px-5 font-bold text-lg"
                                      value={withdrawAmount}
                                      onChange={(e) => setWithdrawAmount(e.target.value)}
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Payment Method Info</Label>
                                    <Input 
                                      placeholder="Easypaisa: 0300-XXXXXXX"
                                      className="rounded-2xl bg-bg-gray border-none h-14 px-5 font-bold text-base"
                                      value={withdrawDetails}
                                      onChange={(e) => setWithdrawDetails(e.target.value)}
                                    />
                                  </div>

                                  <Button 
                                    onClick={() => handleWithdrawRequest(dealer.id, dealer.name)}
                                    disabled={!withdrawAmount || Number(withdrawAmount) > dealer.walletBalance}
                                    className={cn(
                                      "rounded-2xl h-16 font-black text-lg shadow-xl transition-all",
                                      isConfirming ? "bg-amber-600 text-white animate-pulse" : "bg-primary text-white"
                                    )}
                                  >
                                    {isConfirming ? "CONFIRM REQUEST?" : "SUBMIT REQUEST"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-1">
          {withdrawalRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 10 }}
              className="bg-white p-6 rounded-[32px] border border-[#F3F4F6] shadow-sm flex flex-col h-full group hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-[18px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-text-main text-sm">{req.userName}</h4>
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-0.5">{formatDate(req.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-text-main tracking-tight">Rs. {req.amount}</p>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Payout Details</p>
                <div className="bg-bg-gray/40 p-4 rounded-2xl border border-white text-xs font-bold text-slate-600 leading-relaxed italic">
                  "{req.description || 'No details provided'}"
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                <Badge className={cn(
                  "border-none font-black text-[9px] px-3 py-1 tracking-widest shadow-none",
                  req.status === 'pending' ? "bg-amber-100 text-amber-600" : 
                  req.status === 'resolved' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {req.status.toUpperCase()}
                </Badge>
                
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => processWithdrawal(req.id, false)}
                      variant="ghost" 
                      className="h-10 rounded-xl font-black text-[10px] text-rose-600 hover:bg-rose-50 px-3 tracking-widest"
                    >
                      REJECT
                    </Button>
                    <Button 
                      onClick={() => processWithdrawal(req.id, true)}
                      className="h-10 rounded-xl font-black text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 px-4 lg:px-5 tracking-widest"
                    >
                      APPROVE
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {withdrawalRequests.length === 0 && (
            <div className="col-span-full bg-bg-gray/50 rounded-[40px] py-20 text-center border-2 border-dashed border-slate-200">
              <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-text-muted font-black text-xs uppercase tracking-widest">No pending withdrawals in queue</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
