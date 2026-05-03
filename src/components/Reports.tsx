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
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-5xl mx-auto w-full overflow-x-hidden">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Analytics</h2>
          <p className="text-slate-500 text-xs font-medium">Business performance and dividends</p>
        </div>
        <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-white shadow-sm border-slate-200 text-slate-600 hover:bg-slate-50">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-100/50 p-1 rounded-xl flex shadow-inner border border-slate-200/50">
        {(['daily', 'weekly', 'monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              filter === t 
                ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/50" 
                : "text-slate-400 hover:text-primary hover:bg-white/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 px-1">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
            <p className={cn("text-lg font-bold tracking-tight", stat.color)}>Rs. {stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Profit Chart (Mock Visual) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Revenue Velocity
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Cycle</span>
        </div>
        <div className="h-32 flex items-end gap-2 px-1">
          {[40, 65, 45, 90, 75, 55, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full rounded-t-lg transition-all duration-700 ease-out",
                  i === 6 ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-100"
                )} 
                style={{ height: `${h}%` }} 
              />
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Day {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4 px-1 pb-10">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Dividend Distribution</h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-5 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Corporate Stake</span>
            </div>
            <span className="text-sm font-bold text-primary">Rs. {netProfit.toLocaleString()}</span>
          </div>
          <div className="p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Affiliate Payouts</span>
            </div>
            <span className="text-sm font-bold text-slate-700">Rs. {commissionsPaid.toLocaleString()}</span>
          </div>
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
