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
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Subdealers</h2>
          <p className="text-slate-500 text-xs font-medium">Partner management and commission tracking</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setViewHistory(!viewHistory)} variant="outline" className="flex-1 sm:flex-none rounded-xl gap-2 h-11 text-xs font-bold border-slate-200 bg-white shadow-sm px-5 hover:bg-slate-50 transition-colors">
            {viewHistory ? <Store className="w-4 h-4" /> : <History className="w-4 h-4" />}
            {viewHistory ? 'View Dealers' : 'Withdrawal Requests'}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button className="flex-1 sm:flex-none bg-primary hover:bg-primary/95 text-white rounded-xl gap-2 h-11 text-xs font-bold px-6 shadow-lg shadow-primary/10 transition-all active:scale-95">
                  <Plus className="w-4 h-4" /> Add Partner
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[480px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="bg-[#1E293B] p-8 text-white relative overflow-hidden">
                  <DialogHeader className="relative z-10">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Configure Subdealer</DialogTitle>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Partnership Settings</p>
                  </DialogHeader>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                </div>
                <div className="p-8">
                  <div className="grid gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                      <Input 
                        placeholder="e.g. Zain Ali" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-base shadow-sm focus:bg-white"
                        value={newDealer.name}
                        onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Area / Base</Label>
                      <Input 
                        placeholder="e.g. Model Town, Lahore" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-base shadow-sm focus:bg-white"
                        value={newDealer.area}
                        onChange={(e) => setNewDealer({ ...newDealer, area: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Comm. Type</Label>
                        <Select onValueChange={(val: any) => setNewDealer({ ...newDealer, commissionType: val })}>
                          <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-slate-700 shadow-sm focus:bg-white transition-all">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <SelectItem value="percentage" className="font-bold cursor-pointer">Percentage (%)</SelectItem>
                            <SelectItem value="fixed" className="font-bold cursor-pointer">Fixed (Rs.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Commission Value</Label>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-lg focus:bg-white"
                          value={newDealer.commissionValue}
                          onChange={(e) => setNewDealer({ ...newDealer, commissionValue: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddDealer}
                      className="bg-primary hover:bg-primary/95 text-white rounded-xl mt-4 h-14 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                      Onboard Partner
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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search partners by name or region..."
              className="pl-12 rounded-xl border-slate-100 bg-white h-12 text-sm font-medium shadow-sm transition-all focus:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
            {filteredDealers.map((dealer, i) => {
              const dealerUsers = users.filter(u => u.subdealerId === dealer.id);
              return (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full group hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Store className="w-7 h-7" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-base truncate pr-2">{dealer.name}</h4>
                        <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest mt-1.5">
                          <MapPin className="w-3 h-3 text-primary/40" /> {dealer.area}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-3 py-1 uppercase tracking-widest shrink-0">
                      {dealer.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1.5 line-clamp-1">Current Wallet</p>
                      <p className="text-lg font-bold text-emerald-600">Rs. {dealer.walletBalance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1.5 line-clamp-1">Life Gains</p>
                      <p className="text-lg font-bold text-primary">Rs. {dealer.totalEarnings?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex justify-between items-center border-t border-slate-50 pt-5 mt-auto">
                      <div className="flex gap-4 lg:gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Commission</span>
                          <span className="text-xs font-bold text-slate-700">{dealer.commissionValue}{dealer.commissionType === 'percentage' ? '%' : ' Rs'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accounts</span>
                          <span className="text-xs font-bold text-slate-700">{dealerUsers.length} Users</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button onClick={() => setActionDealer(dealer)} variant="ghost" className="h-9 rounded-lg font-bold text-[10px] text-primary hover:bg-primary/5 px-4 tracking-widest uppercase">
                                <Wallet className="w-4 h-4 mr-2" /> Payout
                              </Button>
                            }
                          />
                          <DialogContent className="sm:max-w-[480px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                              <div className="bg-primary p-8 text-white relative overflow-hidden">
                                <DialogHeader className="relative z-10">
                                  <DialogTitle className="text-2xl font-bold tracking-tight">Request Payout</DialogTitle>
                                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Dealer Wallet Transfer</p>
                                </DialogHeader>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                              </div>
                              <div className="p-8">
                                <div className="grid gap-6">
                                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Available Funds</p>
                                      <p className="text-2xl font-bold text-emerald-700">Rs. {dealer.walletBalance?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-emerald-100/50">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                                      <p className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{dealer.name}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Transfer Amount (Rs.)</Label>
                                    <Input 
                                      type="number"
                                      placeholder="0.00"
                                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-lg shadow-sm"
                                      value={withdrawAmount}
                                      onChange={(e) => setWithdrawAmount(e.target.value)}
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Method & Info</Label>
                                    <Input 
                                      placeholder="e.g. Easypaisa: 0300-1234567"
                                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-slate-700 shadow-sm"
                                      value={withdrawDetails}
                                      onChange={(e) => setWithdrawDetails(e.target.value)}
                                    />
                                  </div>

                                  <Button 
                                    onClick={() => handleWithdrawRequest(dealer.id, dealer.name)}
                                    disabled={!withdrawAmount || Number(withdrawAmount) > dealer.walletBalance}
                                    className={cn(
                                      "rounded-xl h-14 font-bold text-base shadow-lg transition-all active:scale-[0.98]",
                                      isConfirming ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 animate-pulse" : "bg-[#1E293B] hover:bg-slate-800 text-white shadow-slate-200"
                                    )}
                                  >
                                    {isConfirming ? "Confirm Withdrawal?" : "Initiate Withdrawal"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1 pb-10">
          {withdrawalRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full group hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{req.userName}</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 line-clamp-1">{formatDate(req.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-800 tracking-tight">Rs. {req.amount}</p>
                </div>
              </div>

              <div className="mb-8 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">Withdrawal Notes</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600 leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all">
                  "{req.description || 'No transfer notes provided'}"
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                <div className={cn(
                  "font-bold text-[9px] px-3 py-1.5 tracking-widest rounded-lg flex items-center gap-1.5",
                  req.status === 'pending' ? "bg-amber-50 text-amber-600" : 
                  req.status === 'resolved' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    req.status === 'pending' ? "bg-amber-400 animate-pulse" : 
                    req.status === 'resolved' ? "bg-emerald-500" : "bg-rose-400"
                  )} />
                  {req.status.toUpperCase()}
                </div>
                
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => processWithdrawal(req.id, false)}
                      variant="ghost" 
                      className="h-9 rounded-lg font-bold text-[10px] text-rose-500 hover:bg-rose-50 px-3 tracking-widest uppercase"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => processWithdrawal(req.id, true)}
                      className="h-9 rounded-lg font-bold text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 px-4 tracking-widest transition-all active:scale-95 uppercase"
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {withdrawalRequests.length === 0 && (
            <div className="col-span-full bg-slate-50/50 rounded-2xl py-20 text-center border-2 border-dashed border-slate-100 mt-4">
              <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No pending withdrawals in queue</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
