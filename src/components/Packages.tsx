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
    <div className="p-2 space-y-4 pb-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-text-main">Internet Plans</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Plan
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-text-main">New Internet Plan</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Plan Name</Label>
                <Input 
                  placeholder="Pro Gamer Pack" 
                  className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                  value={newPkg.name}
                  onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Speed String</Label>
                  <Input 
                    placeholder="50 Mbps" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newPkg.speed}
                    onChange={(e) => setNewPkg({ ...newPkg, speed: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Base Price</Label>
                  <Input 
                    type="number" 
                    placeholder="3000" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newPkg.price}
                    onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Subdealer Share</Label>
                  <Input 
                    type="number"
                    placeholder="590"
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-emerald-600"
                    value={newPkg.subdealerShare}
                    onChange={(e) => setNewPkg({ ...newPkg, subdealerShare: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Admin Share</Label>
                  <Input 
                    type="number"
                    placeholder="910"
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-primary"
                    value={newPkg.adminShare}
                    onChange={(e) => setNewPkg({ ...newPkg, adminShare: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Upload</Label>
                  <Input 
                    placeholder="25 Mbps" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newPkg.upload}
                    onChange={(e) => setNewPkg({ ...newPkg, upload: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">Download</Label>
                  <Input 
                    placeholder="50 Mbps" 
                    className="rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold"
                    value={newPkg.download}
                    onChange={(e) => setNewPkg({ ...newPkg, download: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddPackage}
                className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-14 font-black shadow-xl"
              >
                Launch Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search internet plans..."
          className="pl-12 rounded-[18px] border border-[#F3F4F6] bg-white h-12 text-sm font-medium shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 px-1">
        {filteredPackages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-[28px] border border-[#F3F4F6] shadow-sm overflow-hidden transition-all ${!pkg.enabled ? 'opacity-60 saturate-50' : ''}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center ${pkg.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-bg-gray text-text-muted'}`}>
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-text-main text-base">{pkg.name}</h4>
                    <p className="text-indigo-600 text-[11px] font-black uppercase tracking-widest">{pkg.speed}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    onClick={() => togglePackage(pkg.id, pkg.enabled)}
                    variant="ghost" size="icon" className={`h-10 w-10 rounded-xl ${pkg.enabled ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-50' }`}
                  >
                    <Power className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(pkg.id)}
                    variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-bg-gray/40 p-4 rounded-2xl border border-white">
                  <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">TOTAL COST</p>
                  <p className="text-lg font-black text-text-main">Rs. {(pkg.price + (pkg.tax || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-bg-gray/40 p-4 rounded-2xl border border-white">
                  <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mb-1">VALIDITY</p>
                  <p className="text-lg font-black text-text-main">{pkg.validity} Days</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex gap-5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">UPLOAD</span>
                    <span className="text-xs font-bold flex items-center gap-1"><ArrowUp className="w-3 h-3 text-emerald-500" /> {pkg.upload}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">DOWNLOAD</span>
                    <span className="text-xs font-bold flex items-center gap-1"><ArrowDown className="w-3 h-3 text-indigo-500" /> {pkg.download}</span>
                  </div>
                </div>
                {pkg.enabled && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] tracking-widest uppercase py-1 px-3">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
