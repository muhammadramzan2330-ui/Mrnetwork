import React, { useMemo, useState } from 'react';
import { Calendar, Download, Plus, ReceiptText, Search, Trash2, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useSystem } from '../contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn, downloadCSV, formatDate } from '@/lib/utils';

const categories = [
  { value: 'bandwidth', label: 'Internet/Bandwidth' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'salary', label: 'Salary' },
  { value: 'equipment', label: 'Router/Cable/Equipment' },
  { value: 'rent', label: 'Rent' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

const initialForm = {
  title: '',
  amount: '',
  category: 'bandwidth',
  vendor: '',
  paymentMethod: 'cash',
  invoiceNumber: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

const getDate = (value: any) => value?.seconds ? new Date(value.seconds * 1000) : new Date(value);

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, loading } = useSystem();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const monthExpenses = useMemo(() => expenses.filter((expense: any) => {
    const date = getDate(expense.date || expense.createdAt);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 7) === selectedMonth;
  }), [expenses, selectedMonth]);

  const filteredExpenses = monthExpenses.filter((expense: any) => {
    const term = search.toLowerCase();
    return [expense.title, expense.vendor, expense.category, expense.invoiceNumber]
      .some(value => String(value || '').toLowerCase().includes(term));
  });

  const monthlyTotal = monthExpenses.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);
  const categoryTotals = categories.map(category => ({
    ...category,
    total: monthExpenses
      .filter((expense: any) => expense.category === category.value)
      .reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0),
  })).filter(category => category.total > 0).sort((a, b) => b.total - a.total);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addExpense({ ...form, amount: Number(form.amount) });
      setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) });
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense: any) => {
    if (!window.confirm(`Delete "${expense.title}" expense and reverse Rs. ${Number(expense.amount).toLocaleString()} from ledger?`)) return;
    await deleteExpense(expense.id);
  };

  const exportExpenses = () => {
    downloadCSV(
      `MR_NETWORK_Expenses_${selectedMonth}`,
      ['Date', 'Title', 'Category', 'Vendor', 'Payment Method', 'Invoice', 'Amount', 'Notes'],
      monthExpenses.map((expense: any) => [
        formatDate(expense.date),
        expense.title,
        expense.category,
        expense.vendor || '-',
        expense.paymentMethod,
        expense.invoiceNumber || '-',
        expense.amount,
        expense.notes || '-',
      ])
    );
    toast.success(`${monthExpenses.length} expenses exported`);
  };

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">MR Network Accounts</p>
          <h1 className="mt-2 text-2xl font-black">Purchases & Expenses</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">Bandwidth, electricity, salary, equipment aur tamam office kharchay yahan record karein.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 rounded-xl bg-blue-600 px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-slate-900 sm:max-w-2xl">
            <DialogHeader><DialogTitle>Record Purchase / Expense</DialogTitle></DialogHeader>
            <div className="grid gap-5 py-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Expense title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Monthly bandwidth bill" />
              </div>
              <div className="space-y-2">
                <Label>Amount (Rs.)</Label>
                <Input type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Payment method</Label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank">Bank</option>
                  <option value="credit">Credit / Unpaid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Vendor / Supplier</Label>
                <Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="Supplier name" />
              </div>
              <div className="space-y-2">
                <Label>Invoice number</Label>
                <Input value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="Optional" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Purchase details" />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={saving || !form.title || Number(form.amount) <= 0} className="h-12 w-full bg-slate-950 font-black uppercase tracking-widest text-white">
              {saving ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-100 bg-white p-5">
          <TrendingDown className="mb-4 h-6 w-6 text-rose-500" />
          <p className="text-3xl font-black text-slate-950">Rs. {monthlyTotal.toLocaleString()}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Expenses</p>
        </Card>
        <Card className="rounded-2xl border-slate-100 bg-white p-5">
          <ReceiptText className="mb-4 h-6 w-6 text-blue-500" />
          <p className="text-3xl font-black text-slate-950">{monthExpenses.length}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Entries</p>
        </Card>
        <Card className="rounded-2xl border-slate-100 bg-white p-5">
          <Wallet className="mb-4 h-6 w-6 text-amber-500" />
          <p className="truncate text-xl font-black text-slate-950">{categoryTotals[0]?.label || 'No expense'}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Largest Category</p>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, supplier, invoice..." />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
          </div>
          <Button variant="outline" onClick={exportExpenses}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Expense</th><th className="px-5 py-4">Supplier</th><th className="px-5 py-4">Method</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">{formatDate(expense.date)}</td>
                  <td className="px-5 py-4"><p className="font-black text-slate-900">{expense.title}</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{categories.find(c => c.value === expense.category)?.label || expense.category}</p></td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">{expense.vendor || '-'}</td>
                  <td className="px-5 py-4 text-xs font-black uppercase text-slate-500">{expense.paymentMethod}</td>
                  <td className="px-5 py-4 text-right text-base font-black text-rose-600">Rs. {Number(expense.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete(expense)} className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredExpenses.length === 0 && <div className="p-12 text-center text-sm font-semibold text-slate-400">Is month ke liye koi expense record nahi hai.</div>}
      </section>
    </div>
  );
}
