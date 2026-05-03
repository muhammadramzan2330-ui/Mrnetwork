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
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-24 md:pb-8">
      {/* Header and Action */}
      <div className="px-4 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Support Tickets</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">Manage inquiries & complaints</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white rounded-xl gap-3 h-12 text-[10px] font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-wider">
                <Plus className="w-4 h-4" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-100 bg-white shadow-2xl p-0 overflow-hidden text-slate-900">
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="header-gradient p-8 text-white relative">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">Create Support Ticket</DialogTitle>
                  </DialogHeader>
                  <p className="text-white/60 text-[10px] font-bold mt-2 uppercase tracking-widest leading-none">Ticket Initiation Protocol</p>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Customer</Label>
                      <Select onValueChange={(val: string) => setNewReq({ ...newReq, user: val })}>
                        <SelectTrigger className="input-modern w-full">
                          <SelectValue placeholder="Search identities..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 bg-white shadow-xl p-1">
                          <SelectItem value="1" className="font-bold py-3 text-[10px] tracking-widest">Muhammad Ramzan</SelectItem>
                          <SelectItem value="2" className="font-bold py-3 text-[10px] tracking-widest">Ali Khan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Classification</Label>
                      <Select onValueChange={(val: string) => setNewReq({ ...newReq, type: val })}>
                        <SelectTrigger className="input-modern w-full">
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
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</Label>
                      <Textarea 
                        placeholder="Describe the issue in detail..." 
                        className="input-modern min-h-[120px] resize-none"
                        value={newReq.description}
                        onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={handleAddRequest}
                      className="btn-gradient w-full mt-4 h-14 font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative group pt-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search tickets by name or description..."
            className="input-modern pl-12 h-12 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full flex flex-col p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 transition-all group-hover:bg-primary group-hover:text-white border border-primary/10">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm leading-none mt-1">{req.user}</h4>
                      <p className="text-primary text-[9px] font-bold uppercase tracking-widest mt-2">
                        {getRequestTypeLabel(req.type)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(req.status)}
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-primary transition-all">
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
