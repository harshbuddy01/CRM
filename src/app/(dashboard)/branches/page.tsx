'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Building2, Plus, Edit2, Trash2, Loader2, X, Check, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage company branches and user assignments</p>
        </div>
        <Button 
          onClick={() => { setEditing(null); setShowForm(true); }} 
          className="w-full sm:w-auto rounded-xl font-bold h-11 sm:h-9 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Branch
        </Button>
      </div>

      {showForm && <BranchForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => qc.invalidateQueries({ queryKey: ['branches'] })} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !branches?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground"><Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No branches yet</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((b: any) => (
            <Card key={b.id} className="border-slate-200 shadow-sm active:scale-[0.98] md:active:scale-100 transition-all overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 leading-tight truncate">{b.name}</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">{b.city || 'No city'}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-xs",
                    b.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
                  )}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {b.address && (
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 line-clamp-2">{b.address}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button 
                    onClick={() => setExpanded(expanded === b.id ? null : b.id)} 
                    className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" /> {b.users?.length || 0} Members
                  </button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-xl shadow-xs border-slate-200 hover:bg-slate-50"
                      onClick={() => { setEditing(b); setShowForm(true); }}
                    >
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 rounded-xl text-red-500 hover:bg-red-50"
                      onClick={() => { if(confirm('Delete?')) deleteMut.mutate(b.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {expanded === b.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/30 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {b.users?.length ? b.users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-[11px] py-1.5 px-2 bg-white rounded-lg border border-slate-100 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", u.isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-300')} />
                        <span className="font-black text-slate-700">{u.name}</span>
                        {u.role && <span className="text-[8px] font-black uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 tracking-tighter">{u.role.label}</span>}
                      </div>
                      <span className="font-medium text-slate-400 truncate ml-2 max-w-[120px]">{u.email}</span>
                    </div>
                  )) : <p className="text-xs text-slate-400 italic text-center py-2">No users assigned</p>}
                </div>
              )}
            </Card>
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
