import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Clock, CheckCircle2, AlertCircle, User, Wrench, ChevronRight, XCircle } from 'lucide-react';
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
      case 'pending': return <Badge className="bg-[#FEF3C7] text-[#92400E] border-none gap-1 text-[9px] font-bold"><Clock className="w-3 h-3" /> PENDING</Badge>;
      case 'assigned': return <Badge className="bg-[#DBEAFE] text-[#1E40AF] border-none gap-1 text-[9px] font-bold"><User className="w-3 h-3" /> ASSIGNED</Badge>;
      case 'resolved': return <Badge className="bg-emerald-100 text-emerald-700 border-none gap-1 text-[9px] font-bold"><CheckCircle2 className="w-3 h-3" /> RESOLVED</Badge>;
      case 'rejected': return <Badge className="bg-rose-100 text-rose-700 border-none gap-1 text-[9px] font-bold"><XCircle className="w-3 h-3" /> REJECTED</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 border-none text-[9px] font-bold">{status.toUpperCase()}</Badge>;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredRequests = requests.filter(r => 
    r.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 space-y-6 pb-24 md:pb-8 max-w-5xl mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Requests</h2>
          <p className="text-slate-500 text-xs font-medium">Manage support tickets and inquiries</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="w-full sm:w-auto bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl gap-2 h-11 text-sm font-bold px-6 shadow-lg shadow-slate-200 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> New Request
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[480px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="bg-[#1E293B] p-8 text-white relative overflow-hidden">
                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-2xl font-bold tracking-tight">Create Support Ticket</DialogTitle>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Ticket Information</p>
                </DialogHeader>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              </div>
              <div className="p-8">
                <div className="grid gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Customer</Label>
                    <Select onValueChange={(val: string) => setNewReq({ ...newReq, user: val })}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-slate-700 shadow-sm focus:ring-primary/20">
                        <SelectValue placeholder="Search customer..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                        <SelectItem value="1" className="font-bold cursor-pointer">Muhammad Ramzan</SelectItem>
                        <SelectItem value="2" className="font-bold cursor-pointer">Ali Khan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Request Type</Label>
                    <Select onValueChange={(val: string) => setNewReq({ ...newReq, type: val })}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200 h-12 px-4 font-semibold text-slate-700 shadow-sm focus:ring-primary/20">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                        <SelectItem value="new_connection" className="font-bold cursor-pointer">New Connection</SelectItem>
                        <SelectItem value="complaint" className="font-bold cursor-pointer">General Complaint</SelectItem>
                        <SelectItem value="speed_issue" className="font-bold cursor-pointer">Speed Issue</SelectItem>
                        <SelectItem value="router_issue" className="font-bold cursor-pointer">Router Issue</SelectItem>
                        <SelectItem value="package_change" className="font-bold cursor-pointer">Package Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</Label>
                    <Textarea 
                      placeholder="Describe the issue in detail..." 
                      className="rounded-xl bg-slate-50 border-slate-200 min-h-[120px] p-4 font-medium text-sm focus-visible:ring-primary/20 shadow-sm transition-all focus:bg-white"
                      value={newReq.description}
                      onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleAddRequest}
                    className="bg-primary hover:bg-primary/95 text-white rounded-xl mt-4 h-14 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    Create Ticket
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by customer or description..."
          className="pl-11 rounded-xl border-slate-100 bg-white h-12 text-sm shadow-sm transition-all focus:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        {filteredRequests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:text-primary group-hover:bg-primary/5">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{req.user}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest leading-none">
                      {getRequestTypeLabel(req.type)}
                    </p>
                  </div>
                </div>
              </div>
              {getStatusBadge(req.status)}
            </div>

            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 mb-6 relative overflow-hidden group/text">
              <p className="text-slate-600 text-sm font-medium leading-relaxed relative z-10 italic">
                "{req.description}"
              </p>
              <div className="absolute top-0 right-0 w-2 h-full bg-primary/10 opacity-0 group-hover/text:opacity-100 transition-opacity" />
            </div>

            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>{req.date}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {req.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => handleStatusChange(req.id, 'assigned')}
                      variant="ghost" size="sm" className="h-9 flex-1 sm:flex-none text-emerald-600 text-[10px] font-bold px-4 hover:bg-emerald-50 rounded-lg tracking-widest uppercase"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange(req.id, 'rejected')}
                      variant="ghost" size="sm" className="h-9 flex-1 sm:flex-none text-rose-500 text-[10px] font-bold px-4 hover:bg-rose-50 rounded-lg tracking-widest uppercase"
                    >
                      Reject
                    </Button>
                  </>
                )}
                {req.status === 'assigned' && (
                  <Button 
                    onClick={() => handleStatusChange(req.id, 'resolved')}
                    className="h-9 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-6 rounded-lg tracking-widest uppercase shadow-md shadow-emerald-100 transition-all active:scale-95"
                  >
                    Mark Resolved
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-9 text-slate-400 text-[10px] font-bold px-4 hover:bg-slate-50 rounded-lg tracking-widest uppercase gap-2">
                  Details <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
