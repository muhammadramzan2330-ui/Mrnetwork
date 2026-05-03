import React, { useState } from 'react';
import { Search, History, User, Shield, Clock, Filter, Trash2, Activity, Smartphone, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { useSystem } from '../contexts/SystemContext';
import { cn, formatDate, formatTime } from '@/lib/utils';

export default function AuditLogs() {
  const { logs, loading } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return null;

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return User;
      case 'payment': return CreditCard;
      case 'package': return Shield;
      case 'auth': return Shield;
      case 'system': return Activity;
      default: return History;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-50 text-blue-600';
      case 'payment': return 'bg-emerald-50 text-emerald-600';
      case 'package': return 'bg-purple-50 text-purple-600';
      case 'auth': return 'bg-amber-50 text-amber-600';
      case 'system': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto w-full overflow-x-hidden">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Security Vault</h2>
          <p className="text-slate-500 text-xs font-medium">Audit logs and system activity</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
          <History className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Filter activity by user or action..."
          className="pl-12 rounded-xl border-slate-100 bg-white h-12 text-sm font-semibold shadow-sm transition-all focus:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 px-1">
        {filteredLogs.map((log, i) => {
          const Icon = getTypeIcon(log.type);
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all group"
            >
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", getTypeColor(log.type))}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1.5 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate pr-2 tracking-tight">{log.action}</p>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0 flex items-center gap-1 uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {formatTime(log.date)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">@{log.target}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tight">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {formatDate(log.date)}
                  </span>
                  {log.ipAddress && (
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      IP: {log.ipAddress}
                    </span>
                  )}
                </div>
                {log.details && (
                  <p className="text-[11px] text-slate-500 font-medium bg-slate-50/50 p-3 rounded-xl mb-3 border border-slate-100/50 leading-relaxed italic">
                    "{log.details}"
                  </p>
                )}
                {log.userAgent && (
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 transition-colors group-hover:text-slate-400">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px] sm:max-w-none tracking-tight">{log.userAgent}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <History className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No matching activities captured</p>
          </div>
        )}
      </div>
    </div>
  );
}
