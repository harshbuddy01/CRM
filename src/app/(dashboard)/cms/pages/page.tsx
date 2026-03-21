'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Edit2, Trash2, Loader2, Eye, EyeOff, X, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CmsPagesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => api.get('/cms/pages').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/pages/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-pages'] }); toast.success('Page deleted'); },
  });

  const openEdit = (p: any) => { setEditing(p); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CMS Pages</h1>
          <p className="text-muted-foreground text-sm">Manage About Us, Terms, Privacy and custom pages</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Page</Button>
      </div>

      {showForm && (
        <PageForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ['cms-pages'] })}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !pages?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No CMS pages yet. Create your first page!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((p: any) => (
            <div key={p.id} className="border rounded-xl p-5 bg-card hover:shadow-sm transition-shadow space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <span className="text-xs text-muted-foreground font-mono">/{p.slug}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              {p.seoTitle && <p className="text-xs text-muted-foreground truncate">SEO: {p.seoTitle}</p>}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Edit2 className="w-3 h-3 mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    slug: initial?.slug || '',
    title: initial?.title || '',
    bodyHtml: initial?.bodyHtml || '',
    seoTitle: initial?.seoTitle || '',
    seoDesc: initial?.seoDesc || '',
    isPublished: initial?.isPublished ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) await api.put(`/cms/pages/${initial.id}`, form);
      else await api.post('/cms/pages', form);
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
        <h3 className="font-semibold">{initial ? 'Edit Page' : 'New Page'}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title *</Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="About Us" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Slug *</Label>
          <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="about" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO Title</Label>
          <Input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="About Us | TravelCRM" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO Description</Label>
          <Input value={form.seoDesc} onChange={e => set('seoDesc', e.target.value)} placeholder="Learn about our company..." />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Body Content (HTML)</Label>
        <textarea className="w-full min-h-[200px] px-3 py-2 border rounded-md text-sm bg-background font-mono resize-y" value={form.bodyHtml} onChange={e => set('bodyHtml', e.target.value)} placeholder="<h2>About Us</h2><p>We are a leading travel company...</p>" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
        Publish this page
      </label>
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
