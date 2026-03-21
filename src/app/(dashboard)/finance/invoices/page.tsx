'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Trash2, Loader2, X, Check, Send, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm">Generate and manage client invoices</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Create Invoice</Button>
      </div>

      <div className="flex gap-2">
        {['', 'draft', 'sent', 'paid', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
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
            <div key={inv.id} className="border rounded-xl p-5 bg-card flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{inv.invoiceNumber}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{inv.clientName}{inv.dueDate && ` · Due: ${new Date(inv.dueDate).toLocaleDateString('en-IN')}`}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-lg">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {inv.status === 'draft' && <Button variant="outline" size="sm" onClick={() => markMut.mutate({ id: inv.id, status: 'sent' })}><Send className="w-3 h-3 mr-1" /> Send</Button>}
                {inv.status === 'sent' && <Button variant="outline" size="sm" onClick={() => markMut.mutate({ id: inv.id, status: 'paid' })}><Check className="w-3 h-3 mr-1" /> Paid</Button>}
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(inv.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
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

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Line Items</Label>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-5" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
            <Input className="col-span-2" type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 0)} />
            <Input className="col-span-2" type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} />
            <span className="col-span-2 text-sm font-medium text-right">₹{item.amount.toLocaleString('en-IN')}</span>
            {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-500"><X className="w-3.5 h-3.5" /></button>}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between items-center gap-2">
            <span>Tax %</span>
            <Input className="w-20 h-7 text-right" type="number" value={form.taxPercent} onChange={e => setForm({...form, taxPercent: e.target.value})} />
            <span>₹{taxAmt.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Create</Button>
      </div>
    </form>
  );
}
