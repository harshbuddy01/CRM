'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Receipt, Plus, Trash2, Loader2, X, Check, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORIES = ['travel', 'office', 'salary', 'marketing', 'vendor', 'misc'];
const CAT_COLORS: Record<string, string> = { travel: 'bg-blue-100 text-blue-700', office: 'bg-purple-100 text-purple-700', salary: 'bg-green-100 text-green-700', marketing: 'bg-orange-100 text-orange-700', vendor: 'bg-red-100 text-red-700', misc: 'bg-gray-100 text-gray-600' };

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', catFilter, fromDate, toDate],
    queryFn: () => api.get('/finance/expenses', { params: { category: catFilter || undefined, from: fromDate || undefined, to: toDate || undefined } }).then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/expenses/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Deleted'); },
  });

  const totalAmt = (data?.items || []).reduce((s: number, e: any) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm">Track all business expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Record Expense</Button>
      </div>

      {/* Summary Card */}
      <div className="border rounded-xl p-5 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Expenses</p>
            <p className="text-2xl font-bold text-red-700">₹{totalAmt.toLocaleString('en-IN')}</p>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">{data?.total || 0} records</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <select className="h-9 px-3 border rounded-md text-sm bg-background" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All</option>{CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" className="h-9" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" className="h-9" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
      </div>

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['expenses'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !data?.items?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground"><Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No expenses recorded</p></div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
              <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Vendor</th><th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">By</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y">{data.items.map((e: any) => (
              <tr key={e.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLORS[e.category] || 'bg-gray-100'}`}>{e.category}</span></td>
                <td className="px-4 py-3">{e.vendor || '-'}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">{e.description || '-'}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.user?.name}</td>
                <td className="px-4 py-3"><button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(e.id); }} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpenseForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ amount: '', category: 'misc', vendor: '', description: '', expenseDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/finance/expenses', form); toast.success('Expense recorded!'); onSaved(); onClose(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Record Expense</h3><button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
          <select className="w-full h-10 px-3 border rounded-md text-sm bg-background" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label><Input type="date" value={form.expenseDate} onChange={e => setForm({...form, expenseDate: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Vendor / Paid To</Label><Input value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} /></div>
        <div className="space-y-1.5 md:col-span-2"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Save</Button>
      </div>
    </form>
  );
}
