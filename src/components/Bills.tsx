import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  Calendar,
  User,
  Package as PackageIcon,
  DollarSign,
  ArrowRight,
  MessageCircle
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
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { generateInvoicePDF } from '@/services/pdfService';
import { toast } from 'sonner';

export default function Bills() {
  const { bills, users, markBillAsPaid, generateMonthlyBills } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const now = new Date();

  const filteredBills = bills.filter(bill => {
    const searchLower = searchTerm.toLowerCase();
    const isOverdue = bill.status === 'unpaid' && new Date(bill.dueDate) < now;

    const matchesSearch = 
      (bill.userName || '').toLowerCase().includes(searchLower) ||
      (bill.packageName || '').toLowerCase().includes(searchLower) ||
      (bill.month || '').toLowerCase().includes(searchLower);
    
    let matchesStatus = true;
    if (statusFilter === 'paid') matchesStatus = bill.status === 'paid';
    if (statusFilter === 'unpaid') matchesStatus = bill.status === 'unpaid';
    if (statusFilter === 'overdue') matchesStatus = isOverdue;
    
    return matchesSearch && matchesStatus;
  });

  const overdueBillsCount = bills.filter(b => b.status === 'unpaid' && new Date(b.dueDate) < now).length;

  const handleWhatsAppReminder = (bill: any, user: any) => {
    if (!user || (!user.phone && !user.whatsapp)) {
      toast.error("Customer contact number not found");
      return;
    }

    const phone = user.whatsapp || user.phone;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hello *${bill.userName}*,\n\nThis is a reminder from *M & NETWORK* regarding your internet subscription.\n\n*Invoice Details:*\n- Plan: ${bill.packageName}\n- Amount: RS. ${bill.amount}\n- Due Date: ${formatDate(bill.dueDate)}\n- Status: *UNPAID*\n\nPlease pay your bill to avoid service suspension. Thank you!`;
    
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleGenerateBills = async () => {
    setIsGenerating(true);
    try {
      await generateMonthlyBills();
      toast.success("Billing cycle processed successfully");
    } catch (e) {
      toast.error("Failed to generate bills");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await markBillAsPaid(billId);
    } catch (e) {
      // Error handled in system context
    }
  };

  const overdueAmount = bills
    .filter(b => b.status === 'unpaid' && new Date(b.dueDate) < now)
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Billing Management</h1>
            <p className="text-slate-500 font-medium tracking-wide">Monitor and manage customer invoices and collections</p>
          </div>
          <Button 
            onClick={handleGenerateBills}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-indigo-100"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            Run Billing Cycle
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white rounded-3xl border-slate-100 shadow-sm overflow-hidden border-b-4 border-b-rose-500">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center animate-pulse">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Overdue Bills</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-rose-600 leading-none">{overdueBillsCount}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">RS. {overdueAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Collected Amount</p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  RS. {bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Invoices</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{bills.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <Input
              placeholder="Search by User, Package, or Month..."
              className="h-14 pl-12 pr-4 bg-white border-slate-100 rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
            {(['all', 'paid', 'unpaid', 'overdue'] as const).map((filter) => (
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
            {filteredBills.map((bill, index) => {
              const user = users.find(u => u.id === bill.userId);
              const isOverdue = bill.status === 'unpaid' && new Date(bill.dueDate) < now;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={bill.id}
                >
                  <Card className={cn(
                    "bg-white rounded-[2.5rem] p-6 border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative",
                    isOverdue && "border-rose-200 bg-rose-50/10"
                  )}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          isOverdue ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                        )}>
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none">{bill.userName}</h3>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {bill.month}
                            </p>
                            {isOverdue && (
                              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-rose-100 rounded-md">OVERDUE</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Bill actions" className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-xl">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 w-56">
                          <DropdownMenuItem 
                            className="gap-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-slate-600 hover:text-indigo-600"
                            onClick={() => {
                              if (user) {
                                generateInvoicePDF({
                                  invoiceNumber: bill.id.slice(-8).toUpperCase(),
                                  customerName: bill.userName,
                                  phone: user.phone || 'N/A',
                                  packageName: bill.packageName,
                                  speed: user.packageSpeed || 'N/A',
                                  amount: bill.amount,
                                  dueDate: formatDate(bill.dueDate),
                                  status: bill.status,
                                  createdDate: formatDate(bill.createdAt)
                                });
                              } else {
                                toast.error("User profile required for PDF generation");
                              }
                            }}
                          >
                            <Download className="w-4 h-4 text-indigo-600" /> Download PDF
                          </DropdownMenuItem>

                          {bill.status === 'unpaid' && (
                            <DropdownMenuItem 
                              className="gap-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-emerald-600 hover:bg-emerald-50"
                              onClick={() => {
                                handleWhatsAppReminder(bill, user);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp Reminder
                            </DropdownMenuItem>
                          )}

                          {bill.status === 'unpaid' && (
                            <DropdownMenuItem 
                              className="gap-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer text-slate-900 hover:bg-slate-50"
                              onClick={() => handleMarkAsPaid(bill.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mark as Paid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-4">
                      <div className={cn(
                        "p-4 rounded-2xl border transition-colors",
                        isOverdue ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100"
                      )}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{bill.packageName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            "text-xl font-black tracking-tight",
                            isOverdue ? "text-rose-600" : "text-slate-900"
                          )}>RS. {bill.amount.toLocaleString()}</span>
                          <Badge className={cn(
                            "px-3 py-1 rounded-lg border-none font-black text-[9px] uppercase tracking-widest",
                            bill.status === 'paid' ? "bg-emerald-100 text-emerald-600 shadow-sm" : 
                            isOverdue ? "bg-rose-600 text-white shadow-lg animate-pulse" : "bg-rose-100 text-rose-600 animate-pulse"
                          )}>
                            {isOverdue ? 'Overdue' : bill.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isOverdue ? "bg-rose-400 animate-ping" : "bg-slate-300"
                          )} />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            isOverdue ? "text-rose-500" : "text-slate-400"
                          )}>Due Date: {formatDate(bill.dueDate)}</span>
                        </div>
                        {bill.status === 'unpaid' && (
                           <div className="flex items-center gap-1">
                             <Button 
                               onClick={() => handleWhatsAppReminder(bill, user)}
                               variant="ghost" 
                               aria-label="WhatsApp reminder"
                               className="h-8 w-8 p-0 text-[#25D366] hover:bg-emerald-50 rounded-lg group/wa"
                             >
                                <MessageCircle className="w-4 h-4 transition-transform group-hover/wa:scale-110" />
                             </Button>
                             <Button 
                               onClick={() => handleMarkAsPaid(bill.id)}
                               variant="ghost" 
                               className="h-8 px-4 text-indigo-600 hover:bg-indigo-50 font-black text-[9px] uppercase tracking-widest rounded-lg gap-1.5"
                             >
                               Payment <ArrowRight className="w-3 h-3" />
                             </Button>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Left Accent */}
                    <div className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      bill.status === 'paid' ? "bg-emerald-500" : 
                      isOverdue ? "bg-rose-600" : "bg-rose-400"
                    )} />
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredBills.length === 0 && (
          <div className="py-20 text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Search className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Bills Found</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Adjust your filters or run a billing cycle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
