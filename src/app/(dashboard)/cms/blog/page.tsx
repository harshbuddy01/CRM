'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Newspaper, Plus, Edit2, Trash2, Loader2, X, Check, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BlogPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['cms-blog'],
    queryFn: () => api.get('/cms/blog').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/blog/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms-blog'] }); toast.success('Post deleted'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog / SEO Posts</h1>
          <p className="text-muted-foreground text-sm">Manage blog content for SEO and marketing</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> New Post</Button>
      </div>

      {showForm && <BlogForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => qc.invalidateQueries({ queryKey: ['cms-blog'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !posts?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No blog posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p: any) => (
            <div key={p.id} className="border rounded-xl p-5 bg-card flex gap-4 items-start hover:shadow-sm transition-shadow">
              {p.coverImage && <img src={p.coverImage} alt={p.title} className="w-24 h-16 object-cover rounded-lg shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">/{p.slug}</span>
                {p.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p.excerpt}</p>}
                {p.tags && <div className="flex gap-1 mt-1.5">{p.tags.split(',').map((t: string) => <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{t.trim()}</span>)}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="outline" size="sm" onClick={() => { setEditing(p); setShowForm(true); }}><Edit2 className="w-3 h-3" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(p.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '', slug: initial?.slug || '', bodyHtml: initial?.bodyHtml || '',
    excerpt: initial?.excerpt || '', author: initial?.author || '', tags: initial?.tags || '',
    seoTitle: initial?.seoTitle || '', seoDesc: initial?.seoDesc || '', isPublished: initial?.isPublished ?? false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (file) fd.append('cover', file);
      if (initial) await api.put(`/cms/blog/${initial.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/cms/blog', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(initial ? 'Updated!' : 'Published!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? 'Edit Post' : 'New Blog Post'}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Title *</Label><Input value={form.title} onChange={e => set('title', e.target.value)} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Slug *</Label><Input value={form.slug} onChange={e => set('slug', e.target.value)} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Author</Label><Input value={form.author} onChange={e => set('author', e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Tags (comma-separated)</Label><Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="travel, sikkim, adventure" /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO Title</Label><Input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO Description</Label><Input value={form.seoDesc} onChange={e => set('seoDesc', e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Excerpt</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md text-sm bg-background resize-y" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} /></div>
      <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Body Content (HTML)</Label><textarea className="w-full min-h-[200px] px-3 py-2 border rounded-md text-sm bg-background font-mono resize-y" value={form.bodyHtml} onChange={e => set('bodyHtml', e.target.value)} /></div>
      <div className="flex items-center gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Cover Image</Label>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}><Upload className="w-3.5 h-3.5 mr-1.5" />{file ? file.name : 'Upload'}</Button>
        </div>
        <label className="flex items-center gap-2 text-sm mt-5"><input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} /> Publish</label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} {initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
