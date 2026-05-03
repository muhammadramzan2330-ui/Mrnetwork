import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: any, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '-';
  
  let validDate: Date;
  
  if (date?.seconds && typeof date.seconds === 'number') {
    // Firestore Timestamp
    validDate = new Date(date.seconds * 1000);
  } else if (date instanceof Date) {
    validDate = date;
  } else {
    // String or Number
    validDate = new Date(date);
  }

  if (isNaN(validDate.getTime())) return '-';
  
  return validDate.toLocaleDateString(undefined, options);
}

export function formatTime(date: any): string {
  if (!date) return '-';
  
  let validDate: Date;
  
  if (date?.seconds && typeof date.seconds === 'number') {
    validDate = new Date(date.seconds * 1000);
  } else if (date instanceof Date) {
    validDate = date;
  } else {
    validDate = new Date(date);
  }

  if (isNaN(validDate.getTime())) return '-';
  
  return validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0
  }).format(amount);
}
