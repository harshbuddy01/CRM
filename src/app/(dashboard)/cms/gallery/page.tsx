'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Image, Plus, Trash2, Loader2, X, Check, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GalleryPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');

  const { data: images, isLoading } = useQuery({
    queryKey: ['cms-gallery', filter],
    queryFn: () => api.get('/cms/gallery', { params: filter ? { category: filter } : {} }).then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/gallery/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-gallery'] }); toast.success('Image deleted'); },
  });

  const categories: string[] = Array.from(new Set((images || []).map((i: any) => i.category).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Photo Gallery</h1>
          <p className="text-muted-foreground text-sm">Manage photos for your website gallery</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Photo</Button>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>All</button>
          {categories.map((c: string) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{c}</button>
          ))}
        </div>
      )}

      {showForm && <GalleryForm onClose={() => setShowForm(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['cms-gallery'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !images?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No photos yet</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img: any) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border bg-card">
              <img src={img.imageUrl} alt={img.caption || 'Gallery'} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption && <p className="text-white text-xs font-medium truncate">{img.caption}</p>}
                  {img.category && <span className="text-white/70 text-[10px]">{img.category}</span>}
                </div>
                <button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(img.id); }} className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ caption: '', category: '', sequence: '0' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('image', file);
      await api.post('/cms/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo added!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Add Photo</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Caption</Label><Input value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Sikkim, Adventure..." /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Sequence</Label><Input type="number" value={form.sequence} onChange={e => setForm({...form, sequence: e.target.value})} /></div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Photo *</Label>
        <div className="flex items-center gap-4">
          {preview && <img src={preview} alt="Preview" className="w-24 h-20 object-cover rounded-lg border" />}
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
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
