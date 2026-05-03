import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, MessageSquare, Users, Package, Store, Castle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }: LayoutProps) {
  const { isAdmin } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dash', to: '/', show: true },
    { icon: CreditCard, label: 'Bills', to: '/payments', show: isAdmin },
    { icon: Users, label: 'Users', to: '/users', show: isAdmin },
    { icon: Store, label: 'Dealers', to: '/subdealers', show: isAdmin },
    { icon: Castle, label: 'Treasury', to: '/treasury', show: isAdmin },
    { icon: Package, label: 'Plans', to: '/packages', show: isAdmin },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <div className="w-full flex-1 flex flex-col relative max-w-7xl mx-auto md:px-4">
        <main className="flex-1 pb-24 md:pb-12 pt-0 md:pt-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white md:rounded-3xl min-h-[calc(100vh-140px)] shadow-sm md:border border-slate-200 overflow-hidden flex flex-col relative"
          >
            {children}
          </motion.div>
        </main>

        {/* Modern Clean Floating Navigation */}
        <nav className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 p-2 z-[100] shadow-lg rounded-2xl md:static md:bg-white md:border md:shadow-sm md:p-3 md:mb-6 md:rounded-2xl">
          <div className="flex justify-around items-center max-w-md mx-auto md:max-w-none md:justify-center md:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 transition-all duration-300 py-2 rounded-xl flex-1 md:flex-initial md:px-6 md:py-2 md:flex-row md:gap-3",
                    isActive 
                      ? "text-primary bg-primary/5 shadow-sm" 
                      : "text-slate-500 hover:text-primary hover:bg-slate-50"
                  )
                }
              >
                <item.icon className={cn("w-5 h-5 transition-all")} />
                <span className="text-[10px] font-bold tracking-tight uppercase md:text-xs">
                  {item.label}
                </span>
                <div className={cn(
                  "h-1 w-1 rounded-full bg-primary mt-1 md:hidden transition-all duration-300",
                  "active" // Using template literal to handle the NavLink's isActive context would be complex here, so we rely on the parent className
                )} style={{ opacity: 0 }} />
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
