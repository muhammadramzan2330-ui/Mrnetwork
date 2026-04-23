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
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-text-main">Subdealers</h2>
        <div className="flex gap-2">
          <Button onClick={() => setViewHistory(!viewHistory)} variant="outline" className="rounded-[14px] gap-2 h-10 text-xs font-bold border-none bg-white shadow-sm">
            <History className="w-4 h-4" /> {viewHistory ? 'Dealers' : 'Withdrawals'}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button className="bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> New
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Configure Subdealer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Full Name</Label>
                  <Input 
                    placeholder="Zain Ali" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newDealer.name}
                    onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Area / Base</Label>
                  <Input 
                    placeholder="Model Town, Lahore" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newDealer.area}
                    onChange={(e) => setNewDealer({ ...newDealer, area: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Comm. Type</Label>
                    <Select onValueChange={(val: any) => setNewDealer({ ...newDealer, commissionType: val })}>
                      <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (Rs.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Value</Label>
                    <Input 
                      type="number" 
                      placeholder="20" 
                      className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                      value={newDealer.commissionValue}
                      onChange={(e) => setNewDealer({ ...newDealer, commissionValue: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddDealer}
                  className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-14 font-black shadow-xl"
                >
                  Create Partner
                </Button>
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

          <div className="space-y-3 px-1">
            {filteredDealers.map((dealer, i) => {
              const dealerUsers = users.filter(u => u.subdealerId === dealer.id);
              return (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-[28px] border border-[#F3F4F6] shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-[20px] bg-primary/5 flex items-center justify-center text-primary">
                        <Store className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-black text-text-main text-base">{dealer.name}</h4>
                        <p className="text-text-muted text-[10px] font-black flex items-center gap-1 uppercase tracking-wider">
                          <MapPin className="w-3 h-3" /> {dealer.area}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2 py-1 uppercase tracking-widest">
                      {dealer.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-bg-gray/50 p-4 rounded-2xl border border-slate-50">
                      <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">WALLET BALANCE</p>
                      <p className="text-lg font-black text-emerald-600">Rs. {dealer.walletBalance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-bg-gray/50 p-4 rounded-2xl border border-slate-50">
                      <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">TOTAL EARNINGS</p>
                      <p className="text-lg font-black text-primary">Rs. {dealer.totalEarnings?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">COMMISSION</span>
                        <span className="text-xs font-bold text-text-main">{dealer.commissionValue}{dealer.commissionType === 'percentage' ? '%' : ' Rs'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">NETWORK</span>
                        <span className="text-xs font-bold text-text-main">{dealerUsers.length} Customers</span>
                      </div>
                    </div>
      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger
            render={
              <Button onClick={() => setActionDealer(dealer)} variant="ghost" className="h-10 rounded-xl font-black text-[10px] text-primary hover:bg-primary/5">
                <Wallet className="w-4 h-4 mr-2" /> WITHDRAW
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[380px] rounded-[30px] border-none shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Request Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Balance</p>
                  <p className="text-lg font-black text-emerald-700">Rs. {dealer.walletBalance?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subdealer</p>
                  <p className="text-xs font-bold text-slate-600">{dealer.name}</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Amount to Withdraw</Label>
                <Input 
                  type="number"
                  placeholder="Max: Rs. 10,000"
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Payment Method / Bank Account</Label>
                <Input 
                  placeholder="Easypaisa: 0300-XXXXXXX"
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                />
              </div>

              <Button 
                onClick={() => handleWithdrawRequest(dealer.id, dealer.name)}
                disabled={!withdrawAmount || Number(withdrawAmount) > dealer.walletBalance}
                className={cn(
                  "rounded-2xl h-14 font-black text-base shadow-xl transition-all",
                  isConfirming ? "bg-amber-600 text-white animate-pulse" : "bg-primary text-white"
                )}
              >
                {isConfirming ? "CONFIRM REQUEST?" : "SUBMIT REQUEST"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" className="h-10 rounded-xl font-black text-[10px] text-slate-500 hover:bg-bg-gray">
          <TrendingUp className="w-4 h-4 mr-2" /> ANALYTICS
        </Button>
      </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-3 px-1">
          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest ml-1 mb-2">Withdrawal Requests</h3>
          {withdrawalRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-[28px] border border-[#F3F4F6] shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-text-main text-sm">{req.userName}</h4>
                    <p className="text-text-muted text-[10px] font-bold">{formatDate(req.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-text-main">Rs. {req.amount}</p>
                  <Badge className={cn(
                    "border-none font-black text-[8px] tracking-widest",
                    req.status === 'pending' ? "bg-amber-50 text-amber-600" : 
                    req.status === 'resolved' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {req.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {req.status === 'pending' && (
                <div className="flex gap-2 border-t border-slate-50 pt-4 mt-2">
                  <Button 
                    onClick={() => processWithdrawal(req.id, false)}
                    variant="ghost" 
                    className="flex-1 rounded-xl h-10 font-black text-xs text-rose-600 hover:bg-rose-50"
                  >
                    REJECT
                  </Button>
                  <Button 
                    onClick={() => processWithdrawal(req.id, true)}
                    className="flex-1 rounded-xl h-10 font-black text-xs bg-emerald-600 shadow-lg shadow-emerald-100"
                  >
                    APPROVE & PAY
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
          {withdrawalRequests.length === 0 && (
            <div className="bg-bg-gray/50 rounded-3xl py-12 text-center">
              <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-text-muted font-bold text-sm">No pending withdrawals</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
