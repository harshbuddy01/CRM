'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Image, Plus, Trash2, Loader2, X, Check, GripVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BannersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['cms-banners'],
    queryFn: () => api.get('/cms/banners').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/banners/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-banners'] }); toast.success('Banner deleted'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home Banners</h1>
          <p className="text-muted-foreground text-sm">Manage homepage hero banners</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
      </div>

      {showForm && (
        <BannerForm onClose={() => setShowForm(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['cms-banners'] })} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !banners?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No banners yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((b: any) => (
            <div key={b.id} className="border rounded-xl overflow-hidden bg-card group relative">
              {b.imageUrl && <img src={b.imageUrl} alt={b.title || 'Banner'} className="w-full h-40 object-cover" />}
              <div className="p-4 space-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    {b.title && <h3 className="font-semibold">{b.title}</h3>}
                    {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Order: {b.sequence}</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(b.id); }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BannerForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', subtitle: '', linkUrl: '', sequence: '0', isActive: true });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('image', file);
      await api.post('/cms/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Banner added!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Add Banner</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Subtitle</Label><Input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Link URL</Label><Input value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Sequence</Label><Input type="number" value={form.sequence} onChange={e => setForm({...form, sequence: e.target.value})} /></div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Banner Image *</Label>
        <div className="flex items-center gap-4">
          {preview && <img src={preview} alt="Preview" className="w-32 h-20 object-cover rounded-lg border" />}
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}><Upload className="w-3.5 h-3.5 mr-1.5" />{preview ? 'Change' : 'Upload'}</Button>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Save</Button>
      </div>
    </form>
  );
}
