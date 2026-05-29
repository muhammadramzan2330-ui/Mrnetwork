import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'nav' | 'hero' | 'drawer' | 'compact';
  showPhone?: boolean;
  className?: string;
}

const phoneNumber = '03040232330';

export default function BrandLogo({ variant = 'nav', showPhone = false, className }: BrandLogoProps) {
  if (variant === 'hero') {
    return (
      <div className={cn('relative z-10 flex flex-col items-center text-center text-white', className)}>
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white text-indigo-700 shadow-2xl shadow-indigo-950/20 ring-1 ring-white/50">
          <span className="text-2xl font-black tracking-tighter">MR</span>
        </div>
        <p className="text-xl font-black uppercase tracking-[0.12em] leading-none">MRNETWORK</p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.28em] text-white/70">Internet Services</p>
        {showPhone && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-[10px] font-black tracking-widest text-white backdrop-blur-md">
            <Phone className="h-3.5 w-3.5" />
            {phoneNumber}
          </div>
        )}
      </div>
    );
  }

  const isDrawer = variant === 'drawer';
  const markSize = isDrawer ? 'h-11 w-11 rounded-2xl text-base' : variant === 'compact' ? 'h-9 w-9 rounded-xl text-sm' : 'h-9 w-9 rounded-xl text-sm';

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div className={cn('flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-600 to-cyan-500 font-black tracking-tighter text-white shadow-lg shadow-indigo-200', markSize)}>
        MR
      </div>
      <div className="min-w-0">
        <p className={cn('truncate font-black uppercase leading-none tracking-tight text-slate-950', isDrawer ? 'text-sm' : 'text-[13px] sm:text-sm')}>
          MRNETWORK
        </p>
        {showPhone ? (
          <p className="mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600">
            <Phone className="h-3 w-3" />
            {phoneNumber}
          </p>
        ) : (
          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">ISP Services</p>
        )}
      </div>
    </div>
  );
}
