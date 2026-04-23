'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, X, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function TrendingForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    region: initial?.region || '',
    title: initial?.title || '',
    tagline: initial?.tagline || '',
    image: initial?.image || '',
    link: initial?.link || '',
    lastUpdated: initial?.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    isActive: initial?.isActive ?? true,
    sequence: initial?.sequence || 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) await api.put(`/website-content/trending/${initial.id}`, form);
      else await api.post('/website-content/trending', form);
      toast.success(initial ? 'Updated!' : 'Created!');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? 'Edit Trending Item' : 'New Trending Item'}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title *</Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Kedarnath" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Region *</Label>
          <Input value={form.region} onChange={e => set('region', e.target.value)} placeholder="Northern Frontiers" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tagline *</Label>
          <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="The Sacred Spiritual Peaks" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Link *</Label>
          <Input value={form.link} onChange={e => set('link', e.target.value)} placeholder="/destinations/gangtok" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Image URL *</Label>
          <Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Last Updated</Label>
          <Input value={form.lastUpdated} onChange={e => set('lastUpdated', e.target.value)} placeholder="April 22, 2026" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Display Order</Label>
          <Input type="number" value={form.sequence} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('sequence', Number.isFinite(parsed) ? parsed : form.sequence);
          }} />
        </div>
        <label className="flex items-center gap-2 text-sm pt-6">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
          Active (visible on website popup)
        </label>
      </div>
      {form.image && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
          <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
          {initial ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

export default function TrendingTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ['wc-trending'],
    queryFn: () => api.get('/website-content/trending').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/website-content/trending/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wc-trending'] }); toast.success('Deleted'); },
    onError: (error: any) => { console.error('Delete trending failed:', error); toast.error(error.response?.data?.message || 'Failed to delete'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Manage trending destination items shown in the website popup carousel.</p>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> Add Trending</Button>
      </div>

      {showForm && (
        <TrendingForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ['wc-trending'] })}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !items?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <p>No trending destinations yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t: any) => (
            <div key={t.id} className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow">
              {t.image && (
                <div className="relative h-40 bg-gray-100">
                  <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">{t.region}</p>
                    <h3 className="text-white font-bold text-lg">{t.title}</h3>
                  </div>
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${t.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {t.isActive ? 'Active' : 'Hidden'}
                  </div>
                </div>
              )}
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground italic">&quot;{t.tagline}&quot;</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>→ {t.link}</span>
                  <span>{t.lastUpdated}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(t); setShowForm(true); }}><Edit2 className="w-3 h-3 mr-1" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(t.id); }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
