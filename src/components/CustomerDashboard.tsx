import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSystem } from '@/contexts/SystemContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  User, 
  Package, 
  Phone, 
  CreditCard, 
  Calendar,
  ChevronRight,
  Wifi,
  AlertCircle,
  CheckCircle2,
  LogOut,
  MessageSquare,
  MessageCircle,
  Shield,
  Smartphone,
  MapPin,
  History,
  Download,
  Search,
  XCircle,
  LayoutDashboard,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { generateInvoicePDF } from '@/services/pdfService';
import { auth } from '@/services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth';
import { getPasswordChecks, validateStrongPassword } from '@/lib/security';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const { profile, user } = useAuth();
  const { bills, settings, packages, addLog, payments, addTicket, tickets, users } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketType, setTicketType] = useState('Technical Issue');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const navigate = useNavigate();

  if (!profile) return null;

  const currentCustomer = users.find((customer: any) => (
    customer.id === profile.id ||
    customer.uid === user?.uid ||
    (customer.email || '').toLowerCase() === (profile.email || '').toLowerCase()
  ));
  const ownerIds = new Set([profile.id, (profile as any).linkedProfileId, profile.uid, user?.uid, currentCustomer?.id, currentCustomer?.uid].filter(Boolean));
  const userBills = bills.filter(b => ownerIds.has(b.userId));
  const userPayments = payments.filter((payment: any) => (
    ownerIds.has(payment.userId) ||
    ownerIds.has(payment.uid) ||
    userBills.some((bill: any) => payment.billId && payment.billId === bill.id)
  ));
  const coveringPayments = userPayments.filter((payment: any) => ['approved', 'pending'].includes(payment.status));
  const coveredBillIds = new Set(coveringPayments.map((payment: any) => payment.billId).filter(Boolean));
  const coveredBillAmounts = new Set(coveringPayments.map((payment: any) => Number(payment.amount || 0)).filter((amount: number) => amount > 0));
  const paymentHistoryBills = coveringPayments.map((payment: any) => {
    const matchedBill = userBills.find((bill: any) => (
      bill.id === payment.billId ||
      (Number(bill.amount || 0) === Number(payment.amount || 0) && bill.status === 'unpaid')
    ));

    return {
      ...(matchedBill || {}),
      id: `payment-${payment.id}`,
      sourceBillId: matchedBill?.id || payment.billId || '',
      packageName: matchedBill?.packageName || payment.packageName || 'Monthly Bill',
      month: matchedBill?.month || new Date(payment.date || payment.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      amount: Number(payment.amount || matchedBill?.amount || 0),
      dueDate: matchedBill?.dueDate || payment.date || payment.createdAt || new Date().toISOString(),
      createdAt: payment.date || payment.createdAt || matchedBill?.createdAt,
      updatedAt: payment.approvedAt || payment.date || payment.createdAt || matchedBill?.updatedAt,
      paidAt: payment.approvedAt || payment.date || payment.createdAt,
      status: payment.status === 'pending' ? 'pending' : 'paid',
      paymentSubmitted: payment.status === 'pending',
    };
  });

  const paidOrSubmittedAmounts = new Set(paymentHistoryBills.map((bill: any) => Number(bill.amount || 0)).filter((amount: number) => amount > 0));
  const paidOrSubmittedBillIds = new Set(paymentHistoryBills.flatMap((bill: any) => [bill.sourceBillId, bill.id]).filter(Boolean));
  const remainingUnpaidBills = userBills.filter((bill: any) => (
    bill.status === 'unpaid' &&
    !coveredBillIds.has(bill.id) &&
    !paidOrSubmittedBillIds.has(bill.id) &&
    !paidOrSubmittedAmounts.has(Number(bill.amount || 0))
  ));

  const displayBills = [...paymentHistoryBills, ...remainingUnpaidBills].sort((a: any, b: any) => (
    new Date(b.paidAt || b.updatedAt || b.createdAt || b.dueDate || 0).getTime() -
    new Date(a.paidAt || a.updatedAt || a.createdAt || a.dueDate || 0).getTime()
  ));
  const userTickets = tickets.filter(t => ownerIds.has(t.userId));
  const now = new Date();
  const supportNumber = settings?.easypaisaNumber || "03001234567"; // Fallback to settings or default
  const passwordChecks = getPasswordChecks(newPassword);
  const passwordStatus = validateStrongPassword(newPassword);
  const customerName = (profile.name || user?.displayName || profile.email?.split('@')[0] || 'Customer').trim();
  const headlineName = customerName.split(/\s+/)[0] || 'Customer';
  const getPhone = (source: any = {}) => source.phone || source.whatsapp || source.mobile || source.phoneNumber || source.userPhone || source.customerPhone || '';
  const customerPhone = (
    getPhone(profile) ||
    getPhone(currentCustomer) ||
    getPhone(userBills[0]) ||
    user?.phoneNumber ||
    'N/A'
  );
  const searchQuery = searchTerm.trim().toLowerCase();
  const matchesSearch = (...values: any[]) => {
    if (!searchQuery) return false;
    return values
      .filter((value) => value !== undefined && value !== null)
      .some((value) => String(value).toLowerCase().includes(searchQuery));
  };
  
  // Search filter logic
  const filteredBills = displayBills.filter(bill => {
    const isOverdue = bill.status === 'unpaid' && new Date(bill.dueDate) < now;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const isOverdueMatch = isOverdue && 'overdue'.includes(searchLower);
    
    return (
      (bill.packageName || '').toLowerCase().includes(searchLower) ||
      (bill.month || '').toLowerCase().includes(searchLower) ||
      (bill.status || '').toLowerCase().includes(searchLower) ||
      isOverdueMatch ||
      bill.amount.toString().includes(searchLower) ||
      formatDate(bill.dueDate).toLowerCase().includes(searchLower)
    );
  });

  const currentBill = displayBills[0];
  
  // Get assigned package based on either packageId or plan string
  const assignedPackage = packages.find(p => p.id === (profile.packageId || profile.plan));
  const filteredTickets = userTickets.filter((ticket) =>
    matchesSearch(ticket.issueType, ticket.message, ticket.status, ticket.priority, ticket.id, formatDate(ticket.createdAt))
  );
  const functionSearchResults = searchQuery ? [
    {
      key: 'account-profile',
      title: 'Account Profile',
      section: 'Profile',
      description: `${customerName} - ${customerPhone !== 'N/A' ? customerPhone : profile.email || 'Account details'}`,
      icon: <User className="w-4 h-4" />,
      isMatch: matchesSearch('account profile customer name phone email member id', customerName, customerPhone, profile.email, profile.uid),
      action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
    },
    {
      key: 'active-plan',
      title: 'Active Plan',
      section: 'Package',
      description: profile.packageName || assignedPackage?.name || 'Package assignment details',
      icon: <Package className="w-4 h-4" />,
      isMatch: matchesSearch('plan package speed internet monthly active', profile.packageName, profile.packageSpeed, assignedPackage?.name, assignedPackage?.speed, assignedPackage?.price),
      action: () => navigate('/packages'),
    },
    {
      key: 'billing-payments',
      title: 'Bills & Payments',
      section: 'Payments',
      description: currentBill ? `${formatCurrency(currentBill.amount)} - ${currentBill.status}` : 'Payment history and balance',
      icon: <CreditCard className="w-4 h-4" />,
      isMatch: matchesSearch('bill bills billing payment payments paid unpaid overdue balance due invoice recharge', currentBill?.amount, currentBill?.status, currentBill?.month, currentBill?.dueDate),
      action: () => navigate('/payments'),
    },
    {
      key: 'support-contact',
      title: 'Support Contact',
      section: 'Support',
      description: `WhatsApp / Call: ${supportNumber}`,
      icon: <Phone className="w-4 h-4" />,
      isMatch: matchesSearch('support contact whatsapp call phone help complaint', supportNumber),
      action: () => window.open(`https://wa.me/${supportNumber}`, '_blank'),
    },
    {
      key: 'new-complaint',
      title: 'New Complaint',
      section: 'Ticket',
      description: 'Slow internet, outage, billing issue, package change request',
      icon: <MessageCircle className="w-4 h-4" />,
      isMatch: matchesSearch('complaint ticket support issue slow outage router login package change request'),
      action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
    },
    {
      key: 'update-security',
      title: 'Update Security',
      section: 'Security',
      description: 'Change password inside app',
      icon: <Shield className="w-4 h-4" />,
      isMatch: matchesSearch('security password update change login account safe'),
      action: () => setIsSecurityOpen(true),
    },
  ].filter((item) => item.isMatch) : [];
  const billSearchResults = searchQuery ? filteredBills.slice(0, 4).map((bill) => ({
    key: `bill-${bill.id}`,
    title: `${bill.packageName || 'Monthly Bill'} - ${bill.month}`,
    section: 'Bill',
    description: `${formatCurrency(bill.amount)} - ${bill.status} - Due ${formatDate(bill.dueDate)}`,
    icon: <CreditCard className="w-4 h-4" />,
    action: () => navigate('/payments'),
  })) : [];
  const ticketSearchResults = searchQuery ? filteredTickets.slice(0, 4).map((ticket) => ({
    key: `ticket-${ticket.id}`,
    title: ticket.issueType || 'Support Ticket',
    section: 'Ticket',
    description: `${ticket.status || 'open'} - ${ticket.message || ''}`,
    icon: <MessageSquare className="w-4 h-4" />,
    action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
  })) : [];
  const globalSearchResults = [...functionSearchResults, ...billSearchResults, ...ticketSearchResults];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleUpdateSecurity = async () => {
    const currentUser = auth.currentUser;
    const email = currentUser?.email || profile.email;

    if (!currentUser || !email) {
      toast.error('Account email nahi mila. Dobara login karein.');
      return;
    }

    if (!currentPassword) {
      toast.error('Current password enter karein.');
      return;
    }

    if (!passwordStatus.isStrong) {
      toast.error('New password strong nahi hai.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password aur confirm password match nahi kar rahe.');
      return;
    }

    setIsUpdatingSecurity(true);
    try {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      if (addLog) {
        await addLog('Security Password Updated', customerName, 'auth', 'Customer updated password inside app');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSecurityOpen(false);
      toast.success('Password update ho gaya.');
    } catch (error: any) {
      console.error('Security update failed:', error);
      const message =
        error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential'
          ? 'Current password galat hai.'
          : error?.code === 'auth/requires-recent-login'
            ? 'Dobara login kar ke try karein.'
            : error?.code === 'auth/weak-password'
              ? 'New password aur strong rakhein.'
              : error?.code === 'auth/operation-not-allowed'
                ? 'Google login wale account ka password Google account se change hota hai.'
                : 'Security update failed. Please try again.';
      toast.error(message);
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSubmittingTicket(true);
    try {
      await addTicket({
        userId: user?.uid || profile.uid || profile.id,
        userName: customerName,
        issueType: ticketType,
        message: ticketMessage,
        priority: ticketPriority,
      });
      setTicketMessage('');
      if (addLog) addLog('Ticket Submitted', customerName, 'customer', `Issue: ${ticketType}`);
    } catch (e) {
      toast.error("Failed to submit ticket");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const hasOverdueBills = displayBills.some(b => b.status === 'unpaid' && new Date(b.dueDate) < now);
  const hasUnpaidBills = displayBills.some(b => b.status === 'unpaid');
  const isSuspended = profile.status === 'suspended';
  const isExpired = profile.status === 'expired' && hasUnpaidBills;
  const displayStatus = isExpired ? 'expired' : (profile.status === 'expired' ? 'active' : (profile.status || 'active'));

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      {hasOverdueBills && !isSuspended && (
        <div className="bg-rose-600 text-white py-3 px-4 text-center font-black text-[10px] uppercase tracking-widest flex flex-wrap items-center justify-center gap-3 animate-pulse shadow-xl">
          <AlertCircle className="w-4 h-4 text-white" />
          Attention: You have overdue bills. Please clear your balance to avoid service interruption.
          <AlertCircle className="w-4 h-4 text-white" />
        </div>
      )}
      {/* Premium Gradient Header */}
      <div className={cn(
        "header-gradient pt-16 pb-16 px-4 sm:px-8 text-white relative overflow-hidden md:rounded-b-[2.5rem] transition-all",
        isSuspended && "from-rose-600 to-rose-800",
        isExpired && "from-amber-500 to-amber-700"
      )}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto relative z-10 gap-6">
          <div className="flex flex-col">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-1">MR NETWORK // Customer Portal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome, {headlineName}</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              Membership ID: <span className="text-white font-bold opacity-100">{profile.uid?.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isSuspended ? "bg-rose-500/20 text-rose-200" : 
                isExpired ? "bg-amber-500/20 text-amber-200" : 
                "bg-indigo-500/20 text-indigo-400"
              )}>
                {isSuspended ? <AlertCircle className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[11px] text-white/60 font-bold uppercase tracking-wider mb-0.5">Connection Status</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse shadow-lg",
                    displayStatus === 'active' ? "bg-emerald-400 shadow-emerald-400/50" : 
                    isSuspended ? "bg-rose-400 shadow-rose-400/50" : 
                    "bg-amber-400 shadow-amber-400/50"
                  )} />
                  <p className="text-sm font-bold text-white tracking-wide uppercase">{displayStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent opacity-50" />
      </div>

      <div className="px-4 sm:px-8 pt-6 max-w-7xl mx-auto w-full relative z-20 space-y-8">
        {/* Visible Search Bar */}
        <div className="relative group w-full mb-4">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 group-focus-within:border-indigo-100 transition-all shadow-sm">
            <Search className="w-5 h-5" />
          </div>
          <Input
            placeholder="Search packages, bills, payments or status..."
            className="h-16 pl-16 pr-14 text-sm font-bold border-none bg-white shadow-xl focus:shadow-2xl focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-[1.5rem]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {searchTerm && (
          <Card className="border-slate-100 bg-white shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-black text-slate-900 uppercase tracking-tight">Main Search</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Customer portal ke all functions aur records
                  </CardDescription>
                </div>
                <Badge className="w-fit border-none bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                  {globalSearchResults.length} Results
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {globalSearchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {globalSearchResults.map((result) => (
                    <button
                      key={result.key}
                      type="button"
                      onClick={result.action}
                      className="group flex min-h-[84px] items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left transition-all hover:border-indigo-100 hover:bg-indigo-50/70"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white">
                        {result.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mb-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                          {result.section}
                        </span>
                        <span className="block truncate text-sm font-black text-slate-900">{result.title}</span>
                        <span className="block truncate text-[11px] font-semibold text-slate-500">{result.description}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                  <Search className="mb-3 h-9 w-9 text-slate-200" />
                  <p className="text-sm font-black text-slate-700">No result found</p>
                  <p className="mt-1 max-w-md text-xs font-medium text-slate-400">
                    Plan, bill, payment, support, complaint, security, phone, status ya ticket keyword se search karein.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Urgent Status Banner for Suspended/Expired */}
        {(isSuspended || isExpired) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center gap-6 border-b-4",
              isSuspended 
                ? "bg-rose-50 border-rose-600 text-rose-900" 
                : "bg-amber-50 border-amber-500 text-amber-900"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg animate-bounce",
              isSuspended ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
            )}>
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">
                {isSuspended ? "Internet Service Suspended" : "Subscription Expired"}
              </h3>
              <p className="text-sm font-bold opacity-70 mt-1 uppercase tracking-widest">
                {isSuspended 
                  ? "Your account has been restricted. Please contact support to reactivate your line."
                  : "Your package has expired. Please recharge your wallet to resume high-speed connectivity."}
              </p>
            </div>
            <Button 
              className={cn(
                "rounded-xl h-14 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-95 shrink-0",
                isSuspended ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
              )}
              onClick={() => window.open(`https://wa.me/${supportNumber}`, '_blank')}
            >
               Request Reactivation
            </Button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", isSuspended && "opacity-60 blur-[1px] pointer-events-none")}>
          {/* Account Status Card - Now with Dialog */}
          <Dialog>
            <DialogTrigger asChild nativeButton={false}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account Status</CardTitle>
                    <Shield className="h-4 w-4 text-indigo-600/40 group-hover:text-indigo-600 transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-slate-900 uppercase">
                      {searchTerm && displayStatus.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                         <span className="bg-yellow-200">{displayStatus}</span>
                      ) : (
                        displayStatus || 'Verified'
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full", displayStatus === 'active' ? "bg-emerald-500" : "bg-indigo-600")} />
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">ID: {profile.uid?.slice(-6) || 'N/A'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-2xl border-slate-100 p-0 overflow-hidden text-slate-900">
              <div className="bg-indigo-600 p-8 text-white relative">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold tracking-tight">Account Intelligence</DialogTitle>
                  <DialogDescription className="text-white/60 text-xs font-medium">Detailed secure profile overview</DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <Badge className={cn("capitalize font-bold border-none", displayStatus === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600")}>{displayStatus}</Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                    <p className="text-xs font-extrabold text-slate-700">{formatDate(profile.createdAt) || 'May 2024'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Linked Mobile</p>
                      <p className="text-xs font-bold text-slate-700">{customerPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full cursor-pointer" onClick={() => navigate('/packages')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</CardTitle>
                <Package className="h-4 w-4 text-indigo-600/40 group-hover:text-indigo-600 transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900 truncate">
                  {profile.packageName || assignedPackage?.name || (
                    <span className="text-rose-500 font-bold text-xs uppercase tracking-widest">No plan assigned yet.</span>
                  )}
                </div>
                {!profile.packageName && !assignedPackage?.name && (
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Please contact admin for plan activation.</p>
                )}
                {(profile.packagePrice || assignedPackage?.price) && (
                  <p className="text-[11px] font-bold text-emerald-600 uppercase mt-1">Rs. {profile.packagePrice || assignedPackage?.price} / Monthly</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", displayStatus === 'active' ? "bg-emerald-500" : "bg-rose-500")} />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {profile.packageSpeed || assignedPackage?.speed || (displayStatus ? `Status: ${displayStatus}` : 'Pending assignment')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group h-full cursor-pointer flex flex-col" onClick={() => navigate('/payments')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Support Contact</CardTitle>
                <Phone className="h-4 w-4 text-indigo-600/40 group-hover:text-indigo-600 transition-colors" />
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="text-xl font-bold text-slate-900">{supportNumber}</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-9 text-[11px] font-bold gap-2"
                    onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${supportNumber}`, '_blank'); }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-lg h-9 text-[11px] font-bold gap-2 border-slate-200 text-slate-600"
                    onClick={(e) => { e.stopPropagation(); window.open(`tel:${supportNumber}`); }}
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className={cn(
              "shadow-lg rounded-2xl overflow-hidden hover:opacity-95 transition-all text-white border-none h-full cursor-pointer",
              currentBill?.status === 'unpaid' && new Date(currentBill.dueDate) < now ? "bg-rose-600 shadow-rose-600/20" :
              currentBill?.status === 'unpaid' ? "bg-rose-500 shadow-rose-500/20" : "bg-indigo-600 shadow-indigo-600/20"
            )} onClick={() => navigate('/payments')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
                  {currentBill?.status === 'unpaid' && new Date(currentBill.dueDate) < now ? 'OVERDUE BALANCE' : 
                   currentBill?.status === 'unpaid' ? 'Pending Balance' : 'Payment Status'}
                </CardTitle>
                <CreditCard className="h-4 w-4 text-white/40" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {currentBill ? formatCurrency(currentBill.amount) : 'Rs. 0.00'}
                </div>
                <div className="mt-4">
                  {currentBill?.status === 'unpaid' ? (
                    <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded inline-flex">
                      <AlertCircle className="w-3 h-3 text-white" />
                      <p className="text-[11px] text-white font-black uppercase tracking-widest">
                        {new Date(currentBill.dueDate) < now ? 'OVERDUE SINCE: ' : 'DUE: '}
                        {formatDate(currentBill.dueDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-400/10 px-2.5 py-1 rounded inline-flex">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-widest">ACCOUNT CLEAR</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="customer-panel min-h-[320px]">
              <CardHeader className="customer-panel-header flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {searchTerm ? 'Search Results' : 'Billing History'}
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1 text-slate-400">
                    {searchTerm ? `Matching results for "${searchTerm}"` : 'Chronological transaction history'}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-white rounded-xl px-4"
                  onClick={() => navigate('/payments')}
                >
                  Full History
                </Button>
              </CardHeader>
              <CardContent className={cn("p-0 transition-all", isSuspended && "opacity-40 blur-[2px] pointer-events-none")}>
                {filteredBills.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {filteredBills.map((bill) => {
                      const isOverdue = bill.status === 'unpaid' && new Date(bill.dueDate) < now;
                      return (
                        <div key={bill.id} className={cn(
                          "p-5 flex items-center justify-between hover:bg-slate-50/70 transition-all group",
                          isOverdue && "bg-rose-50/30 hover:bg-rose-50/50"
                        )}>
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                              bill.status === 'paid' 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : isOverdue ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-200" : "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                              <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-extrabold text-slate-900">{bill.packageName || 'Monthly Bill'} - {bill.month}</p>
                                {isOverdue && <Badge className="bg-rose-600 text-white border-none text-[8px] h-4 font-black">OVERDUE</Badge>}
                              </div>
                              <p className={cn(
                                "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                                isOverdue ? "text-rose-500" : "text-slate-400"
                              )}>Due: {formatDate(bill.dueDate)}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Download invoice"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                onClick={() => {
                                  generateInvoicePDF({
                                    invoiceNumber: bill.id.slice(-8).toUpperCase(),
                                    customerName,
                                    phone: customerPhone !== 'N/A' ? customerPhone : (getPhone(bill) || 'N/A'),
                                    packageName: bill.packageName || assignedPackage?.name || 'Service',
                                    speed: profile.packageSpeed || assignedPackage?.speed || 'Standard',
                                    amount: bill.amount,
                                    dueDate: formatDate(bill.dueDate),
                                    status: isOverdue ? 'overdue' : bill.status,
                                    createdDate: formatDate(bill.createdAt || new Date())
                                  });
                                  if (addLog) addLog('Invoice Downloaded', customerName, 'customer', `Invoice #${bill.id.slice(-8)}`);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <p className={cn(
                                "text-base font-black tracking-tight",
                                isOverdue ? "text-rose-600" : "text-slate-900"
                              )}>{formatCurrency(bill.amount)}</p>
                            </div>
                            <Badge className={cn(
                              "px-3 py-1 font-bold text-[9px] uppercase tracking-widest rounded-lg border-none",
                              bill.status === 'paid' ? "bg-emerald-100 text-emerald-700" : 
                              isOverdue ? "bg-rose-600 text-white shadow-md animate-pulse" : "bg-rose-100 text-rose-700"
                            )}>
                              {isOverdue ? 'Overdue' : bill.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
                      {searchTerm ? <Search className="w-8 h-8 text-indigo-200" /> : <History className="w-8 h-8 text-indigo-200" />}
                    </div>
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                      {searchTerm ? 'No matches found' : 'Transaction Registry Empty'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-4 font-medium">
                      {searchTerm 
                        ? "Try searching with a different keyword like 'unpaid', 'month', or 'package name'." 
                        : "Your billing history will appear here once your account has activity."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="customer-panel relative group">
              <CardHeader className="customer-panel-header relative overflow-hidden">
                <CardTitle className="text-sm font-bold text-slate-800 relative z-10 flex items-center gap-3 text-indigo-700 uppercase tracking-widest text-[10px]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <User className="w-4 h-4" />
                  </span>
                  Account Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="customer-panel-body">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Member Name</label>
                    <p className="text-slate-900 font-extrabold text-base leading-tight">{customerName}</p>
                    <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Electronic Mail</label>
                    <p className="text-slate-900 font-semibold text-sm break-all">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Mobile Number</label>
                    <p className="text-slate-900 font-semibold text-sm">{customerPhone}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1.5">Access Level</label>
                    <div className="customer-info-box flex items-center gap-3 bg-indigo-50 border-indigo-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-600/40 animate-pulse" />
                      <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.1em] leading-none">{profile.role}</p>
                    </div>
                  </div>
                  <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between h-11 rounded-2xl border border-slate-200 bg-white px-5 hover:bg-indigo-50 hover:border-indigo-100 transition-all text-slate-500 hover:text-indigo-600"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Update Security</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent showCloseButton={false} className="sm:max-w-[460px] max-h-[calc(100vh-1.5rem)] rounded-[24px] border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/20 overflow-hidden">
                      <DialogHeader className="bg-slate-950 px-5 py-3 text-white">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-950/30">
                            <Shield className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <DialogTitle className="text-sm font-black uppercase tracking-wide text-white">Update Security</DialogTitle>
                            <DialogDescription className="mt-0.5 text-[10px] font-medium leading-tight text-slate-300">
                          App ke andar apna password secure tareeqe se change karein.
                            </DialogDescription>
                          </div>
                          </div>
                          <DialogClose asChild>
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0 rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogHeader>
                      <div className="space-y-3 bg-white px-5 py-3.5">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wide">Current Password</label>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(event) => setCurrentPassword(event.target.value)}
                              placeholder="Current password"
                              className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                              onClick={() => setShowCurrentPassword((value) => !value)}
                              title={showCurrentPassword ? 'Hide password' : 'Show password'}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wide">New Strong Password</label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(event) => setNewPassword(event.target.value)}
                              placeholder="New strong password"
                              className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                              onClick={() => setShowNewPassword((value) => !value)}
                              title={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {passwordChecks.map((check) => (
                            <div
                              key={check.label}
                              className={cn(
                                "flex min-h-8 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-normal transition-colors",
                                check.passed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
                              )}
                            >
                              <CheckCircle2 className={cn("w-3 h-3 shrink-0", check.passed ? "text-emerald-500" : "text-slate-300")} />
                              <span className="leading-tight">{check.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wide">Confirm Password</label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              placeholder="Confirm new password"
                              className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                              onClick={() => setShowConfirmPassword((value) => !value)}
                              title={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-[11px] font-bold text-rose-500">Password match nahi kar raha.</p>
                          )}
                        </div>
                        <Button
                          className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                          onClick={handleUpdateSecurity}
                          disabled={isUpdatingSecurity || !currentPassword || !passwordStatus.isStrong || newPassword !== confirmPassword}
                        >
                          {isUpdatingSecurity ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card className="customer-panel relative group">
              <CardHeader className="customer-panel-header relative overflow-hidden">
                <CardTitle className="text-sm font-bold text-slate-800 relative z-10 flex items-center justify-between text-indigo-700 uppercase tracking-widest text-[10px]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    Support Tickets
                  </div>
                  <Badge className="bg-indigo-600 text-white border-none text-[8px] h-5 min-w-5 justify-center rounded-full font-black">{userTickets.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="customer-panel-body">
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white h-11 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 transition-all shadow-lg shadow-indigo-600/20">
                        <MessageCircle className="w-4 h-4" /> 
                        New Complaint
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                       <div className="bg-slate-900 p-8 text-white">
                         <h3 className="text-xl font-black uppercase tracking-tight mb-1">Submit Complaint</h3>
                         <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Technical & Support Desk</p>
                       </div>
                       <div className="p-8 space-y-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Category</label>
                           <select 
                            value={ticketType}
                            onChange={(e) => setTicketType(e.target.value)}
                            className="w-full h-14 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           >
                             <option>Slow Internet</option>
                             <option>Connection Outage</option>
                             <option>Billing Issue</option>
                             <option>Login/Router Issues</option>
                             <option>Package Change Request</option>
                             <option>Other</option>
                           </select>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                           <div className="flex gap-2">
                              {['low', 'medium', 'high'].map(p => (
                                <button
                                  key={p}
                                  onClick={() => setTicketPriority(p)}
                                  className={cn(
                                    "flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    ticketPriority === p ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                  )}
                                >
                                  {p}
                                </button>
                              ))}
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Describe Message</label>
                           <textarea
                             value={ticketMessage}
                             onChange={(e) => setTicketMessage(e.target.value)}
                             placeholder="Provide details about your issue..."
                             className="w-full h-32 p-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
                           />
                         </div>
                         <Button 
                           onClick={handleCreateTicket}
                           disabled={isSubmittingTicket}
                           className="w-full bg-slate-900 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                         >
                           {isSubmittingTicket ? "Submitting..." : "Submit Support Ticket"}
                         </Button>
                       </div>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
                    {userTickets.length > 0 ? (
                      userTickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 group/ticket hover:bg-indigo-50/50 hover:border-indigo-100 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none",
                              ticket.status === 'resolved' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
                            )}>
                              {ticket.status}
                            </Badge>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{formatDate(ticket.createdAt)}</span>
                          </div>
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1">{ticket.issueType}</p>
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-2 italic">"{ticket.message}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No ticket history</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
