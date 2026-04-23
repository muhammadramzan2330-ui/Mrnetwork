import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, MessageSquare, Users, Package, Store, Castle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dash', to: '/' },
    { icon: CreditCard, label: 'Bills', to: '/payments' },
    { icon: Users, label: 'Users', to: '/users' },
    { icon: Store, label: 'Dealer', to: '/subdealers' },
    { icon: Castle, label: 'Vault', to: '/treasury' },
    { icon: Package, label: 'Plans', to: '/packages' },
  ];

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex justify-center items-start sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[720px] sm:h-[720px] bg-bg-gray sm:rounded-[40px] relative overflow-hidden shadow-2xl sm:border-[8px] sm:border-slate-900 flex flex-col">
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#F1F5F9] px-1 py-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="flex justify-around items-center max-w-md mx-auto">
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
