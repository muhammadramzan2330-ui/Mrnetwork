import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'nav' | 'hero' | 'drawer' | 'compact';
  showPhone?: boolean;
  className?: string;
}

const phoneNumber = '03040232330';

export default function BrandLogo({ variant = 'nav', showPhone = false, className }: BrandLogoProps) {
  const LogoMark = ({ large = false }: { large?: boolean }) => (
    <div className={cn(
      'relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 text-white shadow-lg shadow-blue-700/25',
      large ? 'h-16 w-16 rounded-[1.25rem]' : 'h-full w-full rounded-[inherit]'
    )}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_28%)]" />
      <span className={cn('relative font-black italic tracking-[-0.18em]', large ? 'text-4xl' : 'text-2xl')}>
        M
      </span>
    </div>
  );

  if (variant === 'hero') {
    return (
      <div className={cn('relative z-10 flex flex-col items-center text-center text-white', className)}>
        <div className="mb-3 h-16 w-16 rounded-[1.25rem] ring-1 ring-white/40">
          <LogoMark large />
        </div>
        <p className="text-xl font-black uppercase tracking-[0.12em] leading-none">MR NETWORK</p>
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
      <div className={cn('shrink-0 shadow-lg shadow-blue-700/20', markSize)}>
        <LogoMark />
      </div>
      <div className="min-w-0">
        <p className={cn('truncate font-black uppercase leading-none tracking-tight text-slate-950', isDrawer ? 'text-sm' : 'text-[13px] sm:text-sm')}>
          MR NETWORK
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
