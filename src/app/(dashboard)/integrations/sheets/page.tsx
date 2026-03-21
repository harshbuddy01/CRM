'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Sheet, Plus, Edit2, Trash2, Loader2, X, Check, RefreshCw, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SheetSyncPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: configs, isLoading } = useQuery({
    queryKey: ['sheet-sync'],
    queryFn: () => api.get('/integrations/sheets').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/integrations/sheets/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sheet-sync'] }); toast.success('Config deleted'); },
  });

  const syncMut = useMutation({
    mutationFn: (id: string) => api.post(`/integrations/sheets/${id}/sync`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sheet-sync'] }); toast.success('Sync triggered!'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Sheets Lead Sync</h1>
          <p className="text-muted-foreground text-sm">Auto-import leads from Google Sheets into CRM</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> Add Sheet</Button>
      </div>

      <div className="border rounded-xl p-4 bg-amber-50/50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>⚠️ Setup Required:</strong> Google Sheets API integration requires a Google Cloud service account. Configure your credentials in Railway environment variables (GOOGLE_SERVICE_ACCOUNT_KEY) to enable auto-sync.
        </p>
      </div>

      {showForm && <SheetForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => qc.invalidateQueries({ queryKey: ['sheet-sync'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !configs?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground"><Sheet className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No sheets configured</p></div>
      ) : (
        <div className="space-y-3">
          {configs.map((c: any) => (
            <div key={c.id} className="border rounded-xl p-5 bg-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Sheet className="w-5 h-5 text-green-600" /></div>
              <div className="flex-1">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Link className="w-3 h-3" /> Tab: {c.tabName} · Interval: {c.syncInterval}min
                  {c.lastSyncAt && ` · Last: ${new Date(c.lastSyncAt).toLocaleString('en-IN')}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Paused'}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => syncMut.mutate(c.id)} disabled={syncMut.isPending}><RefreshCw className={`w-3 h-3 mr-1 ${syncMut.isPending ? 'animate-spin' : ''}`} /> Sync</Button>
                <Button variant="outline" size="sm" onClick={() => { setEditing(c); setShowForm(true); }}><Edit2 className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(c.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SheetForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '', sheetUrl: initial?.sheetUrl || '', sheetId: initial?.sheetId || '',
    tabName: initial?.tabName || 'Sheet1', syncInterval: initial?.syncInterval?.toString() || '60',
    columnMapping: JSON.stringify(initial?.columnMapping || { name: 'A', phone: 'B', email: 'C', destination: 'D', leadSource: 'E' }, null, 2),
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = { ...form, columnMapping: form.columnMapping };
      if (initial) await api.put(`/integrations/sheets/${initial.id}`, body);
      else await api.post('/integrations/sheets', body);
      toast.success(initial ? 'Updated!' : 'Created!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold">{initial ? 'Edit Sheet Config' : 'New Sheet Config'}</h3><button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Facebook Lead Sheet" required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Sheet URL</Label><Input value={form.sheetUrl} onChange={e => setForm({...form, sheetUrl: e.target.value})} placeholder="https://docs.google.com/spreadsheets/d/..." /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Sheet ID *</Label><Input value={form.sheetId} onChange={e => setForm({...form, sheetId: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Tab Name</Label><Input value={form.tabName} onChange={e => setForm({...form, tabName: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Sync Interval (minutes)</Label><Input type="number" value={form.syncInterval} onChange={e => setForm({...form, syncInterval: e.target.value})} /></div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Column Mapping (JSON)</Label>
        <textarea className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm bg-background font-mono resize-y" value={form.columnMapping} onChange={e => setForm({...form, columnMapping: e.target.value})} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} {initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
