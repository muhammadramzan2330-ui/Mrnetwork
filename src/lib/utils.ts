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

export function downloadCSV(filename: string, headers: string[], data: any[][]) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      row.map(cell => {
        const str = String(cell ?? '');
        // Escape quotes and wrap in quotes if contains comma or quote
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
