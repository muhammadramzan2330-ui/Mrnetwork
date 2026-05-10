import React, { useState } from 'react';
import { 
  Download, 
  Users, 
  FileText, 
  CreditCard, 
  Calendar, 
  Filter, 
  Database,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useSystem } from '../contexts/SystemContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { formatDate, downloadCSV, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ExportData() {
  const { users, bills, payments } = useSystem();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterByDate = (items: any[], dateField: string) => {
    if (!startDate && !endDate) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]?.seconds ? item[dateField].seconds * 1000 : item[dateField]);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      
      return itemDate >= start && itemDate <= end;
    });
  };

  const exportCustomers = () => {
    const activeUsers = users.filter(u => u.role === 'customer');
    const filtered = filterByDate(activeUsers, 'createdAt');
    
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Package', 'Joined Date'];
    const data = filtered.map(u => [
      u.uid || u.id,
      u.name,
      u.email,
      u.phone || '-',
      u.address || '-',
      u.status,
      u.packageName || '-',
      formatDate(u.createdAt)
    ]);

    downloadCSV(`Customers_Export_${formatDate(new Date())}`, headers, data);
    toast.success(`${filtered.length} customers exported`);
  };

  const exportBills = () => {
    const filtered = filterByDate(bills, 'createdAt');
    const headers = ['Bill ID', 'Customer Name', 'Package', 'Amount', 'Month', 'Due Date', 'Status', 'Created At'];
    const data = filtered.map(b => [
      b.id,
      b.userName,
      b.packageName,
      b.amount,
      b.month,
      formatDate(b.dueDate),
      b.status,
      formatDate(b.createdAt)
    ]);

    downloadCSV(`Bills_Export_${formatDate(new Date())}`, headers, data);
    toast.success(`${filtered.length} bills exported`);
  };

  const exportPayments = () => {
    const filtered = filterByDate(payments, 'createdAt');
    const headers = ['Payment ID', 'Customer Name', 'Amount', 'Method', 'Reference', 'Status', 'Date'];
    const data = filtered.map(p => [
      p.id,
      p.userName,
      p.amount,
      p.method,
      p.reference || '-',
      p.status,
      formatDate(p.date || p.createdAt)
    ]);

    downloadCSV(`Payments_Export_${formatDate(new Date())}`, headers, data);
    toast.success(`${filtered.length} payments exported`);
  };

  const exportOptions = [
    {
      title: 'Customer Directory',
      description: 'Export all registered customer profiles and contact details.',
      icon: Users,
      action: exportCustomers,
      count: users.filter(u => u.role === 'customer').length,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      title: 'Billing Records',
      description: 'Export invoice history including payments status and package tiers.',
      icon: FileText,
      action: exportBills,
      count: bills.length,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    {
      title: 'Payment History',
      description: 'Export all approved and pending financial transactions.',
      icon: CreditCard,
      action: exportPayments,
      count: payments.length,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 bg-slate-50 min-h-full">
      <div className="max-w-6xl mx-auto space-y-10">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Backup & Export</h1>
          </div>
          <p className="text-slate-500 font-medium tracking-wide">Securely export system data for offline analysis and backups</p>
        </header>

        {/* Date Filter Bar */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 py-4 px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-600">Export Filters</CardTitle>
              </div>
              <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0.5 border-slate-200 text-slate-400">Optional</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-14 pl-12 bg-white border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-14 pl-12 bg-white border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>
            </div>
            
            {(startDate || endDate) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Active Filter: <span className="text-indigo-600 font-black">{startDate ? formatDate(startDate) : 'Beginning'}</span> to <span className="text-indigo-600 font-black">{endDate ? formatDate(endDate) : 'Today'}</span>
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="h-8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exportOptions.map((option, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={option.title}
            >
              <Card className="bg-white border-slate-100 shadow-sm rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group border-b-4 border-b-transparent hover:border-b-indigo-500 h-full flex flex-col">
                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", option.color)}>
                  <option.icon className="w-8 h-8" />
                </div>
                
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{option.title}</h3>
                  <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[10px] px-2 py-0.5 rounded-lg">{option.count}</Badge>
                </div>
                
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-1">
                  {option.description}
                </p>
                
                <Button 
                  onClick={option.action}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 transition-all group-hover:shadow-lg group-hover:shadow-indigo-200"
                >
                  <Download className="w-4 h-4" /> 
                  Export to CSV
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Safety Note */}
        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Automated Reporting operational</h3>
                <p className="text-indigo-100 font-medium max-w-xl">All exports are generated client-side for maximum security. Ensure you keep your backup files in a encrypted and secure location.</p>
              </div>
              <div className="md:ml-auto">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-600 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2"
                  onClick={() => window.print()}
                >
                  Full System Audit Print
                </Button>
              </div>
           </div>
           
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
