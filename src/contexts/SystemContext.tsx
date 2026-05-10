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
  orderBy
} from 'firebase/firestore';
import { toast } from 'sonner';

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
  sendSMS: (userId: string, phone: string, message: string, type: 'reminder' | 'expiry_alert' | 'payment_confirmation') => Promise<void>;
  checkExpiries: () => Promise<void>;
  updateSettings: (newSettings: any) => Promise<void>;
  addTicket: (ticket: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
}

const SystemContext = createContext<(SystemState & SystemActions) | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
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
    const unsubUsers = subscribeToCollection('user', (data) => setState(prev => ({ ...prev, users: data })));
    const unsubPayments = subscribeToCollection('payments', (data) => setState(prev => ({ ...prev, payments: data })), [orderBy('date', 'desc')]);
    const unsubBills = subscribeToCollection('bills', (data) => setState(prev => ({ ...prev, bills: data })), [orderBy('dueDate', 'desc')]);
    const unsubSubdealers = subscribeToCollection('subdealers', (data) => setState(prev => ({ ...prev, subdealers: data })));
    const unsubPackages = subscribeToCollection('packages', (data) => setState(prev => ({ ...prev, packages: data })));
    const unsubRequests = subscribeToCollection('requests', (data) => setState(prev => ({ ...prev, requests: data })), [orderBy('createdAt', 'desc')]);
    const unsubTickets = subscribeToCollection('tickets', (data) => setState(prev => ({ ...prev, tickets: data })), [orderBy('createdAt', 'desc')]);
    const unsubLogs = subscribeToCollection('logs', (data) => setState(prev => ({ ...prev, logs: data })), [orderBy('date', 'desc')]);
    const unsubNotifs = subscribeToCollection('notifications', (data) => setState(prev => ({ ...prev, notifications: data })), [orderBy('date', 'desc')]);
    const unsubSettings = subscribeToCollection('settings', (data) => setState(prev => ({ ...prev, settings: data[0] })));
    const unsubTreasury = subscribeToCollection('treasury', (data) => {
      setState(prev => ({ ...prev, treasury: data[0] || null, loading: false }));
    });

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
  }, []);

  // Trigger monthly bill generation on mount once loading is complete
  useEffect(() => {
    if (!state.loading && state.users.length > 0) {
      generateMonthlyBills();
    }
  }, [state.loading, state.users.length]);

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

  const sendSMS = async (userId: string, phone: string, message: string, type: any) => {
    try {
      await addDocument('notifications', {
        userId,
        phone,
        message,
        type,
        status: 'sent',
        date: new Date().toISOString()
      });
      // In a real app, integrate with an SMS gateway like Twilio or Nexmo here
      console.log(`[SMS MOCK] To: ${phone} | ${message}`);
    } catch (e) {
      console.error('Notification failed', e);
    }
  };

  const checkExpiries = async () => {
    const now = new Date();
    
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

            // Shares logic (Default to 60/40 or user specified)
            const subdealerShare = pkg.subdealerShare || (pkg.price * 0.4);
            const adminShare = pkg.price - subdealerShare;

            if (user.subdealerId) {
              transaction.update(doc(db, 'subdealers', user.subdealerId), {
                walletBalance: increment(subdealerShare),
                totalEarnings: increment(subdealerShare)
              });
            }

            transaction.update(treasuryRef, {
              balance: increment(adminShare),
              todayIn: increment(adminShare)
            });

            const payRef = doc(collection(db, 'payments'));
            transaction.set(payRef, {
              userId: user.id,
              userName: user.name,
              amount: pkg.price,
              method: 'wallet',
              status: 'approved',
              type: 'in',
              category: 'subscription',
              date: Timestamp.now()
            });
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
      // 1. Prevent duplicate Transaction IDs
      if (paymentData.reference) {
        const isDuplicate = state.payments.some(p => p.reference === paymentData.reference && p.status !== 'rejected');
        if (isDuplicate) {
          toast.error("Duplicate Transaction ID detected. Payment rejected.");
          return;
        }
      }

      // 2. Validate amount
      if (paymentData.amount <= 0) {
        toast.error("Invalid payment amount");
        return;
      }

      await addDocument('payments', {
        ...paymentData,
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

        const pkg = state.packages.find(p => p.id === user.packageId);
        
        // Split logic from requirement: subdealer 590, admin 910 for 1500 (or ratio)
        let subdealerShare = 0;
        let adminShare = payment.amount;

        if (pkg && pkg.price > 0) {
          if (pkg.subdealerShare && pkg.adminShare) {
            subdealerShare = pkg.subdealerShare;
            adminShare = pkg.adminShare;
          } else {
            // Default 40/60 if not specified
            subdealerShare = payment.amount * 0.4;
            adminShare = payment.amount - subdealerShare;
          }
        }

        // Update balances
        transaction.update(doc(db, 'payments', paymentId), {
          status: 'approved',
          approvedAt: Timestamp.now()
        });

        transaction.update(doc(db, 'user', payment.userId), {
          walletBalance: increment(payment.amount),
          updatedAt: Timestamp.now()
        });

        if (user.subdealerId && user.subdealerId !== 'admin') {
          transaction.update(doc(db, 'subdealers', user.subdealerId), {
            walletBalance: increment(subdealerShare),
            totalEarnings: increment(subdealerShare)
          });
          
          const commissionRef = doc(collection(db, 'commissions'));
          transaction.set(commissionRef, {
            paymentId,
            subdealerId: user.subdealerId,
            amount: subdealerShare,
            date: Timestamp.now()
          });
        } else {
          adminShare = payment.amount; // No subdealer, admin takes all
        }

        transaction.update(doc(db, 'treasury', 'current'), {
          balance: increment(adminShare),
          todayIn: increment(adminShare)
        });
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
        const treasuryRef = doc(db, 'treasury', 'current');
        const paymentRef = doc(collection(db, 'payments'));

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
          reference: `BILL-${billId.slice(-6).toUpperCase()}`
        });

        transaction.update(treasuryRef, {
          balance: increment(bill.amount),
          todayIn: increment(bill.amount)
        });
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
