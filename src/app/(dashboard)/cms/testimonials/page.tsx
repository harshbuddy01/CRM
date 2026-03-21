'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Star, Plus, Edit2, Trash2, Loader2, X, Check, Upload, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestimonialsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ['cms-testimonials'],
    queryFn: () => api.get('/cms/testimonials').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/testimonials/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-testimonials'] }); toast.success('Deleted'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">Customer reviews for your website</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> Add Review</Button>
      </div>

      {showForm && (
        <TestimonialForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ['cms-testimonials'] })}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !items?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <MessageSquareQuote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No testimonials yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t: any) => (
            <div key={t.id} className="border rounded-xl p-5 bg-card space-y-3">
              <div className="flex items-center gap-3">
                {t.photoUrl ? <img src={t.photoUrl} alt={t.customerName} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{t.customerName[0]}</div>}
                <div>
                  <h3 className="font-semibold text-sm">{t.customerName}</h3>
                  {t.destination && <span className="text-xs text-muted-foreground">{t.destination}</span>}
                </div>
              </div>
              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />)}</div>
              <p className="text-sm text-muted-foreground line-clamp-3">{t.text}</p>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { setEditing(t); setShowForm(true); }}><Edit2 className="w-3 h-3 mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(t.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ customerName: initial?.customerName || '', rating: initial?.rating || 5, text: initial?.text || '', destination: initial?.destination || '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (file) fd.append('photo', file);
      if (initial) await api.put(`/cms/testimonials/${initial.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/cms/testimonials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(initial ? 'Updated!' : 'Added!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Customer Name *</Label><Input value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Destination</Label><Input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="Sikkim Trip" /></div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rating</Label>
          <div className="flex gap-1">{[1,2,3,4,5].map(i => <button key={i} type="button" onClick={() => setForm({...form, rating: i})}><Star className={`w-6 h-6 ${i <= form.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} /></button>)}</div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Photo</Label>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}><Upload className="w-3.5 h-3.5 mr-1.5" />{file ? file.name : 'Upload'}</Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Review Text *</Label>
        <textarea className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm bg-background resize-y" value={form.text} onChange={e => setForm({...form, text: e.target.value})} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} {initial ? 'Update' : 'Save'}</Button>
      </div>
    </form>
  );
}
