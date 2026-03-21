'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Building2, Plus, Edit2, Trash2, Loader2, X, Check, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BranchesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/branches/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); toast.success('Branch deleted'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground text-sm">Manage company branches and user assignments</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> Add Branch</Button>
      </div>

      {showForm && <BranchForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => qc.invalidateQueries({ queryKey: ['branches'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !branches?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground"><Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No branches yet</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((b: any) => (
            <div key={b.id} className="border rounded-xl bg-card overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <h3 className="font-semibold">{b.name}</h3>
                      <span className="text-xs text-muted-foreground">{b.city || 'No city'}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                {b.address && <p className="text-sm text-muted-foreground">{b.address}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <Users className="w-3.5 h-3.5" /> {b.users?.length || 0} Members
                  </button>
                  <div className="ml-auto flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(b); setShowForm(true); }}><Edit2 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if(confirm('Delete?')) deleteMut.mutate(b.id); }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
              {expanded === b.id && (
                <div className="border-t p-4 bg-muted/20 space-y-2">
                  {b.users?.length ? b.users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span>{u.name}</span>
                        {u.role && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{u.role.label}</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No users assigned</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BranchForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: initial?.name || '', city: initial?.city || '', address: initial?.address || '', phone: initial?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (initial) await api.put(`/branches/${initial.id}`, form);
      else await api.post('/branches', form);
      toast.success(initial ? 'Updated!' : 'Created!'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-4">
      <div className="flex items-center justify-between"><h3 className="font-semibold">{initial ? 'Edit Branch' : 'New Branch'}</h3><button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Branch Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
        <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} {initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
