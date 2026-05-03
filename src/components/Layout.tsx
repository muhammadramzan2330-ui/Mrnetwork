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
    { icon: Store, label: 'Dealer', to: '/subdealers', show: isAdmin },
    { icon: Castle, label: 'Vault', to: '/treasury', show: isAdmin },
    { icon: Package, label: 'Plans', to: '/packages', show: isAdmin },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="w-full flex-1 flex flex-col relative max-w-7xl mx-auto md:px-4 lg:px-6">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 pt-2 md:pt-6">
          <div className="bg-white md:rounded-3xl min-h-[calc(100vh-140px)] shadow-sm md:shadow-md border-slate-100 overflow-hidden flex flex-col">
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile/Tablet */}
        <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-slate-200/50 p-2 z-[100] shadow-lg rounded-2xl md:static md:bg-transparent md:border-none md:shadow-none md:p-0 md:mt-auto md:mb-6">
          <div className="flex justify-around items-center max-w-md mx-auto md:max-w-none md:justify-center md:gap-4 lg:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 transition-all duration-300 flex-1 md:flex-initial md:px-4 md:py-2 md:rounded-xl relative group",
                    isActive ? "text-primary md:bg-primary/5" : "text-slate-400 hover:text-primary hover:bg-slate-50"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "transition-all duration-300",
                      isActive ? "scale-110" : "scale-100"
                    )}>
                      <item.icon className={cn("w-5 h-5 transition-all text-inherit", isActive ? "stroke-[2.5px] drop-shadow-sm" : "stroke-[2px]")} />
                    </div>
                    <span className={cn(
                      "text-[10px] md:text-xs font-semibold tracking-wide transition-all",
                      isActive ? "opacity-100" : "opacity-70"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-dot"
                        className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" 
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
