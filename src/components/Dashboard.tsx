import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Wallet, 
  ShieldOff, 
  SlidersHorizontal, 
  LogOut, 
  RefreshCw,
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  UserCheck, 
  Package, 
  CreditCard, 
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Calendar,
  History,
  Activity,
  AlertCircle,
  ShieldCheck,
  LayoutDashboard,
  Search,
  X,
  FileText,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/services/firebase';
import { toast } from 'sonner';
import { signOut } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isAdmin, isCustomer } = useAuth();
  const { users, subdealers, packages, requests, payments, bills, tickets, treasury, loading, checkExpiries, generateMonthlyBills } = useSystem();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkExpiries();
    }
  }, [loading]);

  const handleSyncBills = async () => {
    setIsSyncing(true);
    try {
      await generateMonthlyBills();
      toast.success("Billing data synchronized");
    } catch (e) {
      toast.error("Billing sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended').length;
  const expiredUsersCount = users.filter(u => u.status === 'expired').length;
  const todayKey = new Date().toDateString();
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const todayApprovedPayments = payments.filter((p: any) => (
    p.status === 'approved' &&
    p.type === 'in' &&
    new Date(p.approvedAt || p.date || p.createdAt).toDateString() === todayKey
  ));
  const recentPayments = payments.slice(0, 5);
  const userPayments = isAdmin ? payments : payments.filter(p => p.userId === profile?.uid);
  const userRequests = isAdmin ? pendingRequests : pendingRequests.filter(r => r.userId === profile?.uid);

  const totalIncome = payments
    .filter(p => p.status === 'approved' && p.type === 'in')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const dedupeBills = (items: any[]) => Array.from(
    items.reduce((map: Map<string, any>, bill: any) => {
      const billUser = users.find((item: any) => item.id === bill.userId || item.uid === bill.userId);
      const ownerKey = (billUser?.email || billUser?.uid || bill.userId || bill.userName || '').toString().toLowerCase();
      const billKey = [
        ownerKey,
        String(bill.month || '').toLowerCase(),
        String(bill.packageName || '').toLowerCase(),
        Number(bill.amount || 0),
        bill.status === 'paid' ? 'paid' : 'open',
      ].join('|');
      const existing = map.get(billKey);
      if (!existing) {
        map.set(billKey, bill);
        return map;
      }
      const existingDate = new Date(existing.paidAt || existing.updatedAt || existing.createdAt || existing.dueDate || 0).getTime();
      const billDate = new Date(bill.paidAt || bill.updatedAt || bill.createdAt || bill.dueDate || 0).getTime();
      if (billDate > existingDate) map.set(billKey, bill);
      return map;
    }, new Map<string, any>()).values()
  );
  const cleanBills = dedupeBills(bills);
  
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const pendingUsersCount = users.filter(u => u.status === 'pending').length;
  const unpaidBillsCount = cleanBills.filter(b => b.status === 'unpaid').length;
  const paidBillsCount = cleanBills.filter(b => b.status === 'paid').length;
  const overdueBillsCount = cleanBills.filter(b => b.status === 'unpaid' && new Date(b.dueDate) < new Date()).length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const todayPaymentTotal = todayApprovedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const overdueAmount = cleanBills
    .filter(b => b.status === 'unpaid' && new Date(b.dueDate) < new Date())
    .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);

  const adminSummaryCards = [
    {
      label: 'Today Payments',
      value: `Rs. ${todayPaymentTotal.toLocaleString()}`,
      detail: `${todayApprovedPayments.length} approved today`,
      icon: Wallet,
      path: '/payments',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      accent: 'bg-emerald-500',
    },
    {
      label: 'Pending Approvals',
      value: pendingPaymentsCount.toString(),
      detail: 'payments waiting',
      icon: CreditCard,
      path: '/payments',
      style: pendingPaymentsCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100',
      accent: pendingPaymentsCount > 0 ? 'bg-amber-500' : 'bg-slate-300',
    },
    {
      label: 'Active Customers',
      value: activeUsersCount.toString(),
      detail: `${users.length} total accounts`,
      icon: UserCheck,
      path: '/users',
      style: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      accent: 'bg-indigo-500',
    },
    {
      label: 'Overdue Bills',
      value: overdueBillsCount.toString(),
      detail: `Rs. ${overdueAmount.toLocaleString()} due`,
      icon: AlertCircle,
      path: '/payments',
      style: overdueBillsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100',
      accent: overdueBillsCount > 0 ? 'bg-rose-500' : 'bg-slate-300',
    },
  ];

  const stats = isAdmin ? [
    { label: 'Suspended', value: suspendedUsersCount.toString(), icon: ShieldOff, color: 'bg-rose-100 text-rose-600' },
    { label: 'Expired', value: expiredUsersCount.toString(), icon: AlertCircle, color: 'bg-amber-100 text-amber-600' },
    { label: 'Unpaid Bills', value: unpaidBillsCount.toString(), icon: CreditCard, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Paid Bills', value: paidBillsCount.toString(), icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Tickets', value: openTicketsCount.toString(), icon: MessageSquare, color: openTicketsCount > 0 ? 'bg-indigo-600 text-white animate-bounce' : 'bg-slate-100 text-slate-600' },
    { label: 'Invoiced', value: `Rs. ${totalIncome.toLocaleString()}`, icon: Wallet, color: 'bg-indigo-100 text-indigo-600' },
  ] : [
    { label: 'Active', value: activeUsersCount.toString(), icon: UserCheck, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Pending', value: pendingRequests.length.toString(), icon: Activity, color: 'bg-amber-100 text-amber-600' },
    { label: 'Overdue Bills', value: overdueBillsCount.toString(), icon: AlertCircle, color: 'bg-rose-100 text-rose-600' },
    { label: 'Plans', value: packages.length.toString(), icon: Package, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      // signOut will trigger onAuthStateChanged in useAuth, which clears state
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Failed to sign out");
    }
  };

  const headerActions = [
    { icon: ShieldCheck, label: 'Health Status', path: '/system-check' },
    { icon: RefreshCw, label: isSyncing ? 'Generating...' : 'Generate Bills', action: handleSyncBills },
    { icon: TrendingUp, label: 'Reports', path: '/reports' },
    { icon: History, label: 'System Logs', path: '/audit-logs' },
    { icon: SlidersHorizontal, label: 'Billing Settings', path: '/billing-settings' },
    { icon: LogOut, label: 'Logout', action: () => setShowLogoutConfirm(true) },
  ];

  const globalSearchItems = [
    { title: 'Customers', subtitle: 'Subscriber list, status, packages', path: '/users', type: 'Function' },
    { title: 'Payments', subtitle: 'Payment approvals and receipts', path: '/payments', type: 'Function' },
    { title: 'Bills', subtitle: 'Invoices, unpaid and paid bills', path: '/bills', type: 'Function' },
    { title: 'Packages / Plans', subtitle: 'Internet plans and pricing', path: '/packages', type: 'Function' },
    { title: 'Support Tickets', subtitle: 'Customer complaints and issues', path: '/tickets', type: 'Function' },
    { title: 'Reports', subtitle: 'Analytics and summaries', path: '/reports', type: 'Function' },
    { title: 'Ledger / Treasury', subtitle: 'Cash in, cash out, balance', path: '/treasury', type: 'Function' },
    { title: 'Dealers', subtitle: 'Subdealer and partner management', path: '/subdealers', type: 'Function' },
    { title: 'Billing Settings', subtitle: 'Payment info and automation', path: '/billing-settings', type: 'Function' },
    { title: 'System Logs', subtitle: 'Audit history and activity', path: '/audit-logs', type: 'Function' },
    ...users.map((u) => ({
      title: u.name || 'Customer',
      subtitle: [u.phone, u.email, u.packageName, u.status].filter(Boolean).join(' • '),
      path: '/users',
      type: 'Customer',
    })),
    ...packages.map((p) => ({
      title: p.name || p.speed || 'Package',
      subtitle: [p.speed, p.code, `Rs. ${p.price || 0}`].filter(Boolean).join(' • '),
      path: '/packages',
      type: 'Plan',
    })),
    ...bills.map((b) => ({
      title: b.userName || 'Bill',
      subtitle: [b.month, b.status, `Rs. ${b.amount || 0}`].filter(Boolean).join(' • '),
      path: '/bills',
      type: 'Bill',
    })),
    ...payments.map((p) => ({
      title: p.userName || 'Payment',
      subtitle: [p.method, p.status, `Rs. ${p.amount || 0}`, p.reference].filter(Boolean).join(' • '),
      path: '/payments',
      type: 'Payment',
    })),
    ...tickets.map((t) => ({
      title: t.userName || 'Ticket',
      subtitle: [t.issueType, t.status, t.message].filter(Boolean).join(' • '),
      path: '/tickets',
      type: 'Ticket',
    })),
  ];

  const globalSearchLower = globalSearch.trim().toLowerCase();
  const globalSearchResults = globalSearchLower
    ? globalSearchItems
        .filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(globalSearchLower))
        .slice(0, 8)
    : globalSearchItems.slice(0, 6);

  const openSearchResult = (path: string) => {
    navigate(path);
    setGlobalSearch('');
    setIsSearchOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    const monthlyRevenue = payments
      .filter((p: any) => p.status === 'approved' && p.type === 'in')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const onlineDevices = Math.max(activeUsersCount - suspendedUsersCount, 0);
    const darkMetrics = [
      {
        label: 'Active Customers',
        value: activeUsersCount.toLocaleString(),
        trend: '+12.5%',
        icon: Users,
        color: 'from-blue-500 to-blue-700',
        path: '/users',
      },
      {
        label: 'Monthly Revenue',
        value: `Rs. ${monthlyRevenue.toLocaleString()}`,
        trend: '+18.7%',
        icon: Wallet,
        color: 'from-emerald-500 to-emerald-700',
        path: '/treasury',
      },
      {
        label: 'Unpaid Bills',
        value: unpaidBillsCount.toLocaleString(),
        trend: overdueBillsCount > 0 ? `${overdueBillsCount} overdue` : 'clear',
        icon: CreditCard,
        color: 'from-amber-500 to-orange-600',
        path: '/bills',
      },
      {
        label: 'Online Devices',
        value: onlineDevices.toLocaleString(),
        trend: '+6.1%',
        icon: Activity,
        color: 'from-violet-500 to-indigo-700',
        path: '/status',
      },
    ];

    const quickActions = [
      { title: 'Add Customer', desc: 'Create new customer and services', icon: Users, path: '/users', color: 'from-blue-500 to-blue-700' },
      { title: 'Generate Bills', desc: 'Create and send invoices to customers', icon: FileText, action: handleSyncBills, color: 'from-emerald-500 to-emerald-700' },
      { title: 'Payments', desc: 'View payments and transaction history', icon: CreditCard, path: '/payments', color: 'from-violet-500 to-purple-700' },
      { title: 'Reports', desc: 'Analytics and business insights', icon: TrendingUp, path: '/reports', color: 'from-sky-500 to-blue-700' },
      { title: 'Support Tickets', desc: 'View and manage support requests', icon: MessageSquare, path: '/tickets', color: 'from-amber-500 to-orange-600' },
      { title: 'Settings', desc: 'Configure system preferences', icon: SlidersHorizontal, path: '/billing-settings', color: 'from-slate-500 to-slate-700' },
    ];

    return (
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-700 via-blue-950 to-[#07111f] p-6 shadow-2xl shadow-blue-950/30 sm:p-10">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-blue-200">MR NETWORK ISP</p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Welcome Back, Admin</h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-blue-100">
              Manage customers, invoices, payments and network performance from your central dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                <Calendar className="h-4 w-4" /> {formatDate(new Date())}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                <Activity className="h-4 w-4" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-48 w-80 opacity-30">
            <div className="absolute bottom-0 right-8 h-36 w-20 border-x-2 border-t-2 border-blue-300/40" />
            <div className="absolute bottom-16 right-16 h-24 w-24 rounded-full border-2 border-blue-300/30" />
            <div className="absolute bottom-0 right-36 h-20 w-24 rounded-t-lg bg-blue-400/20" />
            <div className="absolute bottom-0 right-0 h-28 w-24 rounded-t-lg bg-blue-500/20" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.22),transparent_30%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.08)_100%)]" />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {darkMetrics.map((metric, index) => (
            <motion.button
              key={metric.label}
              type="button"
              onClick={() => navigate(metric.path)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.055] p-5 text-left shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-white/[0.075]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", metric.color)}>
                  <metric.icon className="h-7 w-7" />
                </span>
                <MoreVertical className="h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-300" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-300">{metric.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-white">{metric.value}</p>
                <p className="mt-3 text-xs font-bold text-emerald-400">{metric.trend} <span className="ml-1 font-medium text-slate-400">vs last month</span></p>
              </div>
            </motion.button>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-white">Quick Actions</h2>
            <button className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/7" onClick={() => navigate('/admin')}>
              View All Actions
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {quickActions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                className="group flex min-h-[170px] flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-white/[0.07]"
              >
                <span className={cn("mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", action.color)}>
                  <action.icon className="h-6 w-6" />
                </span>
                <span className="text-base font-black text-white">{action.title}</span>
                <span className="mt-2 text-sm font-medium leading-6 text-slate-400">{action.desc}</span>
                <ChevronRight className="mt-auto h-5 w-5 self-end text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/7 text-slate-200">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-black text-white">Network Health</h3>
                <p className="text-sm font-medium text-slate-400">All core systems are running smoothly.</p>
              </div>
              <span className="ml-auto rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-black text-emerald-400">Healthy</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-300">System Uptime</p>
                <p className="mt-1 text-3xl font-black text-emerald-400">99.9%</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400">Last 24 Hours</p>
                <p className="mt-2 text-sm font-bold text-emerald-400">No major issues</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      {/* Global Search & Actions Header */}
      <div className="bg-white border-b border-slate-200/60 pt-6 pb-6 shadow-sm transition-all duration-300">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Admin HQ</h2>
                <div className="flex items-center gap-2 mt-1.5 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none">System Terminal // Live</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80 lg:w-[480px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 group-focus-within:border-indigo-100 transition-all">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  placeholder="Search app, customers, bills, payments..."
                  className="input-modern pl-14 pr-20 h-14 text-sm font-bold border-slate-200 bg-white shadow-md focus:shadow-lg focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-2xl"
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && globalSearchResults[0]) {
                      openSearchResult(globalSearchResults[0].path);
                    }
                    if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                    }
                  }}
                />
                {globalSearch ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-400 rounded-md border border-slate-200 uppercase tracking-tighter">Enter</div>
                )}
                {isSearchOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[1000] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                      {globalSearchResults.length > 0 ? (
                        globalSearchResults.map((item, index) => (
                          <button
                            key={`${item.type}-${item.title}-${index}`}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => openSearchResult(item.path)}
                            className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-left hover:bg-indigo-50 transition-all group/item"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{item.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{item.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 group-hover/item:bg-indigo-100 group-hover/item:text-indigo-600">
                                {item.type}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-indigo-600" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No results found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Header with Modern Gradient */}
      <div className="header-gradient pt-8 pb-12 px-4 sm:px-8 text-white relative overflow-hidden md:rounded-b-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto relative z-10 gap-6">
          <div>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-1">MR NETWORK // Admin</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{isAdmin ? 'Overview Dashboard' : 'Customer Console'}</h1>
            <p className="text-white/80 text-sm mt-2 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              {formatDate(new Date())}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {headerActions.filter(a => isAdmin || a.label === 'Logout').map((action, i) => (
              <button 
                key={i} 
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                className="bg-white/10 hover:bg-white/20 transition-all px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs font-bold whitespace-nowrap"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 rounded-full -ml-10 -mb-10 blur-3xl opacity-50" />
      </div>

      <div className="px-4 sm:px-8 pt-6 max-w-7xl mx-auto w-full relative z-20 space-y-6">
        {/* Daily Operations Summary */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {adminSummaryCards.map((card, i) => (
              <motion.button
                key={card.label}
                type="button"
                onClick={() => navigate(card.path)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  card.style
                )}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1", card.accent)} />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">{card.label}</p>
                    <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{card.value}</p>
                    <p className="mt-1 text-xs font-bold opacity-70">{card.detail}</p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-105">
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-70">
                  Open
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all duration-300"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", 
                stat.color
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Treasury Card */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/treasury')}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md transition-all duration-300 overflow-hidden relative"
          >
            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Ledger Balance</h3>
                    <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">Rs. {treasury?.balance?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cash Inflow</p>
                      <p className="text-base font-bold text-emerald-600">Rs. {treasury?.todayIn?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin Payouts</p>
                      <p className="text-base font-bold text-rose-600">Rs. {treasury?.todayOut?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center h-full self-center">
                <div className="bg-slate-50 p-4 rounded-full group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          </motion.div>
        )}

        {!isAdmin && profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Network Operator</p>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">{profile.email}</p>
              </div>
            </div>
            <div className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 mt-2 sm:mt-0",
              profile.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
            )}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {profile.status}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Quick List - Payments */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Recent Payments
              </h3>
              <button 
                onClick={() => navigate('/payments')} 
                className="text-[11px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {userPayments.length > 0 ? (
                userPayments.slice(0, 5).map((payment, idx) => (
                  <div 
                    key={payment.id}
                    className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex items-center justify-between hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        payment.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{payment.userName}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formatDate(payment.date)} • {payment.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 leading-none">Rs. {payment.amount?.toLocaleString()}</p>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-wider mt-1",
                        payment.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                      )}>{payment.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-medium italic">No recent transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick List - Requests */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Active Requests
              </h3>
              <button 
                onClick={() => navigate('/requests')} 
                className="text-[11px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
              >
                 {isAdmin ? 'Manage' : 'Request'}
              </button>
            </div>
            <div className="space-y-4">
              {userRequests.length > 0 ? (
                userRequests.slice(0, 5).map((req) => (
                  <div 
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex items-center justify-between hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight capitalize">{req.type}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>{req.status}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-medium italic">{isAdmin ? 'No pending requests' : 'All clear'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Sign Out</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
              Are you sure you want to log out? Your active session will be terminated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 mt-8">
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 rounded-xl h-12 font-bold text-slate-600 border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              className="flex-1 bg-rose-600 hover:bg-rose-700 rounded-xl h-12 text-white font-bold border-none shadow-sm transition-all active:scale-[0.98]"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
