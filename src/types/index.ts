export type UserStatus = 'active' | 'expired' | 'suspended' | 'pending' | 'rejected';

export interface ISPUser {
  id: string;
  name: string;
  pppoeUsername: string;
  pppoePassword?: string;
  macAddress?: string;
  onuDetails?: string;
  address: string;
  whatsapp: string;
  packageId: string;
  packageName?: string;
  packageSpeed?: string;
  packagePrice?: number;
  expiryDate: string; // ISO string
  status: UserStatus;
  createdAt: string;
  balance: number;
  walletBalance?: number;
}

export interface ISPPackage {
  id: string;
  name: string;
  packageName?: string;
  speed: string; // e.g. "10 Mbps"
  price: number;
  duration?: 'monthly';
  tax: number;
  validity: number; // in days
  uploadSpeed: string;
  downloadSpeed: string;
  enabled: boolean;
  status?: 'active' | 'inactive';
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'easypaisa' | 'jazzcash' | 'bank' | 'cash';
  date: string;
  reference?: string;
  type: 'in' | 'out';
  category: 'subscription' | 'expense' | 'other';
}

export interface RequestTicket {
  id: string;
  userId: string;
  userName: string;
  type: 'new_connection' | 'complaint' | 'speed_issue' | 'router_issue' | 'package_change';
  description: string;
  status: 'pending' | 'assigned' | 'resolved' | 'reopened';
  technician?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treasury {
  balance: number;
  todayIn: number;
  todayOut: number;
  monthOut: number;
  monthlyGrowth: number;
}
