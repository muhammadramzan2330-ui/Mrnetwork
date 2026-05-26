import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  db 
} from '../services/firebase';
import { 
  collection, 
  doc, 
  runTransaction, 
  Timestamp,
  increment,
  orderBy,
  where
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

interface SystemState {
  users: any[];
  payments: any[];
  bills: any[];
  subdealers: any[];
  packages: any[];
  requests: any[];
  tickets: any[];
  logs: any[];
  notifications: any[];
  settings: any;
  treasury: any;
  loading: boolean;
}

interface SystemActions {
  recordPayment: (payment: any) => Promise<void>;
  approvePayment: (paymentId: string) => Promise<void>;
  rejectPayment: (paymentId: string) => Promise<void>;
  requestWithdrawal: (amount: number, details: string) => Promise<void>;
  adminWithdrawal: (amount: number, details: string) => Promise<void>;
  processWithdrawal: (requestId: string, approved: boolean) => Promise<void>;
  markBillAsPaid: (billId: string, method?: string) => Promise<void>;
  generateManualBill: (userId: string) => Promise<void>;
  generateMonthlyBills: () => Promise<void>;
  addLog: (action: string, target: string, type: string, details?: string) => Promise<void>;
  sendSMS: (userId: string, phone: string, message: string, type: 'reminder' | 'expiry_alert' | 'payment_confirmation', meta?: any) => Promise<void>;
  checkExpiries: () => Promise<void>;
  updateSettings: (newSettings: any) => Promise<void>;
  addTicket: (ticket: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
}

const SystemContext = createContext<(SystemState & SystemActions) | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, user, profile } = useAuth();
  const [state, setState] = useState<SystemState>({
    users: [],
    payments: [],
    bills: [],
    subdealers: [],
    packages: [],
    requests: [],
    tickets: [],
    logs: [],
    notifications: [],
    settings: null,
    treasury: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const errorHandler = (collectionPath: string) => (error: any) => {
      console.warn(`System subscription error [${collectionPath}]:`, error);
      if (collectionPath === 'treasury') {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    // Subscriptions for internal ISP logic
    const unsubPackages = subscribeToCollection('packages', (data) => setState(prev => ({ ...prev, packages: data })), [], errorHandler('packages'));
    
    // Admin-only global subscriptions
    let unsubUsers = () => {};
    let unsubPayments = () => {};
    let unsubBills = () => {};
    let unsubSubdealers = () => {};
    let unsubRequests = () => {};
    let unsubTickets = () => {};
    let unsubLogs = () => {};
    let unsubNotifs = () => {};
    let unsubSettings = () => {};
    let unsubTreasury = () => {};

    if (isAdmin) {
      unsubUsers = subscribeToCollection('user', (data) => setState(prev => ({ ...prev, users: data })), [], errorHandler('user'));
      unsubPayments = subscribeToCollection('payments', (data) => setState(prev => ({ ...prev, payments: data })), [orderBy('date', 'desc')], errorHandler('payments'));
      unsubBills = subscribeToCollection('bills', (data) => setState(prev => ({ ...prev, bills: data })), [orderBy('dueDate', 'desc')], errorHandler('bills'));
      unsubSubdealers = subscribeToCollection('subdealers', (data) => setState(prev => ({ ...prev, subdealers: data })), [], errorHandler('subdealers'));
      unsubRequests = subscribeToCollection('requests', (data) => setState(prev => ({ ...prev, requests: data })), [orderBy('createdAt', 'desc')], errorHandler('requests'));
      unsubTickets = subscribeToCollection('tickets', (data) => setState(prev => ({ ...prev, tickets: data })), [orderBy('createdAt', 'desc')], errorHandler('tickets'));
      unsubLogs = subscribeToCollection('logs', (data) => setState(prev => ({ ...prev, logs: data })), [orderBy('date', 'desc')], errorHandler('logs'));
      unsubNotifs = subscribeToCollection('notifications', (data) => setState(prev => ({ ...prev, notifications: data })), [orderBy('date', 'desc')], errorHandler('notifications'));
      unsubSettings = subscribeToCollection('settings', (data) => setState(prev => ({ ...prev, settings: data[0] })), [], errorHandler('settings'));
      unsubTreasury = subscribeToCollection('treasury', (data) => {
        setState(prev => ({ ...prev, treasury: data[0] || null, loading: false }));
      }, [], errorHandler('treasury'));
    } else {
      // For non-admins, subscribe to their OWN data
      // Remove orderBy when using where to avoid 400 error (requires composite index)
      // We will sort client-side by modifying the state update
      const ownerIds = Array.from(new Set([user.uid, profile?.id].filter(Boolean)));
      const ownerFilter = ownerIds.length > 1 ? where('userId', 'in', ownerIds) : where('userId', '==', user.uid);

      unsubUsers = subscribeToCollection('user', (data) => setState(prev => ({ ...prev, users: data })), [where('uid', '==', user.uid)], errorHandler('user'));
      unsubPayments = subscribeToCollection('payments', (data: any[]) => setState(prev => ({ 
        ...prev, 
        payments: [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
      })), [ownerFilter], errorHandler('payments'));
      
      unsubBills = subscribeToCollection('bills', (data: any[]) => setState(prev => ({ 
        ...prev, 
        bills: [...data].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()) 
      })), [ownerFilter], errorHandler('bills'));
      
      unsubRequests = subscribeToCollection('requests', (data: any[]) => setState(prev => ({ 
        ...prev, 
        requests: [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
      })), [ownerFilter], errorHandler('requests'));
      
      unsubTickets = subscribeToCollection('tickets', (data: any[]) => setState(prev => ({ 
        ...prev, 
        tickets: [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
      })), [ownerFilter], errorHandler('tickets'));
      
      unsubNotifs = subscribeToCollection('notifications', (data: any[]) => setState(prev => ({ 
        ...prev, 
        notifications: [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
      })), [ownerFilter], errorHandler('notifications'));
      
      // Treasury and Settings are not needed for customers but treasury loaded check should pass
      setState(prev => ({ ...prev, loading: false }));
    }

    // Fallback: If treasury isn't loading after 5 seconds, stop blocking
    const loadingTimeout = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.warn("System loading timed out - forcing start");
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 5000);

    return () => {
      clearTimeout(loadingTimeout);
      unsubUsers();
      unsubPayments();
      unsubBills();
      unsubSubdealers();
      unsubPackages();
      unsubRequests();
      unsubTickets();
      unsubLogs();
      unsubNotifs();
      unsubSettings();
      unsubTreasury();
    };
  }, [user, profile?.id, isAdmin]);

  // Trigger monthly bill generation on mount once loading is complete
  useEffect(() => {
    if (isAdmin && !state.loading && state.users.length > 0) {
      generateMonthlyBills();
    }
  }, [isAdmin, state.loading, state.users.length]);

  const addLog = async (action: string, target: string, type: string, details?: string) => {
    try {
      // Basic security metadata simulation
      const metadata = {
        ipAddress: "124.23.45.167", // Mock IP
        userAgent: navigator.userAgent,
        date: new Date().toISOString()
      };

      await addDocument('logs', {
        action,
        target,
        type,
        details: details || '',
        ...metadata
      });
    } catch (e) {
      console.error('Logging failed', e);
    }
  };

  const normalizeReference = (reference: string = '') => reference.trim().replace(/\s+/g, '').toUpperCase();

  const getRevenueSplit = (amount: number, customer: any, pkg: any) => {
    const hasSubdealer = !!customer?.subdealerId && customer.subdealerId !== 'admin';

    if (!hasSubdealer || !pkg || amount <= 0) {
      return {
        subdealerId: null,
        subdealerShare: 0,
        adminShare: amount,
      };
    }

    const dealer = state.subdealers.find(d => d.id === customer.subdealerId);
    const packagePrice = Number(pkg.price || customer.packagePrice || amount);
    const configuredSubdealerShare = Number(pkg.subdealerShare || 0);
    const dealerRatio = dealer?.commissionType === 'percentage' && Number(dealer.commissionValue) > 0
      ? Number(dealer.commissionValue) / 100
      : 0;
    const ratio = dealerRatio || (
      packagePrice > 0 && configuredSubdealerShare > 0
        ? configuredSubdealerShare / packagePrice
        : 0.4
    );
    const subdealerShare = Math.min(amount, Math.round(amount * ratio));

    return {
      subdealerId: customer.subdealerId,
      subdealerShare,
      adminShare: amount - subdealerShare,
    };
  };

  const applyRevenueSplit = (
    transaction: any,
    customer: any,
    pkg: any,
    amount: number,
    paymentId: string,
    source: string
  ) => {
    const split = getRevenueSplit(amount, customer, pkg);

    if (split.subdealerId && split.subdealerShare > 0) {
      transaction.update(doc(db, 'subdealers', split.subdealerId), {
        walletBalance: increment(split.subdealerShare),
        totalEarnings: increment(split.subdealerShare),
        updatedAt: Timestamp.now()
      });

      const commissionRef = doc(collection(db, 'commissions'));
      transaction.set(commissionRef, {
        paymentId,
        userId: customer.id,
        userName: customer.name,
        subdealerId: split.subdealerId,
        amount: split.subdealerShare,
        source,
        status: 'credited',
        date: Timestamp.now()
      });
    }

    transaction.update(doc(db, 'treasury', 'current'), {
      balance: increment(split.adminShare),
      todayIn: increment(split.adminShare)
    });

    return split;
  };

  const sendSMS = async (userId: string, phone: string, message: string, type: any, meta: any = {}) => {
    try {
      const cleanPhone = (phone || '').toString().trim();
      if (!cleanPhone) {
        await addDocument('notifications', {
          userId,
          phone: '',
          message,
          type,
          status: 'failed',
          error: 'Customer phone number is missing',
          ...meta,
          date: new Date().toISOString()
        });
        console.warn(`[SMS FAILED] Missing phone for user ${userId}: ${message}`);
        return;
      }

      let gatewayResult: any = {
        sent: false,
        status: 'client_only'
      };

      try {
        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: cleanPhone,
            message,
            type,
            userId
          })
        });
        gatewayResult = await response.json().catch(() => ({
          sent: false,
          status: response.ok ? 'unknown_response' : 'gateway_error'
        }));
      } catch (error: any) {
        gatewayResult = {
          sent: false,
          status: 'api_unavailable',
          error: error?.message || 'SMS API unavailable'
        };
      }

      await addDocument('notifications', {
        userId,
        phone: cleanPhone,
        message,
        type,
        status: gatewayResult.sent ? 'sent' : 'queued',
        gatewayStatus: gatewayResult.status,
        gatewayError: gatewayResult.error || '',
        ...meta,
        date: new Date().toISOString()
      });

      if (gatewayResult.sent) {
        console.log(`[SMS SENT] To: ${cleanPhone} | ${message}`);
      } else {
        console.warn(`[SMS QUEUED] To: ${cleanPhone} | ${message} | ${gatewayResult.status}`);
      }
    } catch (e) {
      console.error('Notification failed', e);
    }
  };

  const checkExpiries = async () => {
    const now = new Date();
    const smsReminderEnabled = state.settings?.smsReminder !== false;
    const reminderDays = Math.max(0, Number(state.settings?.reminderDays ?? 3));
    const todayKey = now.toISOString().slice(0, 10);

    if (smsReminderEnabled && reminderDays > 0) {
      const reminderUsers = state.users.filter(u => {
        if (u.status !== 'active' || !u.expiryDate) return false;

        const expiryDate = new Date(u.expiryDate);
        if (Number.isNaN(expiryDate.getTime())) return false;

        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0 || daysUntilExpiry > reminderDays) return false;

        const alreadySentToday = state.notifications.some(n =>
          n.userId === u.id &&
          n.type === 'reminder' &&
          n.reminderFor === todayKey
        );

        return !alreadySentToday;
      });

      for (const user of reminderUsers) {
        const expiryDate = new Date(user.expiryDate);
        const daysUntilExpiry = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const phone = user.whatsapp || user.phone;
        const message = daysUntilExpiry === 0
          ? `M & NETWORK: Your internet package expires today. Please pay/recharge to keep your service active.`
          : `M & NETWORK: Your internet package will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Please pay/recharge on time.`;

        await sendSMS(user.id, phone, message, 'reminder', {
          reminderFor: todayKey,
          expiryDate: user.expiryDate,
          daysUntilExpiry
        });
        await addLog('SMS Reminder Sent', user.name, 'notification', `Expiry reminder: ${daysUntilExpiry} day(s) remaining`);
      }
    }
    
    // 1. Check for expired plans based on expiryDate
    const expiredUsersByDate = state.users.filter(u => u.status === 'active' && new Date(u.expiryDate) <= now);
    
    // 2. Check for overdue bills (Unpaid after Due Date)
    const usersWithOverdueBills = state.users.filter(u => {
      if (u.status !== 'active') return false;
      const overdueBill = state.bills.find(b => b.userId === u.id && b.status === 'unpaid' && new Date(b.dueDate) < now);
      return !!overdueBill;
    });

    // Merge unique users to process
    const usersToProcess = Array.from(new Set([...expiredUsersByDate, ...usersWithOverdueBills]));
    
    for (const user of usersToProcess) {
      const pkg = state.packages.find(p => p.id === user.packageId);
      if (!pkg) continue;

      if (user.walletBalance >= pkg.price) {
        // Auto Renew / Pay Bill logic
        try {
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'user', user.id);
            const treasuryRef = doc(db, 'treasury', 'current');
            
            // If it was an overdue bill, we should also mark that bill as paid
            const overdueBill = state.bills.find(b => b.userId === user.id && b.status === 'unpaid' && new Date(b.dueDate) < now);
            
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + (pkg.validity || 30));

            transaction.update(userRef, {
              walletBalance: increment(-pkg.price),
              expiryDate: newExpiry.toISOString(),
              status: 'active',
              billingStatus: 'paid',
              updatedAt: Timestamp.now()
            });

            if (overdueBill) {
              transaction.update(doc(db, 'bills', overdueBill.id), {
                status: 'paid',
                updatedAt: Timestamp.now()
              });
            }

            const payRef = doc(collection(db, 'payments'));
            const split = getRevenueSplit(pkg.price, user, pkg);
            transaction.set(payRef, {
              userId: user.id,
              userName: user.name,
              amount: pkg.price,
              method: 'wallet',
              status: 'approved',
              type: 'in',
              category: 'subscription',
              verificationStatus: 'auto_verified',
              subdealerId: split.subdealerId || '',
              subdealerShare: split.subdealerShare,
              adminShare: split.adminShare,
              date: Timestamp.now()
            });

            applyRevenueSplit(transaction, user, pkg, pkg.price, payRef.id, 'auto_renewal');
          });
          await addLog('Auto-Renewal/Payment', user.name, 'system', `Balance deducted: Rs. ${pkg.price} due to billing/expiry`);
          await sendSMS(user.id, user.whatsapp || user.phone, `Your service has been automatically renewed. Enjoy!`, 'payment_confirmation');
        } catch (e) {
          console.error('Auto-renew/payment failed', e);
        }
      } else {
        // Mark as expired/overdue
        await updateDocument('user', user.id, { status: 'expired' });
        await addLog('Account Expired/Overdue', user.name, 'system', 'Unpaid bill or plan expired');
        await sendSMS(user.id, user.whatsapp || user.phone, `Your service has been suspended due to non-payment or expiry. Please recharge.`, 'expiry_alert');
      }
    }
  };

  const recordPayment = async (paymentData: any) => {
    try {
      const payerUserId = paymentData.userId || profile?.id || user?.uid;
      const customer = state.users.find(u => u.id === payerUserId || u.uid === payerUserId);
      const method = (paymentData.method || '').toLowerCase();
      const amount = Number(paymentData.amount || 0);
      const reference = normalizeReference(paymentData.reference || '');

      if (!customer) {
        toast.error("Customer profile not found for this payment");
        return;
      }

      if (!isAdmin && customer.id !== profile?.id && customer.uid !== user?.uid) {
        toast.error("Security check failed: payment owner mismatch");
        return;
      }

      if (!isAdmin && method === 'cash') {
        toast.error("Cash payment can only be recorded by admin");
        return;
      }

      if (method !== 'cash' && reference.length < 6) {
        toast.error("Transaction reference is required for secure verification");
        return;
      }

      // 1. Prevent duplicate Transaction IDs
      if (reference) {
        const isDuplicate = state.payments.some(p => normalizeReference(p.reference || '') === reference && p.status !== 'rejected');
        if (isDuplicate) {
          toast.error("Duplicate Transaction ID detected. Payment rejected.");
          return;
        }
      }

      // 2. Validate amount
      if (amount <= 0) {
        toast.error("Invalid payment amount");
        return;
      }

      const unpaidBill = state.bills
        .filter(b => b.userId === customer.id && b.status === 'unpaid')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

      if (!isAdmin && unpaidBill && amount !== Number(unpaidBill.amount || 0)) {
        toast.error(`Secure payment amount must match unpaid bill: Rs. ${Number(unpaidBill.amount || 0).toLocaleString()}`);
        return;
      }

      await addDocument('payments', {
        ...paymentData,
        userId: customer.id,
        userName: customer.name,
        amount,
        method,
        reference,
        billId: unpaidBill?.id || paymentData.billId || '',
        verificationStatus: method === 'cash' ? 'admin_recorded' : 'awaiting_admin_verification',
        securityHash: `${customer.id}-${amount}-${reference || Date.now()}`,
        status: 'pending',
        date: new Date().toISOString(),
        type: 'in',
        category: 'subscription'
      });
      await addLog('Payment Recorded', paymentData.userName, 'payment', `Amount: Rs. ${paymentData.amount} | ID: ${paymentData.reference}`);
      toast.success('Your payment is submitted and awaiting approval');
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const approvePayment = async (paymentId: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const paymentDoc = await transaction.get(doc(db, 'payments', paymentId));
        if (!paymentDoc.exists()) throw new Error("Payment missing");
        const payment = paymentDoc.data();
        if (payment.status !== 'pending') throw new Error("Already processed");

        const userDoc = await transaction.get(doc(db, 'user', payment.userId));
        if (!userDoc.exists()) throw new Error("User missing");
        const user = userDoc.data();
        const customer = { id: payment.userId, ...user };

        const pkg = state.packages.find(p => p.id === user.packageId);
        const split = getRevenueSplit(payment.amount, customer, pkg);

        // Update balances
        transaction.update(doc(db, 'payments', paymentId), {
          status: 'approved',
          approvedAt: Timestamp.now(),
          verifiedBy: user?.email || 'admin',
          verificationStatus: 'verified',
          subdealerId: split.subdealerId || '',
          subdealerShare: split.subdealerShare,
          adminShare: split.adminShare
        });

        transaction.update(doc(db, 'user', payment.userId), {
          walletBalance: increment(payment.amount),
          updatedAt: Timestamp.now()
        });

        applyRevenueSplit(transaction, customer, pkg, payment.amount, paymentId, 'payment_approval');

        if (payment.billId) {
          transaction.update(doc(db, 'bills', payment.billId), {
            status: 'paid',
            paidAt: Timestamp.now(),
            paymentId,
            updatedAt: Timestamp.now()
          });
        }
      });

      await addLog('Payment Approved', paymentId, 'payment');
      toast.success('Payment approved successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const payment = state.payments.find(p => p.id === paymentId);
      if (!payment) throw new Error("Payment not found");
      if (payment.status !== 'pending') throw new Error("Only pending payments can be rejected");

      await updateDocument('payments', paymentId, { status: 'rejected' });
      await addLog('Payment Rejected', paymentId, 'payment');
      toast.info('Payment rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject');
    }
  };

  const requestWithdrawal = async (amount: number, details: string) => {
    try {
      // Simulated from current subdealer context
      // In real app, get current user ID from Auth
      const subdealerId = localStorage.getItem('subdealerId') || 'sub_1'; 
      const subdealer = state.subdealers.find(s => s.id === subdealerId);
      
      if (!subdealer) throw new Error("Subdealer context missing");
      if (amount <= 0) throw new Error("Invalid amount");
      if (subdealer.walletBalance < amount) throw new Error("Insufficient wallet balance");

      await addDocument('requests', {
        userId: subdealerId,
        userName: subdealer.name,
        type: 'withdrawal',
        amount: amount,
        description: details,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      await addLog('Withdrawal Requested', subdealer.name, 'withdrawal', `Amount: Rs. ${amount}`);
      toast.success('Withdrawal request submitted for approval');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const adminWithdrawal = async (amount: number, details: string) => {
    try {
      if (amount <= 0) throw new Error("Invalid amount");
      
      await runTransaction(db, async (transaction) => {
        const treasuryRef = doc(db, 'treasury', 'current');
        const treasury = await transaction.get(treasuryRef);
        
        if (!treasury.exists()) throw new Error("Treasury not found");
        if (treasury.data().balance < amount) throw new Error("Insufficient treasury balance");

        transaction.update(treasuryRef, {
          balance: increment(-amount),
          todayOut: increment(amount),
          monthOut: increment(amount)
        });

        const payRef = doc(collection(db, 'payments'));
        transaction.set(payRef, {
          amount,
          description: details,
          type: 'out',
          category: 'withdrawal',
          status: 'approved',
          date: Timestamp.now(),
          details: 'Admin direct withdrawal'
        });
      });

      await addLog('Admin Withdrawal', 'Treasury', 'withdrawal', `Amount: Rs. ${amount}`);
      toast.success('Withdrawal processed from treasury');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const processWithdrawal = async (requestId: string, approved: boolean) => {
    try {
      await runTransaction(db, async (transaction) => {
        const reqDoc = await transaction.get(doc(db, 'requests', requestId));
        if (!reqDoc.exists()) throw new Error("Request missing");
        const reqData = reqDoc.data();
        if (reqData.status !== 'pending') throw new Error("Already processed");

        if (approved) {
          const subdealerDoc = await transaction.get(doc(db, 'subdealers', reqData.userId));
          if (!subdealerDoc.exists()) throw new Error("Subdealer not found");
          if (subdealerDoc.data().walletBalance < reqData.amount) throw new Error("Insufficient balance");

          transaction.update(doc(db, 'subdealers', reqData.userId), {
            walletBalance: increment(-reqData.amount)
          });

          transaction.update(doc(db, 'treasury', 'current'), {
            balance: increment(-reqData.amount),
            todayOut: increment(reqData.amount)
          });

          transaction.update(doc(db, 'requests', requestId), { status: 'resolved' });
        } else {
          transaction.update(doc(db, 'requests', requestId), { status: 'rejected' });
        }
      });
      toast.success(`Withdrawal ${approved ? 'approved' : 'rejected'}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const markBillAsPaid = async (billId: string, method: string = 'cash') => {
    try {
      const bill = state.bills.find(b => b.id === billId);
      if (!bill) throw new Error("Bill not found");

      await runTransaction(db, async (transaction) => {
        const billRef = doc(db, 'bills', billId);
        const userRef = doc(db, 'user', bill.userId);
        const paymentRef = doc(collection(db, 'payments'));
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User missing");
        const customer = { id: bill.userId, ...userDoc.data() };
        const pkg = state.packages.find(p => p.id === customer.packageId);
        const split = getRevenueSplit(bill.amount, customer, pkg);

        transaction.update(billRef, { status: 'paid', updatedAt: Timestamp.now() });
        transaction.update(userRef, { billingStatus: 'paid', lastPaymentDate: Timestamp.now() });
        
        transaction.set(paymentRef, {
          userId: bill.userId,
          userName: bill.userName,
          amount: bill.amount,
          method: method,
          date: Timestamp.now(),
          type: 'in',
          category: 'subscription',
          status: 'approved',
          billId: billId,
          reference: `BILL-${billId.slice(-6).toUpperCase()}`,
          verificationStatus: 'admin_verified',
          subdealerId: split.subdealerId || '',
          subdealerShare: split.subdealerShare,
          adminShare: split.adminShare
        });

        applyRevenueSplit(transaction, customer, pkg, bill.amount, paymentRef.id, 'bill_paid');
      });

      await addLog('Bill Paid', bill.userName, 'payment', `Amount: Rs. ${bill.amount} | Month: ${bill.month}`);
      toast.success('Bill marked as paid and payment recorded');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update bill');
    }
  };

  const generateManualBill = async (userId: string) => {
    try {
      const user = state.users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");

      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const pkg = state.packages.find(p => p.id === user.packageId);
      const amount = user.planPrice || pkg?.price || 0;
      
      if (amount <= 0) throw new Error("User has no plan price or package price set");

      const dueDate = new Date(today.getFullYear(), today.getMonth(), 10);
      if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);

      await addDocument('bills', {
        userId: user.id,
        userName: user.name,
        packageName: user.packageName || pkg?.name || 'Standard Package',
        amount: amount,
        month: currentMonth,
        dueDate: dueDate.toISOString(),
        status: 'unpaid',
        createdAt: new Date().toISOString()
      });

      await updateDocument('user', user.id, { 
        billingStatus: 'unpaid',
        planPrice: amount,
        dueDate: dueDate.toISOString()
      });

      await addLog('Manual Bill Generated', user.name, 'system', `Month: ${currentMonth}`);
      toast.success(`Bill generated for ${user.name}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate bill');
    }
  };

  const generateMonthlyBills = async () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Only target active customers
    const activeCustomers = state.users.filter(u => u.status === 'active' || u.status === 'expired');
    
    for (const user of activeCustomers) {
      // Check if bill for this month already exists
      const existingBill = state.bills.find(b => b.userId === user.id && b.month === currentMonth);
      
      if (!existingBill) {
        const pkg = state.packages.find(p => p.id === user.packageId);
        const amount = user.planPrice || pkg?.price || 0;
        
        if (amount > 0) {
          // Calculate due date (e.g., 5th of current month or 30 days from now)
          // For simplicity, let's say 10th of current month
          const dueDate = new Date(today.getFullYear(), today.getMonth(), 10);
          
          try {
            await addDocument('bills', {
              userId: user.id,
              userName: user.name,
              packageName: user.packageName || pkg?.name || 'Standard Package',
              amount: amount,
              month: currentMonth,
              dueDate: dueDate.toISOString(),
              status: 'unpaid',
              createdAt: new Date().toISOString()
            });
            
            // Also update user's billing status
            await updateDocument('user', user.id, { 
              billingStatus: 'unpaid',
              planPrice: amount,
              dueDate: dueDate.toISOString()
            });
            
            console.log(`Generated bill for ${user.name} - ${currentMonth}`);
          } catch (e) {
            console.error('Failed to generate bill', e);
          }
        }
      }
    }
  };

  const updateSettings = async (newSettings: any) => {
    try {
      if (state.settings?.id) {
        await updateDocument('settings', state.settings.id, newSettings);
      } else {
        await addDocument('settings', newSettings);
      }
      toast.success('Settings updated');
    } catch (e) {
      toast.error('Failed to update settings');
    }
  };

  const addTicket = async (ticket: any) => {
    try {
      await addDocument('tickets', {
        ...ticket,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      await addLog('Ticket Created', ticket.userName, 'support', `Issue: ${ticket.issueType}`);
      toast.success('Support ticket submitted successfully');
    } catch (e) {
      toast.error('Failed to submit ticket');
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await updateDocument('tickets', ticketId, { 
        status,
        updatedAt: new Date().toISOString()
      });
      await addLog('Ticket Status Updated', ticketId, 'support', `New status: ${status}`);
      toast.success(`Ticket status updated to ${status}`);
    } catch (e) {
      toast.error('Failed to update ticket status');
    }
  };

  return (
    <SystemContext.Provider value={{ 
      ...state, 
      recordPayment, 
      approvePayment, 
      rejectPayment, 
      requestWithdrawal,
      adminWithdrawal,
      processWithdrawal, 
      addLog, 
      sendSMS, 
      checkExpiries,
      markBillAsPaid,
      generateManualBill,
      generateMonthlyBills,
      updateSettings,
      addTicket,
      updateTicketStatus
    }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
