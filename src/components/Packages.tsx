import React, { useState } from 'react';
import { Plus, Search, Package, Zap, DollarSign, Clock, ArrowUp, ArrowDown, Edit2, Trash2, Power, Globe, ShieldCheck, XCircle } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { addDocument, updateDocument, deleteDocument } from '../services/firebase';
import { toast } from 'sonner';

export default function Packages() {
  const { profile, isAdmin } = useAuth();
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
    if (!isAdmin) return;
    if (!newPkg.name || !newPkg.price) return;

    try {
      await addDocument('packages', {
        name: newPkg.name,
        packageName: newPkg.name, // Required field
        speed: newPkg.speed || '10 Mbps',
        price: Number(newPkg.price),
        duration: 'monthly', // Required field
        status: 'active', // Required field
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
    if (!isAdmin) return;
    try {
      await updateDocument('packages', id, { enabled: !currentStatus });
      toast.info(`Package ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Delete this package?')) {
      try {
        await deleteDocument('packages', id);
        toast.success('Deleted');
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredPackages = packages
    .filter(p => isAdmin || p.enabled)
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.speed.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Sticky Top Header Section */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 pt-6 pb-4 shadow-sm transition-all duration-300">
        <div className="px-4 sm:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Service Plans</h2>
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 leading-none font-mono">
                {isAdmin ? 'System Pricing Registry' : 'Available ISP Packages'}
              </p>
            </div>
            {isAdmin && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 h-11 text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Add Service Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
                  <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="header-gradient p-8 text-white relative">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">Create Internet Plan</DialogTitle>
                      </DialogHeader>
                      <p className="text-white/60 text-[11px] font-bold mt-2 uppercase tracking-widest">Set up a new internet package</p>
                    </div>
                    <div className="p-6 sm:p-8 space-y-6 text-slate-900">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Plan Name</Label>
                          <Input 
                            placeholder="e.g. Pro Gamer Fiber" 
                            className="input-modern px-4 h-12"
                            value={newPkg.name}
                            onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Speed Label</Label>
                            <Input 
                              placeholder="50 Mbps" 
                              className="input-modern px-4 h-12"
                              value={newPkg.speed}
                              onChange={(e) => setNewPkg({ ...newPkg, speed: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Price (Rs.)</Label>
                            <Input 
                              type="number" 
                              placeholder="3000" 
                              className="input-modern font-bold text-emerald-600 px-4 h-12"
                              value={newPkg.price}
                              onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleAddPackage}
                          className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                        >
                          Save Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2">
            <div className="relative group w-full md:max-w-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 group-focus-within:border-indigo-100 transition-all">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Search Internet Plans (Name, Speed, Code)..."
                className="input-modern pl-14 pr-12 h-14 text-sm font-bold border-slate-200 bg-white shadow-md focus:shadow-lg focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 shadow-inner ml-auto">
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px] font-black h-8 px-4 rounded-lg uppercase tracking-wider">
                {filteredPackages.length} Plans Available
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Feed */}
      <div className="px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredPackages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <Card className={cn(
              "bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col relative",
              !pkg.enabled && "opacity-60 grayscale bg-slate-50"
            )}>
              <div className="p-6 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm">{pkg.name}</h4>
                    <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mt-1">{pkg.speed}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      onClick={() => togglePackage(pkg.id, pkg.enabled)}
                      variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100"
                    >
                      <Power className={cn("w-3.5 h-3.5", pkg.enabled ? "text-emerald-500" : "text-slate-400")} />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(pkg.id)}
                      variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="px-6 grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mb-1">Monthly Price</p>
                  <p className="text-lg font-extrabold text-slate-900 tracking-tight">Rs. {(pkg.price + (pkg.tax || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mb-1">Validity</p>
                  <p className="text-lg font-extrabold text-slate-900 tracking-tight">{pkg.validity} Days</p>
                </div>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Uplink</span>
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5"><ArrowUp className="w-3 h-3" /> {pkg.upload}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Downlink</span>
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5"><ArrowDown className="w-3 h-3" /> {pkg.download}</span>
                    </div>
                  </div>
                  {pkg.enabled && (
                    <div className="bg-emerald-50 text-emerald-600 font-bold text-[8px] tracking-widest uppercase py-1 px-3 rounded-full flex items-center gap-2 border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </div>
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
