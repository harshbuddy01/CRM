'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Receipt, Plus, Trash2, Loader2, X, Check, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Track all business expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto rounded-xl font-bold h-11 sm:h-9 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Record Expense
        </Button>
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
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block border rounded-xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-bold italic">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">By</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((e: any) => (
                <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${CAT_COLORS[e.category] || 'bg-gray-100'}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{e.vendor || '-'}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-500">{e.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase">{e.user?.name}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => { if(confirm('Delete?')) deleteMut.mutate(e.id); }} 
                      className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {data.items.map((e: any) => (
            <Card key={e.id} className="p-4 border-slate-200 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {new Date(e.expenseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{e.vendor || 'Unknown Vendor'}</h3>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${CAT_COLORS[e.category] || 'bg-gray-100'}`}>
                  {e.category}
                </span>
              </div>
              
              <div className="flex justify-between items-end pt-3 border-t">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Recorded By</p>
                  <p className="text-xs font-semibold text-slate-600">{e.user?.name}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                  <p className="text-lg font-black text-red-600">₹{Number(e.amount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 rounded-lg text-[10px] font-bold text-destructive hover:bg-destructive/10"
                  onClick={() => { if(confirm('Delete?')) deleteMut.mutate(e.id); }}
                >
                  <Trash2 className="w-3 h-3 mr-1.5" /> Delete Record
                </Button>
              </div>
            </Card>
          ))}
        </div>
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
