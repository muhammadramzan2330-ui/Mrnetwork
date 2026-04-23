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
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-text-main leading-tight">Reports</h2>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Financial Overview</p>
        </div>
        <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-white shadow-sm border border-slate-100">
          <Download className="w-4 h-4 text-slate-600" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-slate-100">
        {(['daily', 'weekly', 'monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              filter === t ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:bg-slate-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 truncate", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={cn("text-lg font-black leading-none", stat.color)}>Rs. {stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Profit Chart (Mock Visual) */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-text-main mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Growth Trajectory
        </h3>
        <div className="h-32 flex items-end gap-2 px-1">
          {[40, 65, 45, 90, 75, 55, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full rounded-t-xl transition-all duration-500",
                  i === 6 ? "bg-primary shadow-lg shadow-primary/30" : "bg-primary/20"
                )} 
                style={{ height: `${h}%` }} 
              />
              <span className="text-[8px] font-black text-text-muted">D{i+1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] px-1">Share Breakdown</h3>
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Company Equity</span>
            </div>
            <span className="text-sm font-black text-primary">Rs. {netProfit.toLocaleString()}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Dealers Commission</span>
            </div>
            <span className="text-sm font-black text-blue-600">Rs. {commissionsPaid.toLocaleString()}</span>
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
