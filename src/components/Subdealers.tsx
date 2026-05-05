import React, { useState } from 'react';
import { Plus, Search, Store, MoreVertical, Phone, MapPin, Shield, ShieldOff, RefreshCw, Package, Wallet, TrendingUp, DollarSign, History, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8 text-slate-900">
      {/* Header and Action */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">Sub Dealers</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">Manage your sub dealer network & partnerships</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button 
              onClick={() => setViewHistory(!viewHistory)} 
              variant="outline" 
              className="flex-1 sm:flex-none rounded-xl gap-3 h-12 text-[10px] font-bold border-slate-200 bg-white shadow-sm px-6 hover:bg-slate-50 text-slate-600 transition-all uppercase tracking-wider"
            >
              {viewHistory ? <Store className="w-4 h-4" /> : <History className="w-4 h-4" />}
              {viewHistory ? 'Dealer Grid' : 'Payout History'}
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-3 h-12 text-[10px] font-bold px-8 shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase tracking-wider">
                  <Plus className="w-4 h-4" /> 
                  <span>Add Sub Dealer</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
                <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="header-gradient p-8 text-white relative">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-extrabold tracking-tight">Dealer Configuration</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/60 text-[10px] font-bold mt-2 uppercase tracking-widest leading-none">Register a new sub dealer partnership</p>
                  </div>
                  <div className="p-6 sm:p-8 space-y-6 text-slate-900">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Dealer Name</Label>
                        <Input 
                          placeholder="e.g. Zain Ali" 
                          className="input-modern px-4 h-12"
                          value={newDealer.name}
                          onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Region / Area</Label>
                        <Input 
                          placeholder="e.g. Model Town, Lahore" 
                          className="input-modern px-4 h-12"
                          value={newDealer.area}
                          onChange={(e) => setNewDealer({ ...newDealer, area: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Commission Type</Label>
                          <Select onValueChange={(val: any) => setNewDealer({ ...newDealer, commissionType: val })} defaultValue={newDealer.commissionType}>
                            <SelectTrigger className="input-modern w-full px-4 h-12">
                              <SelectValue placeholder="Protocol" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                              <SelectItem value="percentage" className="font-bold py-3 text-[10px] tracking-widest">Percentage (%)</SelectItem>
                              <SelectItem value="fixed" className="font-bold py-3 text-[10px] tracking-widest">Fixed (Rs.)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Commission Value</Label>
                          <Input 
                            type="number" 
                            placeholder="20" 
                            className="input-modern text-center font-bold text-indigo-600 px-4 h-12"
                            value={newDealer.commissionValue}
                            onChange={(e) => setNewDealer({ ...newDealer, commissionValue: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleAddDealer}
                        className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                      >
                        Create Partnership
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!viewHistory && (
          <div className="relative group pt-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
            <Input
              placeholder="Search sub dealers by name or area..."
              className="input-modern pl-12 h-12 shadow-sm px-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="px-4 sm:px-8 pb-20">
        {!viewHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredDealers.map((dealer, i) => {
              const dealerUsers = users.filter(u => u.subdealerId === dealer.id);
              return (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col relative text-slate-900">
                    <div className="p-6 flex justify-between items-start mb-2">
                      <div className="flex gap-4 min-w-0 px-1">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                          <Store className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm leading-none mt-1">{dealer.name}</h4>
                          <div className="flex items-center gap-1.5 mt-2">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">{dealer.area}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 bg-white shadow-xl p-1 w-48">
                          <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-widest py-3 gap-3 focus:bg-slate-50 cursor-pointer">
                            <RefreshCw className="w-4 h-4 text-slate-400" /> Adjust Commission
                          </DropdownMenuItem>
                          <Dialog open={actionDealer?.id === dealer.id} onOpenChange={(val) => {
                            if (val) setActionDealer(dealer);
                            else setActionDealer(null);
                          }}>
                            <DialogTrigger asChild>
                              <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-widest py-3 gap-3 focus:bg-slate-50 cursor-pointer text-rose-600" onSelect={(e) => e.preventDefault()}>
                                <Wallet className="w-4 h-4" /> Request Payout
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
                              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                                <div className="bg-indigo-600 p-8 text-white relative">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-extrabold tracking-tight">Request Payout</DialogTitle>
                                  </DialogHeader>
                                  <p className="text-white/60 text-[10px] font-bold mt-2 uppercase tracking-widest">Withdrawal from dealer wallet</p>
                                </div>
                                <div className="p-6 sm:p-8 space-y-6">
                                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Wallet Balance</p>
                                    <p className="text-3xl font-extrabold text-indigo-900 tracking-tight leading-none">Rs. {dealer.walletBalance?.toLocaleString()}</p>
                                  </div>
                                  <div className="space-y-2 text-slate-900">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payout Amount (Rs.)</Label>
                                    <Input 
                                      type="number" 
                                      placeholder="0.00" 
                                      className="input-modern h-16 text-center font-extrabold text-2xl px-4"
                                      value={withdrawAmount}
                                      onChange={(e) => setWithdrawAmount(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payout Method / Details</Label>
                                    <Input 
                                      placeholder="e.g. Easypaisa 0300..." 
                                      className="input-modern px-4 h-12"
                                      value={withdrawDetails}
                                      onChange={(e) => setWithdrawDetails(e.target.value)}
                                    />
                                  </div>
                                  <Button 
                                    onClick={() => handleWithdrawRequest(dealer.id, dealer.name)}
                                    disabled={!withdrawAmount || Number(withdrawAmount) > dealer.walletBalance}
                                    className={cn(
                                      "w-full h-14 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 mt-4",
                                      isConfirming ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20" : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                                    )}
                                  >
                                    {isConfirming ? "Confirm Payout?" : "Submit Payout Request"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-widest py-3 gap-3 focus:bg-rose-50 cursor-pointer text-rose-600">
                            {dealer.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {dealer.status === 'active' ? 'Suspend Dealer' : 'Reactivate Dealer'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="px-6 py-4 grid grid-cols-2 gap-4 border-y border-slate-50 bg-slate-50/30">
                      <div>
                        <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mb-1.5">Wallet</p>
                        <p className="font-extrabold text-indigo-600 text-sm tracking-tight">Rs. {dealer.walletBalance?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mb-1.5">Earnings</p>
                        <p className="font-extrabold text-emerald-600 text-sm tracking-tight">Rs. {dealer.totalEarnings?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-6 mt-auto">
                      <div className="flex justify-between items-center mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscribers</span>
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] tracking-tight">{dealerUsers.length}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 px-1">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          dealer.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                        )} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dealer.status}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {withdrawalRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col p-6 text-slate-900">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shrink-0">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm leading-none mt-1">{req.userName}</h4>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-2 px-1">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right px-1">
                      <p className="font-extrabold text-xl text-slate-900 tracking-tight leading-none px-1">Rs. {req.amount}</p>
                    </div>
                  </div>

                  <div className="mb-6 flex-1 px-1">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-2 px-1">Payout Details</p>
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 leading-relaxed italic">
                      "{req.description || 'No details provided'}"
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 px-1">
                    <div className={cn(
                      "font-bold text-[8px] px-3 py-1 tracking-widest rounded-lg uppercase flex items-center gap-2",
                      req.status === 'pending' ? "bg-orange-50 text-orange-600 border border-orange-100" : 
                      req.status === 'resolved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        req.status === 'pending' ? "bg-orange-500 animate-pulse" : 
                        req.status === 'resolved' ? "bg-emerald-500" : "bg-rose-500"
                      )} />
                      {req.status}
                    </div>
                    
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => processWithdrawal(req.id, false)}
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-3 rounded-lg font-bold text-[9px] text-rose-500 hover:bg-rose-50 uppercase tracking-wider"
                        >
                          Reject
                        </Button>
                        <Button 
                          onClick={() => processWithdrawal(req.id, true)}
                          size="sm"
                          className="h-8 px-4 rounded-lg font-bold text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all active:scale-95 uppercase tracking-wider"
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
            {withdrawalRequests.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">No Pending Payouts</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
