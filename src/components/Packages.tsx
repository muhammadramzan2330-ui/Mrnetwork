import React, { useState } from 'react';
import { Plus, Search, Package, Zap, DollarSign, Clock, ArrowUp, ArrowDown, Edit2, Trash2, Power, Globe, ShieldCheck } from 'lucide-react';
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
import { motion } from 'motion/react';
import { useSystem } from '../contexts/SystemContext';
import { cn } from '@/lib/utils';
import { addDocument, updateDocument, deleteDocument } from '../services/firebase';
import { toast } from 'sonner';

export default function Packages() {
  const { packages } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [newPkg, setNewPkg] = useState({
    name: '',
    speed: '',
    price: '',
    tax: '',
    validity: '30',
    upload: '',
    download: '',
    subdealerShare: '590',
    adminShare: '910'
  });

  const handleAddPackage = async () => {
    if (!newPkg.name || !newPkg.price) return;

    try {
      await addDocument('packages', {
        name: newPkg.name,
        speed: newPkg.speed || '10 Mbps',
        price: Number(newPkg.price),
        subdealerShare: Number(newPkg.subdealerShare),
        adminShare: Number(newPkg.adminShare),
        tax: Number(newPkg.tax || 0),
        validity: Number(newPkg.validity),
        upload: newPkg.upload || '5 Mbps',
        download: newPkg.download || '10 Mbps',
        enabled: true,
        createdAt: new Date().toISOString()
      });
      setNewPkg({ name: '', speed: '', price: '', tax: '', validity: '30', upload: '', download: '', subdealerShare: '590', adminShare: '910' });
      setIsOpen(false);
      toast.success('Package saved');
    } catch (e) {
      toast.error('Failed to save package');
    }
  };

  const togglePackage = async (id: string, currentStatus: boolean) => {
    try {
      await updateDocument('packages', id, { enabled: !currentStatus });
      toast.info(`Package ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this package?')) {
      try {
        await deleteDocument('packages', id);
        toast.success('Deleted');
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.speed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Internet Plans</h2>
          <p className="text-slate-500 text-xs font-medium">Configure service tiers and subscription models</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="w-full sm:w-auto bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl gap-2 h-11 text-sm font-bold px-6 shadow-lg shadow-slate-200 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Create New Plan
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[540px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-[#1E293B] p-8 text-white relative overflow-hidden">
                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-2xl font-bold tracking-tight">New Service Plan</DialogTitle>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Package Configuration</p>
                </DialogHeader>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              </div>
              <div className="p-8">
                <div className="grid gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Plan Name</Label>
                    <Input 
                      placeholder="e.g. Pro Gamer Fiber" 
                      className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-base shadow-sm transition-all focus:bg-white"
                      value={newPkg.name}
                      onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Speed Label</Label>
                      <Input 
                        placeholder="50 Mbps" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-base shadow-sm transition-all focus:bg-white"
                        value={newPkg.speed}
                        onChange={(e) => setNewPkg({ ...newPkg, speed: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Base Price (Rs.)</Label>
                      <Input 
                        type="number" 
                        placeholder="3000" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-lg text-emerald-600 shadow-sm transition-all focus:bg-white"
                        value={newPkg.price}
                        onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subdealer Share</Label>
                      <Input 
                        type="number"
                        placeholder="590"
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-slate-700 shadow-sm transition-all focus:bg-white"
                        value={newPkg.subdealerShare}
                        onChange={(e) => setNewPkg({ ...newPkg, subdealerShare: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Admin Share</Label>
                      <Input 
                        type="number"
                        placeholder="910"
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-bold text-slate-700 shadow-sm transition-all focus:bg-white"
                        value={newPkg.adminShare}
                        onChange={(e) => setNewPkg({ ...newPkg, adminShare: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Upload Speed</Label>
                      <Input 
                        placeholder="25 Mbps" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-slate-700 shadow-sm transition-all focus:bg-white"
                        value={newPkg.upload}
                        onChange={(e) => setNewPkg({ ...newPkg, upload: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Download Speed</Label>
                      <Input 
                        placeholder="50 Mbps" 
                        className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-slate-700 shadow-sm transition-all focus:bg-white"
                        value={newPkg.download}
                        onChange={(e) => setNewPkg({ ...newPkg, download: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddPackage}
                    className="bg-primary hover:bg-primary/95 text-white rounded-xl mt-4 h-14 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    Deploy New Plan
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Filter by plan name or speed..."
          className="pl-12 rounded-xl border-slate-100 bg-white h-12 text-sm font-medium shadow-sm transition-all focus:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
        {filteredPackages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300",
              !pkg.enabled && "opacity-60 saturate-0"
            )}
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 min-w-0">
                  <div className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    pkg.enabled ? "bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <Globe className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-base truncate pr-2">{pkg.name}</h4>
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1.5">{pkg.speed}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button 
                    onClick={() => togglePackage(pkg.id, pkg.enabled)}
                    variant="ghost" size="icon" className={cn(
                      "h-9 w-9 rounded-lg transition-all",
                      pkg.enabled ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(pkg.id)}
                    variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1.5 line-clamp-1">Retail Price</p>
                  <p className="text-lg font-bold text-slate-800">Rs. {(pkg.price + (pkg.tax || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1.5">Cycle</p>
                  <p className="text-lg font-bold text-slate-800">{pkg.validity} Days</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-auto">
                <div className="flex gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Upload</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><ArrowUp className="w-3 h-3 text-emerald-500" /> {pkg.upload}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Download</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><ArrowDown className="w-3 h-3 text-primary" /> {pkg.download}</span>
                  </div>
                </div>
                {pkg.enabled && (
                  <div className="bg-emerald-50 text-emerald-600 font-bold text-[9px] tracking-widest uppercase py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
