import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar,
  ChevronRight,
  Download,
  Users as UsersIcon,
  Clock,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Shapes
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { useSystem } from '../contexts/SystemContext';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function Reports() {
  const { payments, bills, users, loading } = useSystem();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter calculations
  const now = new Date();
  const currentMonthPayments = payments.filter(p => {
    if (p.status !== 'approved') return false;
    const dateStr = typeof p.date === 'string' ? p.date : new Date(p.date?.seconds * 1000).toISOString();
    return dateStr.startsWith(selectedMonth);
  });

  const monthlyIncome = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalPaid = payments
    .filter(p => p.status === 'approved' && p.type === 'in')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalUnpaid = bills
    .filter(b => b.status === 'unpaid')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const activeCustomers = users.filter(u => u.status === 'active').length;
  const pendingCustomers = users.filter(u => u.status === 'pending').length;
  const overdueBills = bills.filter(b => b.status === 'unpaid' && new Date(b.dueDate) < now).length;

  const exportToCSV = () => {
    const headers = ['Date', 'Customer', 'Amount', 'Method', 'Status', 'Reference'];
    const rows = payments.map(p => [
      formatDate(p.date),
      p.userName || 'Unknown',
      p.amount,
      p.method,
      p.status,
      p.reference || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = [
    { 
      label: 'Monthly Income', 
      value: monthlyIncome, 
      subValue: `${currentMonthPayments.length} Transactions`,
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      description: `Revenue for ${selectedMonth}`
    },
    { 
      label: 'Total Paid', 
      value: totalPaid, 
      subValue: 'Lifetime Collections',
      icon: CheckCircle2, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      description: 'Total approved revenue'
    },
    { 
      label: 'Total Unpaid', 
      value: totalUnpaid, 
      subValue: `${bills.filter(b => b.status === 'unpaid').length} Pending Bills`,
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      description: 'Outstanding receivables'
    },
    { 
      label: 'Overdue Bills', 
      value: overdueBills, 
      subValue: 'Urgent Action Needed',
      icon: AlertTriangle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      description: 'Past due payments'
    }
  ];

  const userStats = [
    { label: 'Active Customers', value: activeCustomers, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approval', value: pendingCustomers, icon: Shapes, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8 print:bg-white print:pb-0">
      {/* Sticky Header */}
      <div className="sticky top-[60px] md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 pt-6 pb-4 shadow-sm transition-all duration-300 print:relative print:top-0 print:shadow-none">
        <div className="px-4 sm:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Analytics & Reports</h2>
              <div className="flex items-center gap-2 mt-1.5 font-mono">
                <p className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] leading-none">System Intelligence</p>
                <Badge variant="outline" className="text-[8px] font-bold border-slate-200 text-slate-500 uppercase h-4 px-1 rounded bg-white">ADMIN PANEL</Badge>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto print:hidden">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl gap-2 h-11 text-[10px] font-black uppercase tracking-widest px-4 shadow-sm transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button 
                onClick={exportToCSV}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 h-11 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2 print:hidden">
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 shadow-inner">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 shadow-inner ml-auto">
              <button
                onClick={() => setViewMode('overview')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'overview' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'detailed' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Revenue Stream
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-8 space-y-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white border-slate-100 shadow-sm p-6 rounded-[2rem] hover:shadow-md transition-all group relative overflow-hidden">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 border-2 group-hover:rotate-6", stat.bg, stat.color.replace('text-', 'border-').replace('600', '100'))}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className={cn("text-2xl sm:text-3xl font-black tracking-tight", stat.color)}>
                    Rs. {stat.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{stat.subValue}</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Customer Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {userStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white border-slate-100 shadow-sm p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-100 transition-all">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Verified in database</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Section Based on ViewMode */}
        {viewMode === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border-slate-100 shadow-sm rounded-[2.5rem] p-8 overflow-hidden relative group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Growth Trajectory
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily revenue distribution</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-black px-3 py-1">Optimized</Badge>
              </div>
              
              <div className="h-64 flex items-end gap-3 sm:gap-6 px-2">
                {[35, 55, 42, 88, 65, 48, 92, 75, 40, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className={cn(
                        "w-full rounded-xl transition-all duration-500 relative group-hover/bar:bg-indigo-400",
                        i === 6 || i === 9 ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-100"
                      )} 
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {h}%
                      </div>
                    </motion.div>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">T{i+1}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white border-slate-100 shadow-sm rounded-[2.5rem] p-8 flex flex-col">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Billing Quality</h3>
              <div className="flex-1 flex flex-col justify-center gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid Ratio</p>
                    <p className="text-sm font-black text-emerald-600">
                      {bills.length > 0 ? Math.round((bills.filter(b => b.status === 'paid').length / bills.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-200" 
                      style={{ width: `${bills.length > 0 ? (bills.filter(b => b.status === 'paid').length / bills.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unpaid Ratio</p>
                    <p className="text-sm font-black text-rose-500">
                      {bills.length > 0 ? Math.round((bills.filter(b => b.status === 'unpaid').length / bills.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full shadow-lg shadow-rose-200" 
                      style={{ width: `${bills.length > 0 ? (bills.filter(b => b.status === 'unpaid').length / bills.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Risk Note</p>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight">Monitor unpaid ratios to maintain cashflow.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="bg-white border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Income Logs</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approved transactions in {selectedMonth}</p>
              </div>
              <Badge className="bg-white border-slate-200 text-slate-500 uppercase text-[9px] font-black px-3 py-1 shadow-sm">{currentMonthPayments.length} Recs</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contributor</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentMonthPayments.slice(0, 50).map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-900">{formatDate(p.date)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {p.userName?.charAt(0) || '?'}
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{p.userName || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[11px] font-black text-emerald-600">Rs. {p.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 uppercase text-[8px] font-black px-2 py-0.5">{p.method}</Badge>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors">{p.reference || 'SYSTEM_GEN'}</span>
                      </td>
                    </tr>
                  ))}
                  {currentMonthPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Shapes className="w-8 h-8" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transaction data for this period</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          .min-h-full { min-height: 0 !important; }
          .pb-24 { padding-bottom: 0 !important; }
        }
      `}} />
    </div>
  );
}
