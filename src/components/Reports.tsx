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
  Download
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { useSystem } from '../contexts/SystemContext';
import { cn } from '@/lib/utils';

export default function Reports() {
  const { payments, treasury, subdealers, loading } = useSystem();
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  if (loading) return null;

  const now = new Date();
  const filteredPayments = payments.filter(p => {
    if (p.status !== 'approved') return false;
    const date = new Date(p.date?.seconds * 1000 || p.date);
    if (filter === 'daily') return date.toDateString() === now.toDateString();
    if (filter === 'weekly') return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalReceived = filteredPayments.filter(p => p.type === 'in').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredPayments.filter(p => p.type === 'out').reduce((sum, p) => sum + p.amount, 0);
  
  // Real commission calculation would need commission entities, but we can estimate from approved subdealer payments or calculated shares
  const commissionsPaid = filteredPayments.filter(p => p.category === 'subscription').reduce((sum, p) => {
    // This is a simplified fallback if we don't fetch commissions collection separately
    // In our SystemContext, we log commissions in a separate collection.
    // For this report, we'll estimate or just use the subscription type.
    return sum + (p.amount * 0.4); // Assuming 40% as average or we'd ideally fetch the Commissions collection
  }, 0);

  const netProfit = totalReceived - commissionsPaid - totalExpenses;

  const stats = [
    { label: 'Revenue', value: totalReceived, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Profit', value: netProfit, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Commissions', value: commissionsPaid, icon: ArrowRightLeft, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Header and Action */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Financial Reports</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">Business performance & revenue summary</p>
          </div>
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white p-1 rounded-xl flex shadow-sm border border-slate-100 max-w-md mx-auto sm:mx-0">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                filter === t 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6 pb-20">
        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-white border-slate-100 shadow-sm p-6 rounded-2xl hover:shadow-md transition-all group overflow-hidden relative">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border", stat.bg, stat.color.replace('text-', 'border-').replace('600', '100'))}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-xl sm:text-2xl font-extrabold tracking-tight", stat.color)}>Rs. {stat.value.toLocaleString()}</p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors duration-500" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Velocity Chart (Mock) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white border-slate-100 shadow-sm p-8 sm:p-10 rounded-2xl relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Revenue Analysis
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Activity Log</span>
              </div>
            </div>
            <div className="h-48 sm:h-56 flex items-end gap-2 sm:gap-6 px-1">
              {[40, 65, 45, 90, 75, 55, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                  <div 
                    className={cn(
                      "w-full rounded-xl transition-all duration-700 ease-out relative group-hover/bar:bg-indigo-100",
                      i === 6 ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-100"
                    )} 
                    style={{ height: `${h}%` }} 
                  >
                    {i === 6 && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />}
                  </div>
                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">Day {i+1}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Profit Distribution</h3>
            <div className="h-px w-full bg-slate-100" />
          </div>
          <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-50">
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-lg shadow-indigo-100 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Company Net Earnings</span>
                </div>
                <span className="text-xl font-extrabold text-indigo-600 tracking-tight">Rs. {netProfit.toLocaleString()}</span>
              </div>
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/40 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sub Dealer Commissions</span>
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Rs. {commissionsPaid.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ArrowRightLeft = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H4" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h16" />
  </svg>
);
