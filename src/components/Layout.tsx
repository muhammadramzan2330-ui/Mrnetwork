import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, MessageSquare, Users, Package, Store, Castle, Menu, X, TrendingUp, Activity, FileText, Download, User, History, ShieldCheck as ShieldCheckIcon, LogOut, Settings, Bell, Radio, Search, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuth } from '../hooks/useAuth';
import { useSystem } from '../contexts/SystemContext';

export default function Layout({ children }: LayoutProps) {
  const { isAdmin, user, profile } = useAuth();
  const { tickets } = useSystem();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [panelTheme, setPanelTheme] = useState<'dark' | 'light'>(() => (
    localStorage.getItem('mrnetwork-panel-theme') === 'light' ? 'light' : 'dark'
  ));

  useEffect(() => {
    if (isAdmin) {
      console.log('NEW_ADMIN_LAYOUT_ACTIVE');
    }
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('mrnetwork-panel-theme', panelTheme);
  }, [panelTheme]);

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', to: isAdmin ? '/admin' : '/dashboard', show: !!user },
    { icon: CreditCard, label: 'Payments', to: '/payments', show: !!user },
    { icon: Package, label: 'Plans', to: '/packages', show: !!user },
    { icon: History, label: 'Billing', to: '/payments', show: !!user && !isAdmin }, 
    { icon: MessageSquare, label: 'Support', to: '/tickets', show: !!user, badge: openTicketsCount > 0 ? openTicketsCount : null },
    { icon: User, label: 'Profile', to: '/profile', show: !!user },
    { icon: FileText, label: 'Invoices', to: '/bills', show: !!user && isAdmin },
    { icon: ShieldCheckIcon, label: 'System', to: '/system-check', show: !!user && isAdmin },
    { icon: Download, label: 'Exports', to: '/exports', show: !!user && isAdmin },
    { icon: Store, label: 'Dealers', to: '/subdealers', show: !!user && isAdmin },
    { icon: TrendingUp, label: 'Reports', to: '/reports', show: !!user && isAdmin },
    { icon: Castle, label: 'Ledger', to: '/treasury', show: !!user && isAdmin },
    { icon: Users, label: 'Subscribers', to: '/users', show: !!user && isAdmin },
    { icon: Activity, label: 'Troubleshoot', to: '/status', show: !!user && isAdmin },
  ].filter(item => item.show);

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: Users, label: 'Customers', to: '/users' },
    { icon: Package, label: 'Packages/Plans', to: '/packages' },
    { icon: FileText, label: 'Bills', to: '/bills' },
    { icon: CreditCard, label: 'Payments', to: '/payments' },
    { icon: TrendingUp, label: 'Reports', to: '/reports' },
    { icon: MessageSquare, label: 'Complaints/Tickets', to: '/tickets', badge: openTicketsCount > 0 ? openTicketsCount : null },
    { icon: Settings, label: 'Settings', to: '/billing-settings' },
  ];

  const handleLogout = async () => {
    const { auth } = await import('../services/firebase');
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    setIsDrawerOpen(false);
  };

  if (user) {
    const shellNav = isAdmin ? [
      { icon: LayoutDashboard, label: 'Overview', to: '/admin' },
      { icon: Users, label: 'Customers', to: '/users' },
      { icon: FileText, label: 'Billing', to: '/bills' },
      { icon: CreditCard, label: 'Payments', to: '/payments' },
      { icon: Radio, label: 'Network', to: '/status' },
      { icon: TrendingUp, label: 'Reports', to: '/reports' },
      { icon: MessageSquare, label: 'Support Tickets', to: '/tickets', badge: openTicketsCount > 0 ? openTicketsCount : null },
      { icon: History, label: 'System Logs', to: '/audit-logs' },
      { icon: Settings, label: 'Settings', to: '/billing-settings' },
    ] : [
      { icon: LayoutDashboard, label: 'Overview', to: '/dashboard' },
      { icon: CreditCard, label: 'Payments', to: '/payments' },
      { icon: Package, label: 'Service Plans', to: '/packages' },
      { icon: FileText, label: 'Billing', to: '/payments' },
      { icon: MessageSquare, label: 'Support Tickets', to: '/tickets', badge: openTicketsCount > 0 ? openTicketsCount : null },
      { icon: User, label: 'Profile', to: '/profile' },
    ];
    const accountName = profile?.name || user.displayName || user.email?.split('@')[0] || (isAdmin ? 'Admin' : 'Customer');
    const nameParts = accountName.trim().split(/\s+/).filter(Boolean);
    const accountInitials = (
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : accountName.slice(0, 2)
    ).toUpperCase();
    const isLight = panelTheme === 'light';
    const shellBg = isLight ? 'bg-[#F4F7FB] text-slate-950' : 'bg-[#07111f] text-slate-100';
    const sideBg = isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#07101d] border-white/10';
    const headerBg = isLight ? 'bg-white/95 border-slate-200 shadow-sm' : 'bg-[#07111f]/95 border-white/10';
    const navIdle = isLight ? 'text-slate-600 hover:bg-blue-50 hover:text-blue-700' : 'text-slate-300 hover:bg-white/7 hover:text-white';
    const softPanel = isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/[0.04] text-slate-300';
    const titleText = isLight ? 'text-slate-950' : 'text-white';
    const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

    const renderShellNav = (onNavigate?: () => void) => (
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {shellNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "group flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all",
              isActive
                ? "bg-blue-600/90 text-white shadow-lg shadow-blue-950/30 ring-1 ring-blue-300/20"
                : navIdle
            )}
          >
            <item.icon className="h-5 w-5 text-current opacity-90 transition-transform group-hover:scale-110" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>
    );

    return (
      <div className={cn("mr-panel-shell min-h-screen font-sans selection:bg-blue-500/30 selection:text-white", shellBg, isLight ? "mr-panel-light" : "mr-panel-dark")}>
        <div className="flex min-h-screen">
          <aside className={cn("hidden w-[290px] shrink-0 flex-col border-r px-4 py-6", sideBg)}>
            <div className="mb-8 flex items-center gap-4 px-2">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 shadow-lg shadow-blue-700/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_28%)]" />
                <span className="relative text-3xl font-black italic tracking-[-0.18em] text-white">M</span>
              </div>
              <div>
                <p className={cn("text-lg font-black tracking-tight", titleText)}>MR NETWORK</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", mutedText)}>ISP Management System</p>
              </div>
            </div>

            {renderShellNav()}

            <div className={cn("mt-6 rounded-2xl border p-5", softPanel)}>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
                <p className="text-xs font-bold">System Status</p>
              </div>
              <p className="text-base font-black text-emerald-400">All Systems Operational</p>
              <p className={cn("mt-3 text-xs font-medium", mutedText)}>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className={cn("sticky top-0 z-50 flex min-h-16 items-center justify-between gap-2 border-b px-3 py-3 backdrop-blur-xl sm:min-h-20 sm:gap-4 sm:px-7 sm:py-4", headerBg)}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className={cn("rounded-xl p-2 transition-all", isLight ? "text-slate-600 hover:bg-slate-100" : "text-slate-300 hover:bg-white/7")}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="hidden items-center gap-3 text-emerald-400 md:flex">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
                <span className="text-sm font-bold">System Online</span>
                </div>
              </div>
              <div className={cn("hidden min-w-0 max-w-xl flex-1 items-center rounded-xl border px-4 py-3 md:flex", isLight ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/10 bg-white/[0.04] text-slate-400")}>
                <Search className="mr-3 h-5 w-5" />
                <span className="truncate text-sm">Search customers, invoices, payments...</span>
                <span className={cn("ml-auto rounded-lg px-2 py-1 text-[10px] font-black", isLight ? "bg-white text-slate-500 border border-slate-200" : "bg-white/7 text-slate-300")}>Ctrl + K</span>
              </div>
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-3 lg:gap-4">
                <button
                  onClick={() => setPanelTheme(isLight ? 'dark' : 'light')}
                  className={cn("rounded-xl p-2 transition-all", isLight ? "text-slate-600 hover:bg-slate-100" : "text-slate-300 hover:bg-white/7 hover:text-white")}
                  aria-label="Toggle light dark mode"
                  title={isLight ? 'Dark mode' : 'Light mode'}
                >
                  {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
                <button className={cn("relative rounded-xl p-2 transition-all", isLight ? "text-slate-600 hover:bg-slate-100" : "text-slate-300 hover:bg-white/7 hover:text-white")} aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {openTicketsCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">{openTicketsCount}</span>
                  )}
                </button>
                <NavLink to="/profile" className={cn("flex min-w-0 items-center gap-2 rounded-2xl px-1.5 py-1.5 transition-all sm:gap-3 sm:px-2", isLight ? "hover:bg-slate-100" : "hover:bg-white/7")}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white sm:h-11 sm:w-11 sm:text-sm">{accountInitials}</span>
                  <span className="hidden sm:block">
                    <span className={cn("block text-sm font-black", titleText)}>{accountName}</span>
                    <span className={cn("block text-xs font-medium", mutedText)}>{isAdmin ? 'Super Administrator' : 'Customer Portal'}</span>
                  </span>
                </NavLink>
                <button onClick={handleLogout} className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Sign out">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </header>

            <AnimatePresence>
              {isDrawerOpen && (
                <div className="fixed inset-0 z-[10000]">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsDrawerOpen(false)}
                    className={cn("absolute inset-0 backdrop-blur-[4px]", isLight ? "bg-slate-900/30" : "bg-black/60")}
                  />
                  <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn("absolute inset-y-0 left-0 flex w-[300px] flex-col border-r px-4 py-6 shadow-2xl", sideBg)}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 shadow-lg shadow-blue-700/30">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_28%)]" />
                          <span className="relative text-2xl font-black italic tracking-[-0.18em] text-white">M</span>
                        </div>
                        <div>
                          <p className={cn("text-base font-black", titleText)}>MR NETWORK</p>
                          <p className={cn("text-[9px] font-bold uppercase tracking-widest", mutedText)}>{isAdmin ? 'Admin Panel' : 'Customer Portal'}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsDrawerOpen(false)} className="rounded-xl p-2 text-rose-400 hover:bg-rose-500/10" aria-label="Close menu">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {renderShellNav(() => setIsDrawerOpen(false))}
                  </motion.aside>
                </div>
              )}
            </AnimatePresence>

            <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-7">
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-600 overflow-x-hidden">
      {/* Universal Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-[9999] px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <BrandLogo variant="compact" showPhone className="ml-1 sm:ml-2" />
        </div>

        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 mr-2">
              <ShieldCheckIcon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Access</span>
            </div>
          )}
          {user && !isAdmin && (
            <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 mr-2">
              <ShieldCheckIcon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Customer Access</span>
            </div>
          )}
          
          {user ? (
            <NavLink 
              to="/profile"
              aria-label="Profile"
              className={({ isActive }) => cn(
                "p-2 rounded-xl transition-all active:scale-90 border border-transparent flex items-center justify-center",
                isActive 
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                  : "text-slate-600 hover:bg-slate-100 hover:border-slate-200"
              )}
            >
              <User className="w-5 h-5" />
            </NavLink>
          ) : (
             <NavLink 
              to="/"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
            >
              <ShieldCheckIcon className="w-3 h-3" />
              Registry Login
            </NavLink>
          )}

          {user && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90 text-slate-600 border border-transparent hover:border-slate-200 flex items-center justify-center ml-1"
              aria-label="Open Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 w-full shrink-0" />

      {/* Side Drawer Component */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[10000]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-[300px] bg-white shadow-2xl flex flex-col border-r border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <BrandLogo variant="drawer" showPhone />
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close Navigation"
                  className="p-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {isAdmin ? (
                  adminNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-transparent hover:border-slate-100"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                      <span className="font-bold text-[13px] uppercase tracking-wider flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))
                ) : navItems.length > 0 ? (
                  navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-transparent hover:border-slate-100"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                      <span className="font-bold text-[13px] uppercase tracking-wider flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
                      <ShieldCheckIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Access Restricted</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed uppercase tracking-wider">Please authenticate to view the navigation.</p>
                    </div>
                    <Button 
                      className="w-full bg-slate-900 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      onClick={() => {
                        window.location.href = '/';
                        setIsDrawerOpen(false);
                      }}
                    >
                      Go to Login
                    </Button>
                  </div>
                )}
                
                {/* Logout Button in Drawer */}
                {user && (
                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <button
                      onClick={async () => {
                        const { auth } = await import('../services/firebase');
                        const { signOut } = await import('firebase/auth');
                        await signOut(auth);
                        setIsDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-rose-500 hover:bg-rose-50 group font-bold text-[13px] uppercase tracking-wider"
                    >
                      <LogOut className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </nav>
              <div className="p-6 bg-slate-50 border-t border-slate-100 font-mono text-[9px] font-bold text-slate-400 flex flex-col items-center gap-2">
                <span className="tracking-[0.3em]">CORE ENGINE v2.2.0</span>
                <span className="opacity-50">ISP BILLING ECOSYSTEM</span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full flex-1 flex flex-col relative max-w-7xl mx-auto px-0 md:px-4">
        <main className="flex-1 pb-8 md:pb-12 pt-4 md:pt-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white md:rounded-3xl min-h-[calc(100vh-120px)] shadow-sm md:border border-slate-200 overflow-hidden flex flex-col relative w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
