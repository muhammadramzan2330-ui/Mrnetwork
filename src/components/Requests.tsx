import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Clock, CheckCircle2, AlertCircle, User, Wrench, ChevronRight, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'assigned' | 'resolved' | 'rejected'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState([
    { id: '1', user: 'Muhammad Ramzan', type: 'speed_issue', status: 'pending', date: '2026-04-14 10:30 AM', description: 'Internet is very slow since morning.' },
    { id: '2', user: 'Ali Khan', type: 'new_connection', status: 'assigned', date: '2026-04-13 02:15 PM', description: 'New connection request for House #45.', technician: 'Sajid' },
    { id: '3', user: 'Sara Ahmed', type: 'router_issue', status: 'resolved', date: '2026-04-12 11:00 AM', description: 'Router not turning on.' },
  ]);

  const [newReq, setNewReq] = useState<{
    user: string;
    type: string;
    description: string;
  }>({
    user: '',
    type: '',
    description: ''
  });

  const handleAddRequest = () => {
    if (!newReq.user || !newReq.type) return;

    const request = {
      id: Math.random().toString(36).substr(2, 9),
      user: newReq.user === '1' ? 'Muhammad Ramzan' : 'Ali Khan',
      type: newReq.type,
      status: 'pending',
      date: new Date().toLocaleString(),
      description: newReq.description
    };

    setRequests([request, ...requests]);
    setNewReq({ user: '', type: '', description: '' });
    setIsOpen(false);
    toast.success('Support ticket created');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.info(`Request marked as ${newStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="h-6 rounded-full bg-[#FEF3C7] text-[#92400E] border-none gap-1 px-2 text-[9px] font-bold whitespace-nowrap"><Clock className="w-3 h-3" /> PENDING</Badge>;
      case 'assigned': return <Badge className="h-6 rounded-full bg-[#DBEAFE] text-[#1E40AF] border-none gap-1 px-2 text-[9px] font-bold whitespace-nowrap"><User className="w-3 h-3" /> ASSIGNED</Badge>;
      case 'resolved': return <Badge className="h-6 rounded-full bg-emerald-100 text-emerald-700 border-none gap-1 px-2 text-[9px] font-bold whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> RESOLVED</Badge>;
      case 'rejected': return <Badge className="h-6 rounded-full bg-rose-100 text-rose-700 border-none gap-1 px-2 text-[9px] font-bold whitespace-nowrap"><XCircle className="w-3 h-3" /> REJECTED</Badge>;
      default: return <Badge className="h-6 rounded-full bg-slate-100 text-slate-700 border-none px-2 text-[9px] font-bold whitespace-nowrap">{status.toUpperCase()}</Badge>;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'rejected', label: 'Rejected' },
  ] as const;

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredRequests = requests.filter(r => {
    const searchable = [
      r.user,
      r.description,
      r.status,
      r.date,
      'technician' in r ? r.technician || '' : '',
      getRequestTypeLabel(r.type),
      r.type,
    ].join(' ').toLowerCase();

    const matchesSearch = !searchLower || searchable.includes(searchLower);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-8">
      {/* Header and Action */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Support Tickets</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">Manage subscriber inquiries & complaints</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-3 h-12 text-[10px] font-bold px-8 shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase tracking-wider">
                <Plus className="w-4 h-4" /> New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="header-gradient p-8 text-white relative">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">Support Ticket</DialogTitle>
                  </DialogHeader>
                  <p className="text-white/60 text-[10px] font-bold mt-2 uppercase tracking-widest leading-none">Create a new support request</p>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subscriber</Label>
                      <Select onValueChange={(val: string) => setNewReq({ ...newReq, user: val })}>
                        <SelectTrigger className="input-modern w-full px-4 h-12">
                          <SelectValue placeholder="Select subscriber..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                          <SelectItem value="1" className="font-bold py-3 text-[10px] tracking-widest">Muhammad Ramzan</SelectItem>
                          <SelectItem value="2" className="font-bold py-3 text-[10px] tracking-widest">Ali Khan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Request Category</Label>
                      <Select onValueChange={(val: string) => setNewReq({ ...newReq, type: val })}>
                        <SelectTrigger className="input-modern w-full px-4 h-12">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                          <SelectItem value="new_connection" className="font-bold py-3 text-[10px] tracking-widest">New Connection</SelectItem>
                          <SelectItem value="complaint" className="font-bold py-3 text-[10px] tracking-widest">General Complaint</SelectItem>
                          <SelectItem value="speed_issue" className="font-bold py-3 text-[10px] tracking-widest">Speed Issue</SelectItem>
                          <SelectItem value="router_issue" className="font-bold py-3 text-[10px] tracking-widest">Router Issue</SelectItem>
                          <SelectItem value="package_change" className="font-bold py-3 text-[10px] tracking-widest">Package Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Issue Description</Label>
                      <Textarea 
                        placeholder="Describe the issue in detail..." 
                        className="input-modern min-h-[120px] resize-none px-4 py-3"
                        value={newReq.description}
                        onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={handleAddRequest}
                      className="w-full mt-4 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
                    >
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
            <Input
              placeholder="Search tickets by name, type, status, date..."
              className="input-modern h-12 pl-12 pr-4 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.key;
              const count = tab.key === 'all'
                ? requests.length
                : requests.filter((req) => req.status === tab.key).length;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {tab.label} <span className={isActive ? 'text-white/70' : 'text-slate-400'}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex gap-4 items-start min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 transition-all group-hover:bg-indigo-600 group-hover:text-white border border-indigo-100">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col items-start gap-2">
                        <h4
                          className="font-bold text-slate-900 tracking-tight uppercase text-sm leading-tight break-words"
                          title={req.user}
                        >
                          {req.user}
                        </h4>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-indigo-600 text-[9px] font-bold uppercase tracking-widest mt-2">
                        {getRequestTypeLabel(req.type)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex-1 min-h-[80px]">
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed group-hover:text-slate-700 transition-colors italic">
                    "{req.description}"
                  </p>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">{req.date}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleStatusChange(req.id, 'assigned')}
                          variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-emerald-600 font-bold text-[9px] hover:bg-emerald-50 uppercase tracking-wider"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleStatusChange(req.id, 'rejected')}
                          variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-rose-600 font-bold text-[9px] hover:bg-rose-50 uppercase tracking-wider"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {req.status === 'assigned' && (
                      <Button 
                        onClick={() => handleStatusChange(req.id, 'resolved')}
                        size="sm"
                        className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] shadow-sm transition-all active:scale-95 uppercase tracking-wider"
                      >
                        Resolve
                      </Button>
                    )}
                    {req.status === 'resolved' && (
                      <Button
                        onClick={() => handleStatusChange(req.id, 'assigned')}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg text-indigo-600 font-bold text-[9px] hover:bg-indigo-50 uppercase tracking-wider gap-1.5"
                      >
                        <RotateCcw className="w-3 h-3" /> Reopen
                      </Button>
                    )}
                    {req.status === 'rejected' && (
                      <Button
                        onClick={() => handleStatusChange(req.id, 'pending')}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg text-amber-600 font-bold text-[9px] hover:bg-amber-50 uppercase tracking-wider gap-1.5"
                      >
                        Restore
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" aria-label="View request" className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-indigo-600 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
