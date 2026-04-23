export type UserStatus = 'active' | 'expired' | 'suspended';

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
  expiryDate: string; // ISO string
  status: UserStatus;
  createdAt: string;
  balance: number;
}

export interface ISPPackage {
  id: string;
  name: string;
  speed: string; // e.g. "10 Mbps"
  price: number;
  tax: number;
  validity: number; // in days
  uploadSpeed: string;
  downloadSpeed: string;
  enabled: boolean;
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
