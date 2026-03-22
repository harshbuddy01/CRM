'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Trash2, Loader2, X, Check, Send, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' };

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => api.get('/finance/invoices', { params: { status: statusFilter || undefined } }).then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/invoices/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice deleted'); },
  });

  const markMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/finance/invoices/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Status updated'); },
  });

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Generate and manage client invoices</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto rounded-xl font-bold h-11 sm:h-9 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg overflow-x-auto no-scrollbar gap-1">
        {['', 'draft', 'sent', 'paid', 'cancelled'].map(s => (
          <button 
            key={s} 
            onClick={() => setStatusFilter(s)} 
            className={cn(
              "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
              statusFilter === s ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {s ? s : 'All Invoices'}
          </button>
        ))}
      </div>

      {showForm && <InvoiceForm onClose={() => setShowForm(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['invoices'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !data?.items?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No invoices yet</p></div>
      ) : (
        <div className="space-y-3">
          {data.items.map((inv: any) => (
            <Card key={inv.id} className="p-4 md:p-5 bg-card flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all border-slate-200 active:scale-[0.99] sm:active:scale-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 hidden sm:flex">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                  <h3 className="font-black text-slate-900 tracking-tight">{inv.invoiceNumber}</h3>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded border shadow-xs tracking-widest",
                    STATUS_COLORS[inv.status] || 'bg-slate-100'
                  )}>
                    {inv.status}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-700 truncate">{inv.clientName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {inv.dueDate && `Due: ${new Date(inv.dueDate).toLocaleDateString('en-IN')}`}
                    {inv.dueDate && inv.createdAt && ` · `}
                    {inv.createdAt && `Created: ${new Date(inv.createdAt).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-px sm:hidden">Total Amount</p>
                  <p className="font-black text-lg text-slate-900 leading-tight">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-1">
                  {inv.status === 'draft' && (
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold rounded-lg px-3" onClick={() => markMut.mutate({ id: inv.id, status: 'sent' })}>
                      <Send className="w-3 h-3 mr-1.5" /> Send
                    </Button>
                  )}
                  {inv.status === 'sent' && (
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold rounded-lg px-3 border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => markMut.mutate({ id: inv.id, status: 'paid' })}>
                      <Check className="w-3 h-3 mr-1.5" /> Paid
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg p-0" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(inv.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoiceForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', clientAddress: '', dueDate: '', notes: '', taxPercent: '18' });
  const [items, setItems] = useState([{ description: '', qty: 1, rate: 0, amount: 0 }]);
  const [saving, setSaving] = useState(false);

  const addItem = () => setItems([...items, { description: '', qty: 1, rate: 0, amount: 0 }]);
  const updateItem = (i: number, field: string, val: any) => {
    const updated = [...items];
    (updated[i] as any)[field] = val;
    if (field === 'qty' || field === 'rate') updated[i].amount = updated[i].qty * updated[i].rate;
    setItems(updated);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxPct = parseFloat(form.taxPercent) || 0;
  const taxAmt = subtotal * taxPct / 100;
  const total = subtotal + taxAmt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/finance/invoices', { ...form, items, subtotal, taxAmount: taxAmt, totalAmount: total });
      toast.success('Invoice created!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Create Invoice</h3><button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Client Name *</Label><Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Client Email</Label><Input type="email" value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Client Phone</Label><Input value={form.clientPhone} onChange={e => setForm({...form, clientPhone: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Line Items</Label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 p-3 border rounded-xl bg-slate-50/50 relative group">
              <div className="sm:col-span-5 space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 sm:hidden">Description</Label>
                <Input className="h-9 text-xs rounded-lg" placeholder="Item description..." value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 sm:col-span-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 sm:hidden">Qty</Label>
                  <Input className="h-9 text-xs rounded-lg text-center" type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 sm:hidden">Rate</Label>
                  <Input className="h-9 text-xs rounded-lg text-right" type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                <Label className="text-[9px] font-bold text-slate-400 sm:hidden uppercase">Amount</Label>
                <span className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
              </div>
              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItem(i)} 
                  className="absolute -top-2 -right-2 sm:static sm:col-span-1 h-6 w-6 rounded-full bg-red-100 text-red-600 sm:bg-transparent sm:text-slate-300 sm:hover:text-red-500 flex items-center justify-center shadow-sm sm:shadow-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="h-9 w-full sm:w-auto rounded-xl text-xs font-bold border-dashed border-2" onClick={addItem}>
          <Plus className="w-3.5 h-3.5 mr-2" /> Add New Item
        </Button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span className="uppercase">Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase">Tax %</span>
              <Input className="w-14 h-7 text-center text-xs p-1 rounded font-bold" type="number" value={form.taxPercent} onChange={e => setForm({...form, taxPercent: e.target.value})} />
            </div>
            <span className="text-xs font-black text-slate-700 shrink-0">₹{taxAmt.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center font-black text-base border-t border-slate-200 pt-2 mt-1 text-slate-900">
            <span className="uppercase tracking-tighter">Total Amount</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Create</Button>
      </div>
    </form>
  );
}
