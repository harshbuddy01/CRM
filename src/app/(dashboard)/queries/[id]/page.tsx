'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Phone, Mail, MapPin, IndianRupee, Users, Send, Loader2, User, Trash2, ArrowLeft, UserPlus, FileText, Plus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

// ... (in QueryProposalsList add Dialog logic)import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { TRANSITIONS } from '@/lib/constants';

const formatStatus = (s: string) => s.replace('_', ' ').toUpperCase();

type Note = {
  id: string;
  note: string;
  followUpAt: string | null;
  createdAt: string;
  user: { name: string };
};

type QueryDetail = {
  id: string;
  queryCode: string;
  name: string;
  phone: string;
  email: string | null;
  destination: string | null;
  budget: number | null;
  adults: number;
  children: number;
  leadSource: string;
  status: string;
  createdAt: string;
  travelDateFrom: string | null;
  travelDateTo: string | null;
  assignedTo: string | null;
  assignedUser?: { id: string; name: string } | null;
  notes: Note[];
};

export default function QueryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('timeline');

  // --- Data Fetching ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ['query', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}`);
      return res.data.data as QueryDetail;
    },
    retry: 1,
  });

  // --- Status Change Mutation ---
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await api.patch(`/queries/${queryId}/status`, { status: newStatus });
    },
    onSuccess: (_, variables) => {
      toast.success(`Status updated to ${formatStatus(variables)}`);
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
    onError: (err: any) => {
      toast.error('Failed to change status', { description: err.response?.data?.message });
    }
  });

  // --- Notes Form State ---
  const [noteContent, setNoteContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // --- Note Submit Function ---
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.post(`/queries/${queryId}/notes`, {
        note: noteContent,
        followUpAt: followUpDate ? followUpDate.toISOString() : null,
      });
      toast.success('Note added successfully');
      setNoteContent('');
      setFollowUpDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
    } catch (err: any) {
      toast.error('Failed to add note', { description: err.response?.data?.message });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/queries/${queryId}/notes/${noteId}`);
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
      toast.success('Note deleted');
    } catch (err: any) {
      toast.error('Failed to delete note', { description: err.response?.data?.message });
    }
  };

  // --- Agent Assignment State ---
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['active_agents'],
    queryFn: async () => {
      const res = await api.get('/users/agents');
      return res.data.data;
    },
    enabled: isAssignOpen, // Only fetch when modal opens
  });

  const assignMutation = useMutation({
    mutationFn: async (agentId: string) => {
      await api.patch(`/queries/${queryId}/assign`, { assignedTo: agentId });
    },
    onSuccess: () => {
      toast.success('Query assigned successfully');
      setIsAssignOpen(false);
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
    onError: (err: any) => {
      toast.error('Assignment Failed', { description: err.response?.data?.message });
    }
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-red-500 font-medium">Failed to load lead details. You might not have access.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const query = data;
  let allowedTransitions = TRANSITIONS[query.status] || [];
  if (user?.role !== 'admin') {
    allowedTransitions = allowedTransitions.filter((s) => s !== 'confirmed');
  }
  const canEditAll = user?.permissions['query.edit_all'];
  const canEditStatus = user?.permissions['query.status_change'] && (canEditAll || query.assignedTo === user?.id);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/queries')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{query.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${
                query.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                query.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                query.status === 'lost' || query.status === 'invalid' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
              {formatStatus(query.status)}
            </span>
            <span className="text-muted-foreground text-sm font-medium">{query.queryCode}</span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Created on {format(new Date(query.createdAt), 'PPpp')} • Assigned to {query.assignedUser?.name || 'Unassigned'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="ml-auto">
          {canEditAll && (
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              {/* @ts-expect-error shadcn generic trigger issue */}
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Assign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Query (Lead)</DialogTitle>
                  <DialogDescription>
                    Select an agent to assign this lead to. Load balancing capacities are shown below.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {agentsLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : agentsData?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No active agents found.</p>
                  ) : (
                    agentsData?.map((agent: any) => {
                      const isOverloaded = agent.activeLeadCount >= agent.maxLeads;
                      return (
                        <div 
                          key={agent.id} 
                          className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${selectedAgentId === agent.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'} ${isOverloaded ? 'opacity-60' : ''}`}
                          onClick={() => !isOverloaded && setSelectedAgentId(agent.id)}
                        >
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{agent.roleName}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-semibold ${isOverloaded ? 'text-destructive' : 'text-emerald-600'}`}>
                              {agent.activeLeadCount} / {agent.maxLeads} Leads
                            </p>
                            {isOverloaded && <p className="text-[10px] text-destructive">Capacity Full</p>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="ghost" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                  <Button 
                    disabled={!selectedAgentId || assignMutation.isPending} 
                    onClick={() => assignMutation.mutate(selectedAgentId)}
                  >
                    {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Transition Bar */}
      {canEditStatus && allowedTransitions.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-primary">Move this lead forward:</p>
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((nextStatus) => (
                <Button 
                  key={nextStatus} 
                  variant={nextStatus === 'lost' || nextStatus === 'invalid' ? 'destructive' : nextStatus === 'confirmed' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => statusMutation.mutate(nextStatus)}
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
                  Mark as {formatStatus(nextStatus)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{query.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{query.phone}</span>
              </div>
              {query.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{query.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{query.destination || 'Destination TBD'}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Budget</p>
                  <div className="flex items-center font-medium">
                    <IndianRupee className="w-3 h-3 mr-1" />
                    {query.budget ? query.budget.toLocaleString('en-IN') : 'TBD'}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Pax</p>
                  <div className="flex items-center font-medium">
                    <Users className="w-3 h-3 mr-1" />
                    {query.adults} Adults, {query.children} Kids
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Source</p>
                  <p className="font-medium capitalize">{query.leadSource}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Travel Dates</p>
                  <p className="font-medium">
                    {query.travelDateFrom ? format(new Date(query.travelDateFrom), 'MMM d, yyyy') : 'TBD'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Notes & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Note Form */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleAddNote} className="space-y-4">
                <Textarea 
                  placeholder="Type a note or log a call..." 
                  className="min-h-[100px] resize-none"
                  value={noteContent}
                  onChange={(e: any) => setNoteContent(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Follow Up:</p>
                    <Popover>
                      {/* @ts-expect-error shadcn generic trigger issue */}
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-[160px] justify-start text-left font-normal",
                            !followUpDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {followUpDate ? format(followUpDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={followUpDate}
                          onSelect={setFollowUpDate}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button type="submit" disabled={!noteContent.trim() || isSubmittingNote}>
                    {isSubmittingNote ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Add Note
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Activity Timeline & Proposals */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="timeline" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timeline">Timeline & Notes</TabsTrigger>
                  <TabsTrigger value="proposals">Proposals</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-6 p-4">
                  <div className="space-y-4">
                    {query.notes.length === 0 ? (
                      <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No activity logged yet.
                      </div>
                    ) : (
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                        {query.notes.map((note) => (
                          <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/10 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <span className="font-semibold text-sm">{note.user.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{format(new Date(note.createdAt), 'MMM d, h:mm a')}</span>
                                </div>
                                {(note.user.name === user?.name || user?.role === 'admin') && (
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                              {note.followUpAt && (
                                <div className="mt-3 pt-3 border-t flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  <CalendarIcon className="w-3 h-3 mr-1.5" />
                                  Follow up set for {format(new Date(note.followUpAt), 'PPP')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="proposals" className="mt-6 p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Proposals</h3>
                    <Link href={`/queries/${params.id}/proposals/new`}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" /> Build Proposal
                      </Button>
                    </Link>
                  </div>

                  <QueryProposalsList queryId={params.id as string} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QueryProposalsList({ queryId }: { queryId: string }) {
  const [waModalOpenId, setWaModalOpenId] = useState<string | null>(null);

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/proposals`);
      return res.data.data;
    }
  });

  const sendWhatsapp = useMutation({
    mutationFn: async (proposalId: string) => {
      await api.post(`/proposals/${proposalId}/send-whatsapp`);
    },
    onSuccess: () => {
      toast.success('WhatsApp dispatched successfully');
      setWaModalOpenId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp');
    }
  });

  const sendEmail = useMutation({
    mutationFn: async (proposalId: string) => {
      await api.post(`/proposals/${proposalId}/send-email`);
    },
    onSuccess: () => toast.success('Email dispatched successfully'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send email')
  });

  const handleWaModalOpen = async (proposalId: string) => {
    setWaModalOpenId(proposalId);
    // Background log 'whatsapp_opened'
    try {
      await api.post(`/proposals/${proposalId}/log/whatsapp_opened`);
    } catch(err) {
      // ignore
    }
  };

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No Proposals Yet</h3>
        <p className="text-muted-foreground mb-4">You haven&apos;t built any proposals for this query.</p>
        <Link href={`/queries/${queryId}/proposals/new`}>
          <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Build the First Proposal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((p: any) => (
        <div key={p.id} className="p-4 border rounded-lg hover:border-primary transition-colors flex justify-between items-center group">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 bg-primary/10 text-primary rounded-full items-center justify-center font-bold">
              v{p.version}
            </div>
            <div>
              <h4 className="font-semibold text-lg flex items-center gap-2">
                Version {p.version}
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-normal">
                  {new Date(p.createdAt).toLocaleDateString('en-GB')}
                </span>
              </h4>
              <p className="text-muted-foreground text-sm mt-1">
                Selling Price: <span className="font-medium text-foreground inline-flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{Number(p.sellingPrice).toLocaleString()}</span> • 
                Created by {p.user?.name || 'System'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            
            <a href={`http://localhost:3001/api/v1/proposals/${p.id}/pdf`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">PDF</Button>
            </a>

            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => sendEmail.mutate(p.id)}
              disabled={sendEmail.isPending}
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>

            <Dialog open={waModalOpenId === p.id} onOpenChange={(open) => !open && setWaModalOpenId(null)}>
              {/* @ts-expect-error shadcn generic trigger issue */}
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleWaModalOpen(p.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send via WhatsApp</DialogTitle>
                  <DialogDescription>
                    Dispatch a pre-approved Interakt template with the attached Proposal PDF link directly to the customer.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-muted p-4 rounded-md text-sm border font-mono">
                  <p>COMPANY_NAME</p>
                  <p>Hi {'{Customer Name}'},</p>
                  <p>Please find your proposal attached.</p>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="ghost" onClick={() => setWaModalOpenId(null)}>Cancel</Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => sendWhatsapp.mutate(p.id)}
                    disabled={sendWhatsapp.isPending}
                  >
                    {sendWhatsapp.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm & Send
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      ))}
    </div>
  );
}

