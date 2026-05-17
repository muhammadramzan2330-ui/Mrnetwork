import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, MessageSquare, Users, Package, Store, Castle, Menu, X, TrendingUp, Activity, FileText, Download, ShieldCheck, User, ShieldCheck as ShieldCheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuth } from '../hooks/useAuth';
import { useSystem } from '../contexts/SystemContext';

export default function Layout({ children }: LayoutProps) {
  const { isAdmin, user } = useAuth();
  const { tickets } = useSystem();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', to: isAdmin ? '/admin' : '/dashboard', show: !!user },
    { icon: User, label: 'My Profile', to: '/profile', show: !!user },
    { icon: CreditCard, label: 'Payments', to: '/payments', show: !!user },
    { icon: MessageSquare, label: 'Tickets', to: '/tickets', show: !!user && isAdmin, badge: openTicketsCount > 0 ? openTicketsCount : null },
    { icon: FileText, label: 'Invoices', to: '/bills', show: !!user && isAdmin },
    { icon: ShieldCheckIcon, label: 'System', to: '/system-check', show: !!user && isAdmin },
    { icon: Download, label: 'Exports', to: '/exports', show: !!user && isAdmin },
    { icon: Store, label: 'Dealers', to: '/subdealers', show: !!user && isAdmin },
    { icon: TrendingUp, label: 'Reports', to: '/reports', show: !!user && isAdmin },
    { icon: Castle, label: 'Ledger', to: '/treasury', show: !!user && isAdmin },
    { icon: Users, label: 'Subscribers', to: '/users', show: !!user && isAdmin },
    { icon: Package, label: 'Plans', to: '/packages', show: !!user },
    { icon: Activity, label: 'Troubleshoot', to: '/status', show: !!user && isAdmin },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-600 overflow-x-hidden">
      {/* Universal Top Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-[110] px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-200">M</div>
          <span className="font-black text-[13px] sm:text-sm tracking-tighter text-slate-900 uppercase truncate max-w-[120px] sm:max-w-none">M & NETWORK</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {user && isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 mr-2">
              <ShieldCheckIcon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
            </div>
          )}
          
          {user ? (
            <>
              <NavLink 
                to="/profile"
                className={({ isActive }) => cn(
                  "p-2 rounded-xl transition-all active:scale-90 border border-transparent flex items-center justify-center",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                    : "text-slate-600 hover:bg-slate-100 hover:border-slate-200"
                )}
              >
                <User className="w-5 h-5" />
              </NavLink>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90 text-slate-600 border border-transparent hover:border-slate-200 flex items-center justify-center"
              >
                <Menu className="w-6 h-6" />
              </button>
            </>
          ) : (
             <div className="flex items-center gap-2">
                <p className="hidden sm:block text-[9px] font-black text-slate-400 uppercase tracking-widest">Billing Registry Access</p>
                <ShieldCheckIcon className="w-4 h-4 text-slate-300" />
             </div>
          )}
        </div>
      </header>

      {/* Side Drawer Overlay */}
      <AnimatePresence>
        {user && isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[120]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[130] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-200">M</div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">NAVIGATION</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group",
                      isActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
                    <span className="font-bold text-[13px] uppercase tracking-wider flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
                
                {/* Logout Button in Drawer */}
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
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
              <div className="p-6 bg-slate-50 border-t border-slate-100 italic text-[10px] font-bold text-slate-400 text-center tracking-widest uppercase">
                v2.1.0 // ISP MANAGEMENT
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="w-full flex-1 flex flex-col relative max-w-7xl mx-auto px-0 md:px-4">
        <main className="flex-1 pb-6 md:pb-12 pt-0 md:pt-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white md:rounded-3xl min-h-[calc(100vh-80px)] shadow-sm md:border border-slate-200 overflow-hidden flex flex-col relative"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
