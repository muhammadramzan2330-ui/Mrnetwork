import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  User,
  Tag,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Hash
} from 'lucide-react';
import { useSystem } from '../contexts/SystemContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Tickets() {
  const { tickets, updateTicketStatus } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in progress' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (ticket.userName || '').toLowerCase().includes(searchLower) ||
      (ticket.message || '').toLowerCase().includes(searchLower) ||
      (ticket.issueType || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'in progress': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Support Tickets</h1>
            <p className="text-slate-500 font-medium tracking-wide">Manage customer complaints and technical issues</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="px-4 py-2 text-center border-r border-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Open</p>
               <p className="text-xl font-black text-rose-600">{tickets.filter(t => t.status === 'open').length}</p>
             </div>
             <div className="px-4 py-2 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Resolved</p>
               <p className="text-xl font-black text-emerald-600">{tickets.filter(t => t.status === 'resolved').length}</p>
             </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <Input
              placeholder="Search by User, Message, or Type..."
              className="h-14 pl-12 bg-white border-slate-100 rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
            {(['all', 'open', 'in progress', 'resolved'] as const).map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-none whitespace-nowrap",
                  statusFilter === filter ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"
                )}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTickets.map((ticket, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={ticket.id}
              >
                <Card className={cn(
                  "bg-white rounded-[2.5rem] p-6 border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative",
                  ticket.status === 'open' && "border-l-4 border-l-rose-500"
                )}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 transition-all",
                        ticket.status === 'open' ? "bg-rose-50 text-rose-600" : "bg-slate-50 group-hover:bg-indigo-50"
                      )}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none">{ticket.userName}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {ticket.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-xl">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 w-56">
                        <DropdownMenuItem 
                          className="gap-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-indigo-600 hover:bg-indigo-50"
                          onClick={() => updateTicketStatus(ticket.id, 'in progress')}
                        >
                          <Clock className="w-4 h-4" /> Set In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-emerald-600 hover:bg-emerald-50"
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-rose-600 hover:bg-rose-50"
                          onClick={() => updateTicketStatus(ticket.id, 'open')}
                        >
                          <AlertTriangle className="w-4 h-4" /> Re-open Ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-[100px]">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.issueType}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        "{ticket.message}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge className={cn(
                          "px-3 py-1 rounded-lg border-none font-black text-[9px] uppercase tracking-widest",
                          getPriorityColor(ticket.priority)
                        )}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={cn(
                          "px-3 py-1 rounded-lg border-none font-black text-[9px] uppercase tracking-widest",
                          getStatusColor(ticket.status)
                        )}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                       <Button 
                         onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                         variant="ghost" 
                         className="h-9 px-4 text-emerald-600 hover:bg-emerald-50 font-black text-[9px] uppercase tracking-widest rounded-xl gap-2"
                       >
                         Resolve <CheckCircle2 className="w-3.5 h-3.5" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         className="h-9 w-9 p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                       >
                         <MessageCircle className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>

                  {ticket.status === 'open' && (
                    <div className="absolute top-4 right-4 translate-x-1/2 -translate-y-1/2">
                       <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-24 text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <MessageSquare className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Clean Inbox</h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">No support tickets match your current filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
