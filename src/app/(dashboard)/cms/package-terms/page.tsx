'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ScrollText, Plus, Edit2, Trash2, Loader2, X, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PackageTermsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ['cms-package-terms'],
    queryFn: () => api.get('/cms/package-terms').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/package-terms/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-package-terms'] }); toast.success('Deleted'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Package Terms & Conditions</h1>
          <p className="text-muted-foreground text-sm">Reusable T&C templates for proposals</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> New Template</Button>
      </div>

      {showForm && <TermsForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => qc.invalidateQueries({ queryKey: ['cms-package-terms'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !items?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No terms templates yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t: any) => (
            <div key={t.id} className="border rounded-xl p-5 bg-card flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{t.name}</h3>
                  {t.isDefault && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Default</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: t.bodyHtml.substring(0, 200) }} />
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="outline" size="sm" onClick={() => { setEditing(t); setShowForm(true); }}><Edit2 className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(t.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TermsForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: initial?.name || '', bodyHtml: initial?.bodyHtml || '', isDefault: initial?.isDefault ?? false, isActive: initial?.isActive ?? true });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (initial) await api.put(`/cms/package-terms/${initial.id}`, form);
      else await api.post('/cms/package-terms', form);
      toast.success(initial ? 'Updated!' : 'Created!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? 'Edit Template' : 'New Template'}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Template Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Standard T&C" required /></div>
      <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Terms Content (HTML)</Label><textarea className="w-full min-h-[200px] px-3 py-2 border rounded-md text-sm bg-background font-mono resize-y" value={form.bodyHtml} onChange={e => setForm({...form, bodyHtml: e.target.value})} /></div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} /> Set as Default</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Active</label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} {initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
