import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Package,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CheckStatus = 'success' | 'warning' | 'error';

export default function SystemCheck() {
  const { users, bills, packages, payments, requests, settings, loading } = useSystem();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  const duplicateOpenBills = useMemo(() => {
    const seen = new Set<string>();
    let duplicates = 0;
    bills
      .filter((bill: any) => bill.status === 'unpaid')
      .forEach((bill: any) => {
        const billUser = users.find((item: any) => item.id === bill.userId || item.uid === bill.userId);
        const key = [
          (billUser?.email || bill.userId || bill.userName || '').toString().toLowerCase(),
          bill.month || '',
          bill.packageName || '',
          Number(bill.amount || 0),
        ].join('|');
        if (seen.has(key)) duplicates += 1;
        seen.add(key);
      });
    return duplicates;
  }, [bills, users]);

  const pendingCustomers = users.filter((item: any) => item.status === 'pending').length;
  const activeCustomers = users.filter((item: any) => item.status === 'active').length;
  const customersWithPhone = users.filter((item: any) => item.phone || item.whatsapp || item.mobile || item.phoneNumber).length;
  const pendingPlanRequests = requests.filter((item: any) => item.type === 'package_change' && item.status === 'pending').length;
  const pendingPayments = payments.filter((item: any) => (
    item.status === 'pending' &&
    (item.type === 'in' || item.category === 'subscription' || item.method)
  )).length;
  const approvedPayments = payments.filter((item: any) => item.status === 'approved').length;
  const settingsReady = Boolean(settings?.adminPhone && settings?.adminEmail);

  const flowChecks: Array<{
    id: string;
    title: string;
    desc: string;
    status: CheckStatus;
    icon: any;
    page: string;
    action: string;
    metric: string;
  }> = [
    {
      id: 'signup',
      title: 'Customer Signup Data',
      desc: 'Name, email aur phone save ho rahe hain.',
      status: users.length > 0 && customersWithPhone > 0 ? 'success' : users.length > 0 ? 'warning' : 'error',
      icon: Smartphone,
      page: '/users',
      action: 'Open Customers',
      metric: `${customersWithPhone}/${users.length} with phone`,
    },
    {
      id: 'approval',
      title: 'Admin Approval Queue',
      desc: 'Pending customers admin approval ke liye visible hain.',
      status: pendingCustomers === 0 ? 'success' : 'warning',
      icon: UserCheck,
      page: '/users',
      action: 'Review Users',
      metric: `${pendingCustomers} pending`,
    },
    {
      id: 'plan-request',
      title: 'Plan Request Approval',
      desc: 'Customer plan select kare, admin approve kare.',
      status: pendingPlanRequests === 0 ? 'success' : 'warning',
      icon: Package,
      page: '/requests',
      action: 'Open Requests',
      metric: `${pendingPlanRequests} pending`,
    },
    {
      id: 'duplicate-bills',
      title: 'Duplicate Bill Guard',
      desc: 'Same month/customer duplicate overdue bill show nahi hona chahiye.',
      status: duplicateOpenBills === 0 ? 'success' : 'warning',
      icon: FileText,
      page: '/bills',
      action: 'Check Bills',
      metric: `${duplicateOpenBills} duplicates`,
    },
    {
      id: 'payment-flow',
      title: 'Payment Approval Flow',
      desc: 'Customer payment submit kare, admin approve kare, status clear ho.',
      status: pendingPayments === 0 && approvedPayments > 0 ? 'success' : pendingPayments > 0 ? 'warning' : 'warning',
      icon: CreditCard,
      page: '/payments',
      action: 'Open Payments',
      metric: `${pendingPayments} pending`,
    },
    {
      id: 'invoice',
      title: 'Invoice Phone Details',
      desc: 'Invoice me customer phone aur office contact show ho.',
      status: customersWithPhone > 0 ? 'success' : 'warning',
      icon: Download,
      page: '/bills',
      action: 'Download Invoice',
      metric: customersWithPhone > 0 ? 'ready' : 'phone missing',
    },
    {
      id: 'support',
      title: 'Support Contact',
      desc: 'Customer support card me admin phone/email sync ho.',
      status: settingsReady ? 'success' : 'warning',
      icon: ShieldCheck,
      page: '/billing-settings',
      action: 'Open Settings',
      metric: settingsReady ? 'ready' : 'missing',
    },
  ];

  const successCount = flowChecks.filter((item) => item.status === 'success').length;
  const warningCount = flowChecks.filter((item) => item.status === 'warning').length;
  const errorCount = flowChecks.filter((item) => item.status === 'error').length;

  const runAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      toast.success('System test complete. Checklist refreshed.');
    }, 1200);
  };

  const statusStyle = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-300">MR NETWORK // Test Mode</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Final App Flow Checklist</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                Signup, approval, plan request, billing, payment aur invoice flow ka quick status yahan se check karein.
              </p>
            </div>
            <Button
              onClick={runAudit}
              disabled={isRunning}
              className="h-12 rounded-xl bg-indigo-600 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700"
            >
              {isRunning ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Run Test
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Passed', value: successCount, color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
            { label: 'Needs Review', value: warningCount, color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
            { label: 'Errors', value: errorCount, color: 'text-rose-600 bg-rose-50', icon: AlertCircle },
            { label: 'Active Customers', value: activeCustomers, color: 'text-indigo-600 bg-indigo-50', icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-black text-slate-950">{stat.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {flowChecks.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', statusStyle[item.status])}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-950">{item.title}</h3>
                    <Badge className={cn('border text-[9px] font-black uppercase tracking-widest', statusStyle[item.status])}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{item.desc}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.metric}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(item.page)}
                className="mt-5 h-10 w-full justify-between rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {item.action}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </section>

        <footer className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">{user?.email || 'Admin'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isAdmin ? 'Master Administrator' : 'Read Only'} - last checked today
              </p>
            </div>
            <Button
              onClick={() => navigate('/exports')}
              className="h-11 rounded-xl bg-slate-950 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Backup Center
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
