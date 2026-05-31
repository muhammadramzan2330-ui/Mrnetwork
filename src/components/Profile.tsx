import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function UserProfile() {
  const { profile, loading, user } = useAuth();

  if (loading || (user && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing profile...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-4 text-amber-500">Please sign in to view your profile.</div>;
  }

  const phone = (profile as any).phone || (profile as any).whatsapp || (profile as any).mobile || (profile as any).phoneNumber || 'N/A';

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-sm mx-auto mt-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="text-xl font-black">{(profile.name || 'U')[0]}</span>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{profile.name || 'Customer'}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">{profile.role} account</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
            <span className="text-xs font-bold text-slate-600 truncate ml-4">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</span>
            <span className="text-xs font-bold text-slate-600">{phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-tight",
              profile.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            )}>
              {profile.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
