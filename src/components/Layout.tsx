import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, MessageSquare, Users, Package, Store, Castle, Menu, X, TrendingUp, Activity, FileText, Download, User, History, ShieldCheck as ShieldCheckIcon, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuth } from '../hooks/useAuth';
import { useSystem } from '../contexts/SystemContext';

export default function Layout({ children }: LayoutProps) {
  const { isAdmin, user } = useAuth();
  const { tickets } = useSystem();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      console.log('NEW_ADMIN_LAYOUT_ACTIVE');
    }
  }, [isAdmin]);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-600 overflow-x-hidden">
      {/* Universal Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-[9999] px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 ml-1 sm:ml-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-200">M</div>
            <span className="font-black text-[13px] sm:text-sm tracking-tighter text-slate-900 uppercase truncate max-w-[100px] sm:max-w-none hover:text-indigo-600 transition-colors cursor-default">MR NETWORK</span>
          </div>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-indigo-200">M</div>
                  <div className="flex flex-col">
                    <span className="font-black text-xs tracking-tighter text-slate-900 uppercase leading-none">Navigation</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ISP Management</span>
                  </div>
                </div>
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
