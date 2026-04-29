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
    <div className="min-h-screen bg-[#EEF2FF] flex flex-col">
      <div className="w-full flex-1 flex flex-col relative max-w-7xl mx-auto md:px-6 lg:px-8">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 pt-4">
          <div className="bg-bg-gray md:rounded-[40px] min-h-full shadow-xl md:border-[8px] border-slate-900 overflow-hidden flex flex-col">
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile/Tablet */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#F1F5F9] px-1 py-2 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] pb-[calc(env(safe-area-inset-bottom)+8px)] md:relative md:bg-transparent md:border-none md:shadow-none md:pb-4 md:px-0">
          <div className="flex justify-around items-center max-w-md mx-auto md:max-w-none md:justify-center md:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 relative group",
                    isActive ? "text-primary" : "text-slate-400 hover:text-text-main"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "transition-all duration-500 rounded-xl",
                      isActive ? "scale-110" : "scale-100"
                    )}>
                      <item.icon className={cn("w-6 h-6 transition-all", isActive ? "stroke-[3px] drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]" : "stroke-[2px]")} />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.05em] transition-all",
                      isActive ? "opacity-100 scale-100" : "opacity-60 scale-95"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-dot"
                        className="absolute -top-1 w-1 h-1 bg-primary rounded-full" 
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
