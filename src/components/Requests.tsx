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
    <div className="p-2 space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
        <h2 className="text-xl font-black text-text-main">Requests</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark rounded-[14px] gap-2 h-10 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> New Request
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-text-main tracking-tight">Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-2">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Select Customer</Label>
                  <Select onValueChange={(val: string) => setNewReq({ ...newReq, user: val })}>
                    <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-14 px-5 font-bold text-base">
                      <SelectValue placeholder="Search customer..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      <SelectItem value="1" className="rounded-xl font-bold py-3 cursor-pointer">Muhammad Ramzan</SelectItem>
                      <SelectItem value="2" className="rounded-xl font-bold py-3 cursor-pointer">Ali Khan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Request Type</Label>
                  <Select onValueChange={(val: string) => setNewReq({ ...newReq, type: val })}>
                    <SelectTrigger className="rounded-2xl bg-bg-gray border-none h-14 px-5 font-bold text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      <SelectItem value="new_connection" className="rounded-xl font-bold py-3 cursor-pointer">New Connection</SelectItem>
                      <SelectItem value="complaint" className="rounded-xl font-bold py-3 cursor-pointer">General Complaint</SelectItem>
                      <SelectItem value="speed_issue" className="rounded-xl font-bold py-3 cursor-pointer">Speed Issue</SelectItem>
                      <SelectItem value="router_issue" className="rounded-xl font-bold py-3 cursor-pointer">Router Issue</SelectItem>
                      <SelectItem value="package_change" className="rounded-xl font-bold py-3 cursor-pointer">Package Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Description</Label>
                  <Textarea 
                    placeholder="Describe the issue in detail..." 
                    className="rounded-2xl bg-bg-gray border-none min-h-[120px] p-5 font-medium text-sm focus-visible:ring-primary/20"
                    value={newReq.description}
                    onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleAddRequest}
                  className="bg-primary hover:bg-primary-dark rounded-2xl mt-4 h-16 font-black text-lg shadow-xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search tickets..."
          className="pl-11 rounded-xl border border-[#F3F4F6] bg-white h-11 text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredRequests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-4 rounded-2xl border border-[#F3F4F6] shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-bg-gray flex items-center justify-center text-text-muted">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main text-sm">{req.user}</h4>
                  <p className="text-primary text-[9px] font-bold uppercase tracking-wider">
                    {getRequestTypeLabel(req.type)}
                  </p>
                </div>
              </div>
              {getStatusBadge(req.status)}
            </div>

            <p className="text-text-muted text-[11px] font-medium line-clamp-2 mb-4 bg-bg-gray p-3 rounded-xl italic">
              "{req.description}"
            </p>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-text-muted text-[10px] font-medium">
                <Clock className="w-3 h-3" />
                <span>{req.date}</span>
              </div>
              <div className="flex gap-1">
                {req.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => handleStatusChange(req.id, 'assigned')}
                      variant="ghost" size="sm" className="h-7 text-blue-600 text-[10px] font-bold gap-1 px-2 hover:bg-blue-50 rounded-lg"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange(req.id, 'rejected')}
                      variant="ghost" size="sm" className="h-7 text-rose-600 text-[10px] font-bold gap-1 px-2 hover:bg-rose-50 rounded-lg"
                    >
                      Reject
                    </Button>
                  </>
                )}
                {req.status === 'assigned' && (
                  <Button 
                    onClick={() => handleStatusChange(req.id, 'resolved')}
                    variant="ghost" size="sm" className="h-7 text-emerald-600 text-[10px] font-bold gap-1 px-2 hover:bg-emerald-50 rounded-lg"
                  >
                    Resolve
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 text-primary text-[10px] font-bold gap-1 px-2 hover:bg-bg-gray rounded-lg">
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
