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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-extrabold text-text-main">Requests</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary-dark rounded-xl gap-2 h-9 text-xs font-bold">
                <Plus className="w-4 h-4" /> New Request
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-[30px] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user" className="text-xs font-bold text-text-muted">Select User</Label>
                <Select onValueChange={(val: string) => setNewReq({ ...newReq, user: val })}>
                  <SelectTrigger className="rounded-xl bg-bg-gray border-none h-11">
                    <SelectValue placeholder="Search user..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1">Muhammad Ramzan</SelectItem>
                    <SelectItem value="2">Ali Khan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-xs font-bold text-text-muted">Request Type</Label>
                <Select onValueChange={(val: string) => setNewReq({ ...newReq, type: val })}>
                  <SelectTrigger className="rounded-xl bg-bg-gray border-none h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="new_connection">New Connection</SelectItem>
                    <SelectItem value="complaint">General Complaint</SelectItem>
                    <SelectItem value="speed_issue">Speed Issue</SelectItem>
                    <SelectItem value="router_issue">Router Issue</SelectItem>
                    <SelectItem value="package_change">Package Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc" className="text-xs font-bold text-text-muted">Description</Label>
                <Textarea 
                  id="desc" 
                  placeholder="Describe the issue..." 
                  className="rounded-xl bg-bg-gray border-none min-h-[100px] p-4"
                  value={newReq.description}
                  onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleAddRequest}
                className="bg-primary hover:bg-primary-dark rounded-xl mt-2 h-11 font-bold"
              >
                Create Ticket
              </Button>
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
