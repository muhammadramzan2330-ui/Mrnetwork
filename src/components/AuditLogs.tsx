import React, { useState } from 'react';
import { Search, History, User, Shield, Clock, Filter, Trash2, Activity, Smartphone, CreditCard } from 'lucide-react';
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
    <div className="p-4 space-y-4 pb-20">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-black text-text-main leading-tight">System Logs</h2>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <History className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search activity logs..."
          className="pl-12 rounded-2xl border-none bg-white h-12 text-sm font-bold shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log, i) => {
          const Icon = getTypeIcon(log.type);
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white p-4 rounded-[24px] border border-slate-50 shadow-sm flex items-start gap-4"
            >
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shrink-0", getTypeColor(log.type))}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-black text-text-main truncate pr-2">{log.action}</p>
                  <span className="text-[9px] font-bold text-text-muted shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(log.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">@{log.target}</span>
                  <span className="text-[10px] font-bold text-text-muted truncate">{formatDate(log.date)}</span>
                  {log.ipAddress && (
                    <span className="text-[9px] font-black text-rose-400 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      IP: {log.ipAddress}
                    </span>
                  )}
                </div>
                {log.details && (
                  <p className="text-[11px] text-text-muted font-medium bg-slate-50 p-2 rounded-xl mb-1.5">
                    {log.details}
                  </p>
                )}
                {log.userAgent && (
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 italic">
                    <Smartphone className="w-3 h-3" />
                    <span className="truncate">{log.userAgent}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-text-muted text-xs font-black uppercase tracking-widest">No matching logs</p>
          </div>
        )}
      </div>
    </div>
  );
}
