import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, MessageSquare, Users, Package, Store, Castle, Menu, X, TrendingUp, Activity, FileText, Download, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuth } from '../hooks/useAuth';
import { useSystem } from '../contexts/SystemContext';

export default function Layout({ children }: LayoutProps) {
  const { isAdmin } = useAuth();
  const { tickets } = useSystem();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', to: isAdmin ? '/admin' : '/dashboard', show: true },
    { icon: CreditCard, label: 'Payments', to: '/payments', show: true },
    { icon: MessageSquare, label: 'Tickets', to: '/tickets', show: isAdmin, badge: openTicketsCount > 0 ? openTicketsCount : null },
    { icon: FileText, label: 'Invoices', to: '/bills', show: isAdmin },
    { icon: ShieldCheck, label: 'System', to: '/system-check', show: isAdmin },
    { icon: Download, label: 'Exports', to: '/exports', show: isAdmin },
    { icon: Store, label: 'Dealers', to: '/subdealers', show: isAdmin },
    { icon: TrendingUp, label: 'Reports', to: '/reports', show: isAdmin },
    { icon: Castle, label: 'Ledger', to: '/treasury', show: isAdmin },
    { icon: Users, label: 'Subscribers', to: '/users', show: isAdmin },
    { icon: Package, label: 'Plans', to: '/packages', show: true },
    { icon: Activity, label: 'Troubleshoot', to: '/status', show: isAdmin },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-600 overflow-x-hidden">
      {/* Universal Top Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-[110] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">M & NETWORK</span>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-95 text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Side Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
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
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
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
              </nav>
              <div className="p-6 bg-slate-50 border-t border-slate-100 italic text-[10px] font-bold text-slate-400 text-center tracking-widest uppercase">
                v2.1.0 // ISP MANAGEMENT
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="w-full flex-1 flex flex-col relative max-w-7xl mx-auto px-0 md:px-4">
        <main className="flex-1 pb-12 pt-0 md:pt-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white md:rounded-3xl min-h-[calc(100vh-120px)] shadow-sm md:border border-slate-200 overflow-hidden flex flex-col relative"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
