'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function FollowupsTab({ queryId }: { queryId: string }) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['followups', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}`);
      return (res.data.data.notes || []).filter((n: any) => n.followUpAt);
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/queries/${queryId}/notes`, {
        note: noteText,
        followUpAt: followUpDate?.toISOString(),
        noteType: 'followup',
      });
    },
    onSuccess: () => {
      toast.success('Followup added');
      setIsAddOpen(false);
      setNoteText('');
      setFollowUpDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['followups', queryId] });
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/queries/${queryId}/notes/${noteId}`);
    },
    onSuccess: () => {
      toast.success('Followup deleted');
      queryClient.invalidateQueries({ queryKey: ['followups', queryId] });
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Followups</h3>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Followup</Button>
      </div>

      {!notes?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No followups scheduled.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note: any) => {
            const isOverdue = note.followUpAt && new Date(note.followUpAt) < new Date();
            return (
              <Card key={note.id} className={isOverdue ? 'border-amber-300 bg-amber-50/50' : ''}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">By {note.user?.name || 'Unknown'} • {format(new Date(note.createdAt), 'PPp')}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium"><Clock className="w-3 h-3" /> Overdue</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3 h-3" /> Pending</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {note.followUpAt && format(new Date(note.followUpAt), 'PP')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this followup?')) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Followup</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea placeholder="Followup note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
            <div>
              <label className="text-sm font-medium mb-2 block">Followup Date</label>
              <Popover>
                {/* @ts-expect-error shadcn generic trigger issue */}
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">{followUpDate ? format(followUpDate, 'PPP') : 'Pick a date'}</Button>
                </PopoverTrigger>
                <PopoverContent><Calendar mode="single" selected={followUpDate} onSelect={setFollowUpDate} /></PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addMutation.mutate()} disabled={!noteText.trim() || !followUpDate || addMutation.isPending}>
              {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
