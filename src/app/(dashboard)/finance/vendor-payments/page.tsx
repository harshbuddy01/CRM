'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Wallet, Plus, Trash2, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function VendorPaymentsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-payments'],
    queryFn: () => api.get('/finance/vendor-payments').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/vendor-payments/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-payments'] }); toast.success('Deleted'); },
  });

  const totalPaid = (data?.items || []).reduce((s: number, v: any) => s + Number(v.amount), 0);

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Vendor Payments</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Track payments made to suppliers and vendors</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto rounded-xl font-bold h-11 sm:h-9 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      <div className="border rounded-xl p-5 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Wallet className="w-5 h-5 text-purple-600" /></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Vendor Payouts</p>
            <p className="text-2xl font-bold text-purple-700">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {showForm && <VPForm onClose={() => setShowForm(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['vendor-payments'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !data?.items?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground"><Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No vendor payments yet</p></div>
      ) : (
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block border rounded-xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-sm font-medium">
            <thead className="bg-muted/50 text-xs uppercase text-slate-400 font-bold italic">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((v: any) => (
                <tr key={v.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 text-slate-500">{new Date(v.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-black text-slate-900">{v.vendorName}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                      {v.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-400 font-mono tracking-tighter">{v.referenceId || '-'}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">₹{Number(v.amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { if(confirm('Delete?')) deleteMut.mutate(v.id); }} 
                      className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
          {data.items.map((v: any) => (
            <Card key={v.id} className="p-4 border-slate-200 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {new Date(v.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{v.vendorName}</h3>
                </div>
                <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                  {v.mode}
                </span>
              </div>
              
              <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-2">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reference</p>
                  <p className="text-xs font-mono font-bold text-slate-600 truncate max-w-[120px]">{v.referenceId || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-px">Paid Amount</p>
                  <p className="text-lg font-black text-purple-600 leading-tight">₹{Number(v.amount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 rounded-lg text-[10px] font-bold text-destructive hover:bg-red-50"
                  onClick={() => { if(confirm('Delete?')) deleteMut.mutate(v.id); }}
                >
                  <Trash2 className="w-3 h-3 mr-1.5" /> Remove Payment
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

function VPForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ vendorName: '', amount: '', mode: 'upi', referenceId: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/finance/vendor-payments', form); toast.success('Payment recorded!'); onSaved(); onClose(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Record Vendor Payment</h3><button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Vendor Name *</Label><Input value={form.vendorName} onChange={e => setForm({...form, vendorName: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Amount *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Payment Mode</Label>
          <select className="w-full h-10 px-3 border rounded-md text-sm bg-background" value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
            <option value="upi">UPI</option><option value="neft">NEFT</option><option value="cash">Cash</option><option value="cheque">Cheque</option>
          </select>
        </div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Reference / UTR</Label><Input value={form.referenceId} onChange={e => setForm({...form, referenceId: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label><Input type="date" value={form.paymentDate} onChange={e => setForm({...form, paymentDate: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Save</Button>
      </div>
    </form>
  );
}
