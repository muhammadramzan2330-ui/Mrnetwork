import React, { useState } from 'react';
import { Search, History, User, Shield, Clock, Filter, Trash2, Activity, Smartphone, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-8">
      {/* Header */}
      <div className="px-4 sm:px-8 py-6 flex justify-between items-center bg-white border-b border-slate-100 sticky top-16 z-20">
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">Security Logs</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">System activity monitor</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
          <History className="w-5 h-5" />
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by action, protocol or details..."
            className="input-modern pl-12 h-12 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4 pb-8">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Feed</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">Watching</span>
            </div>
          </div>

          {filteredLogs.map((log, i) => {
            const Icon = getTypeIcon(log.type);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="bg-white border-slate-100 shadow-sm p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start gap-4 sm:gap-6 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all", 
                    getTypeColor(log.type),
                    getTypeColor(log.type).replace('bg-', 'border-').replace('50', '100')
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                      <p className="text-base font-extrabold text-slate-900 tracking-tight leading-none sm:mt-1 group-hover:text-primary transition-colors">
                        {log.action}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tight sm:pt-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(log.date)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                      <span className="text-[9px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-md uppercase border border-primary/10">
                        @{log.target}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.date)}
                      </span>
                      {log.ipAddress && (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md uppercase border border-rose-100">
                          {log.ipAddress}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100/50">
                        <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                          "{log.details}"
                        </p>
                      </div>
                    )}
                    {log.userAgent && (
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase truncate">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span className="truncate">{log.userAgent}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <History className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No matching logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
