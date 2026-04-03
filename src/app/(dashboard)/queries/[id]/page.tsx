'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  MapPin, 
  IndianRupee, 
  Users, 
  Send, 
  Loader2, 
  User, 
  Trash2, 
  ArrowLeft, 
  UserPlus, 
  FileText, 
  Plus, 
  MessageCircle, 
  CreditCard, 
  Edit, 
  Search, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { TRANSITIONS } from '@/lib/constants';
import { PaymentEntryModal } from '@/components/PaymentEntryModal';
import { EmailComposeModal } from '@/components/EmailComposeModal';
import { ProposalEmailComposeModal } from '@/components/ProposalEmailComposeModal';
import { MailsTab } from '@/components/query-tabs/MailsTab';
import { FollowupsTab } from '@/components/query-tabs/FollowupsTab';
import { SupplierCommTab } from '@/components/query-tabs/SupplierCommTab';
import { PostSalesTab } from '@/components/query-tabs/PostSalesTab';
import { VoucherTab } from '@/components/query-tabs/VoucherTab';
import { DocsTab } from '@/components/query-tabs/DocsTab';
import { InvoiceTab } from '@/components/query-tabs/InvoiceTab';
import { BillingTab } from '@/components/query-tabs/BillingTab';
import { HistoryTab } from '@/components/query-tabs/HistoryTab';

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
  const [activeTab, setActiveTab] = useState('proposals');

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

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const editMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.put(`/queries/${queryId}`, payload);
    },
    onSuccess: () => {
      toast.success('Lead updated successfully');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
    onError: (err: any) => {
      toast.error('Failed to update lead', { description: err.response?.data?.message });
    }
  });

  const { data: statusSettings } = useQuery({
    queryKey: ['status-settings'],
    queryFn: async () => {
      const res = await api.get('/status-settings');
      return res.data.data;
    }
  });

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
    <div className="space-y-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push('/queries')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 truncate max-w-[200px] md:max-w-none">{query.name}</h1>
              {(() => {
                const s = statusSettings?.find((st: any) => st.code === query.status);
                const label = s ? s.label : formatStatus(query.status);
                
                const statusStyles: Record<string, string> = {
                  new: 'linear-gradient(135deg, #6B7280, #4B5563)',
                  followup: 'linear-gradient(135deg, #667eea, #764ba2)',
                  dnp: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  proposal_sent: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  ready_to_pay: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  confirmed: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  lost: 'linear-gradient(135deg, #ee0979, #ff6a00)',
                  invalid: 'linear-gradient(135deg, #f7971e, #ffd200)',
                };
                
                const bg = statusStyles[query.status] || (s ? `linear-gradient(135deg, ${s.colorHex}, ${s.colorHex}dd)` : 'linear-gradient(135deg, #6B7280, #4B5563)');

                return (
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider text-white shadow-sm border border-white/20"
                    style={{ background: bg }}
                  >
                    {label}
                  </span>
                );
              })()}
              <span className="text-slate-400 text-xs font-bold tracking-tighter uppercase">{query.queryCode}</span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px] md:text-sm font-medium">
              Created {query.createdAt ? format(new Date(query.createdAt), 'MMM d, p') : 'Unknown Date'} • {query.assignedUser?.name || 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 md:ml-auto shrink-0">
          {query.email && (
            <Button variant="outline" size="sm" className="gap-2 shrink-0 rounded-xl font-bold h-9 bg-white shadow-sm" onClick={() => setIsEmailModalOpen(true)}>
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email
            </Button>
          )}

          {canEditAll && (
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              {/* @ts-expect-error shadcn generic trigger issue */}
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0 rounded-xl font-bold h-9 bg-white shadow-sm">
                  <UserPlus className="w-3.5 h-3.5 text-primary" />
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
        <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderLeft: '4px solid #667eea' }}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Move this lead forward:</p>
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((nextStatus) => {
                const statusStyles: Record<string, string> = {
                  new: 'linear-gradient(135deg, #6B7280, #4B5563)',
                  followup: 'linear-gradient(135deg, #667eea, #764ba2)',
                  dnp: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  proposal_sent: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  ready_to_pay: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  confirmed: 'linear-gradient(135deg, #11998e, #38ef7d)',
                  lost: 'linear-gradient(135deg, #ee0979, #ff6a00)',
                  invalid: 'linear-gradient(135deg, #f7971e, #ffd200)',
                };
                const bg = statusStyles[nextStatus] || 'linear-gradient(135deg, #667eea, #764ba2)';
                return (
                  <button
                    key={nextStatus}
                    onClick={() => statusMutation.mutate(nextStatus)}
                    disabled={statusMutation.isPending}
                    style={{ background: bg }}
                    className="px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-md hover:opacity-90 hover:scale-105 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {statusMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    Mark as {formatStatus(nextStatus)}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Lead Details</CardTitle>
              {canEditAll && (
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  {/* @ts-expect-error shadcn generic trigger issue */}
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setEditForm({ name: query.name, email: query.email || '', phone: query.phone })}>
                      <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Lead Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Customer Name</label>
                        <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                      <Button disabled={editMutation.isPending} onClick={() => editMutation.mutate(editForm)}>
                        {editMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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

           {/* 10-Tab CRM Workflow */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="proposals" className="w-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex w-full justify-start gap-1 bg-transparent border-b rounded-none h-13 px-4 overflow-x-auto">
                  {([
                    { value: 'proposals', label: 'Proposals', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                    { value: 'mails', label: 'Mails', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
                    { value: 'followups', label: 'Followups', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
                    { value: 'supp-comm', label: 'Supp. Comm.', gradient: 'linear-gradient(135deg, #f7971e, #ffd200)' },
                    { value: 'post-sales', label: 'Post Sales', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
                    { value: 'voucher', label: 'Voucher', gradient: 'linear-gradient(135deg, #ee0979, #ff6a00)' },
                    { value: 'docs', label: 'Docs', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
                    { value: 'invoice', label: 'Invoice', gradient: 'linear-gradient(135deg, #6a11cb, #2575fc)' },
                    { value: 'billing', label: 'Billing', gradient: 'linear-gradient(135deg, #f7971e, #ffd200)' },
                    { value: 'history', label: 'History', gradient: 'linear-gradient(135deg, #373b44, #4286f4)' },
                  ] as const).map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        style={isActive ? { background: tab.gradient } : {}}
                        className={`flex-none px-3 py-1.5 my-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          isActive
                            ? 'text-white shadow-md scale-105'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </TabsList>

                <TabsContent value="proposals" className="mt-4 p-4">
                  <QueryProposalsList 
                    queryId={params.id as string} 
                    queryCode={data?.queryCode || ''} 
                    customerName={data?.name || ''} 
                    customerEmail={data?.email || ''} 
                  />
                </TabsContent>

                <TabsContent value="mails" className="mt-4 p-4">
                  <MailsTab queryId={queryId} queryEmail={query.email} />
                </TabsContent>

                <TabsContent value="followups" className="mt-4 p-4">
                  <FollowupsTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="supp-comm" className="mt-4 p-4">
                  <SupplierCommTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="post-sales" className="mt-4 p-4">
                  <PostSalesTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="voucher" className="mt-4 p-4">
                  <VoucherTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="docs" className="mt-4 p-4">
                  <DocsTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="invoice" className="mt-4 p-4">
                  <InvoiceTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="billing" className="mt-4 p-4">
                  <BillingTab queryId={queryId} />
                </TabsContent>

                <TabsContent value="history" className="mt-4 p-4">
                  <HistoryTab queryId={queryId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <EmailComposeModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        queryId={query.id}
        queryCode={query.queryCode}
        customerName={query.name}
        customerEmail={query.email || ''}
      />
    </div>
  );
}

function QueryProposalsList({ queryId, queryCode, customerName, customerEmail }: { queryId: string, queryCode: string, customerName: string, customerEmail: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [waModalOpenId, setWaModalOpenId] = useState<string | null>(null);
  const [emailModalOpenId, setEmailModalOpenId] = useState<string | null>(null);
  const [manualWaLink, setManualWaLink] = useState<string | null>(null);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const confirmProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const res = await api.post(`/proposals/${proposalId}/confirm`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Proposal confirmed! Query moved to operations.');
      queryClient.invalidateQueries({ queryKey: ['proposals', queryId] });
      queryClient.invalidateQueries({ queryKey: ['query', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to confirm proposal')
  });

  const createProposalMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/queries/${queryId}/proposals/new-itinerary`, { title: `Itinerary for ${customerName}` });
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success('Itinerary created & linked');
      queryClient.invalidateQueries({ queryKey: ['proposals', queryId] });
      if (data.itineraryId) {
        router.push(`/itineraries/${data.itineraryId}`);
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create itinerary')
  });

  const insertProposalMutation = useMutation({
    mutationFn: async (itineraryId: string) => {
      const res = await api.post(`/queries/${queryId}/proposals/insert`, { itineraryId });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Itinerary inserted successfully');
      setShowInsertModal(false);
      queryClient.invalidateQueries({ queryKey: ['proposals', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to insert itinerary')
  });

  const downloadPdf = useMutation({
    mutationFn: async (proposal: any) => {
      setDownloadingId(proposal.id);
      const res = await api.get(`/proposals/${proposal.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Proposal-v${proposal.version}-${queryCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      setDownloadingId(null);
      toast.success('PDF Downloaded');
    },
    onError: (err: any) => {
      setDownloadingId(null);
      toast.error('Failed to download PDF', { description: err.response?.data?.message });
    }
  });

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/proposals`);
      return res.data.data;
    }
  });

  const sendWhatsapp = useMutation({
    mutationFn: async (proposalId: string) => {
      const res = await api.post(`/proposals/${proposalId}/send-whatsapp`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.mode === 'manual' && data.waLink) {
        setManualWaLink(data.waLink);
      } else {
        toast.success('WhatsApp dispatched successfully');
        setWaModalOpenId(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp');
    }
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/proposals/${id}`);
    },
    onSuccess: () => {
      toast.success('Proposal deleted');
      queryClient.invalidateQueries({ queryKey: ['proposals', queryId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete proposal');
    }
  });

  const handleWaModalOpen = async (proposalId: string) => {
    setWaModalOpenId(proposalId);
    try {
      await api.post(`/proposals/${proposalId}/log/whatsapp_opened`);
    } catch(err) {
      // ignore
    }
  };

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const renderEmptyState = () => (
    <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-slate-50/50">
      <div className="bg-white p-4 rounded-2xl shadow-sm border w-fit mx-auto mb-6">
        <FileText className="w-10 h-10 text-primary/40" />
      </div>
      <h3 className="text-xl font-black text-slate-900">No Proposals Yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-8 text-sm font-medium">
        Every great trip starts with a perfect plan. Create a fresh itinerary or insert from a master template.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
        <Button 
          className="rounded-xl px-8 h-12 font-black transition-all bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/20 w-full sm:w-auto"
          onClick={() => createProposalMutation.mutate()}
          disabled={createProposalMutation.isPending}
        >
          {createProposalMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Fresh Itinerary
        </Button>
        <Button 
          variant="outline"
          className="rounded-xl px-8 h-12 font-black border-slate-200 hover:border-primary hover:bg-primary/[0.02] transition-all w-full sm:w-auto shadow-sm"
          onClick={() => setShowInsertModal(true)}
        >
          <Database className="w-4 h-4 mr-2 text-primary" />
          From Masters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {proposals?.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/80 p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Proposed Itineraries
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider">
                {proposals.length} Versions
              </div>
            </h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Manage multiple versions of your travel plan below.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-lg font-bold border-slate-200 bg-white flex-1 sm:flex-none h-9"
              onClick={() => setShowInsertModal(true)}
            >
              <Plus className="w-3 h-3 mr-1 text-primary" />
              Insert
            </Button>

            {selectedIds.length > 0 && (
              <Button 
                size="sm" 
                variant="default" 
                className="rounded-lg font-black bg-blue-600 hover:bg-blue-700 h-9 px-4 animate-in fade-in slide-in-from-right-4"
                onClick={() => setEmailModalOpenId(selectedIds[0])}
              >
                Bulk Send ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {!proposals || proposals.length === 0 ? renderEmptyState() : (
        <div className="grid grid-cols-1 gap-4">
          {proposals.map((p: any) => (
            <div key={p.id} className={cn(
              "p-5 border rounded-[32px] transition-all bg-white flex justify-between items-center group shadow-sm relative overflow-hidden",
              p.status === 'confirmed' ? "border-emerald-500 ring-4 ring-emerald-50 shadow-emerald-100" : "hover:border-primary/40",
              p.status === 'rejected' ? "opacity-60 grayscale-[0.5]" : "",
              selectedIds.includes(p.id) ? "border-blue-500 bg-blue-50/20" : ""
            )}>
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex items-center gap-6">
                <div className="relative">
                  {p.itinerary?.coverPhotoUrl ? (
                    <img src={p.itinerary.coverPhotoUrl} alt="" className="hidden sm:block w-20 h-20 rounded-[28px] object-cover shadow-md border-2 border-white" />
                  ) : (
                    <div className="hidden sm:flex w-20 h-20 rounded-[28px] bg-slate-100 items-center justify-center border-2 border-white shadow-sm">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  {p.status === 'confirmed' && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {p.status === 'rejected' && (
                    <div className="absolute -top-2 -right-2 bg-slate-400 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-900 text-lg leading-none">v{p.version}</p>
                    {p.status !== 'pending' && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        p.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {p.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-2 truncate max-w-[200px] sm:max-w-md">
                    {p.itinerary?.title || `Proposal for ${customerName}`}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" /> Updated {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Actions */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                  {p.status === 'pending' && (
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="rounded-xl h-10 w-10 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all font-black"
                      title="Confirm this proposal"
                      onClick={() => confirmProposalMutation.mutate(p.id)}
                      disabled={confirmProposalMutation.isPending}
                    >
                      {confirmProposalMutation.isPending && confirmProposalMutation.variables === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-xl h-10 w-10 p-0 text-slate-600 hover:text-primary hover:bg-white hover:shadow-sm"
                    onClick={() => router.push(`/itineraries/${p.itineraryId}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-xl h-10 w-10 p-0 text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-sm"
                    onClick={() => downloadPdf.mutate(p)}
                    disabled={downloadingId === p.id}
                  >
                    {downloadingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-xl h-10 w-10 p-0 text-slate-600 hover:text-orange-600 hover:bg-white hover:shadow-sm"
                    onClick={() => setEmailModalOpenId(p.id)}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-xl h-10 w-10 p-0 text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm"
                    onClick={() => handleWaModalOpen(p.id)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this proposal version?')) {
                        deleteProposalMutation.mutate(p.id);
                      }
                    }}
                    disabled={deleteProposalMutation.isPending}
                  >
                    {deleteProposalMutation.isPending && deleteProposalMutation.variables === p.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <Dialog open={waModalOpenId === p.id} onOpenChange={(open) => !open && setWaModalOpenId(null)}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                        Send via WhatsApp
                      </DialogTitle>
                    </DialogHeader>
                    {manualWaLink ? (
                      <div className="space-y-4 py-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                          <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /></div>
                          <p className="text-sm font-medium text-emerald-900 leading-relaxed">
                            Since automated WhatsApp is disabled, please click the button below to open WhatsApp on your device with the proposal link.
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-black shadow-lg shadow-emerald-600/20"
                          onClick={() => {
                            window.open(manualWaLink, '_blank');
                            setWaModalOpenId(null);
                            setManualWaLink(null);
                          }}
                        >
                          Open WhatsApp Now
                        </Button>
                      </div>
                    ) : (
                      <>
                        <DialogDescription>
                          Dispatch a pre-approved Interakt template with the attached Proposal PDF link directly to the customer.
                        </DialogDescription>
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
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <InsertItineraryModal 
        isOpen={showInsertModal} 
        onClose={() => setShowInsertModal(false)}
        onSelect={(id) => insertProposalMutation.mutate(id)}
        isInserting={insertProposalMutation.isPending}
      />

      {emailModalOpenId && (
        <ProposalEmailComposeModal 
          isOpen={true}
          onClose={() => setEmailModalOpenId(null)}
          proposalId={emailModalOpenId}
          customerName={customerName}
          customerEmail={customerEmail}
        />
      )}
    </div>
  );
}

function InsertItineraryModal({ isOpen, onClose, onSelect, isInserting }: { isOpen: boolean, onClose: () => void, onSelect: (id: string) => void, isInserting: boolean }) {
  const [search, setSearch] = useState('');
  
  const { data: itineraries, isLoading } = useQuery({
    queryKey: ['itineraries', 'published', search],
    queryFn: async () => {
      const res = await api.get(`/itineraries?status=published&search=${search}`);
      return res.data.data;
    },
    enabled: isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black">Insert Itinerary</DialogTitle>
          <DialogDescription className="font-medium">
            Search and select a master template to clone into this lead.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or destination..." 
              className="pl-10 rounded-xl h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>
          ) : itineraries?.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground font-medium">No templates found matching your search.</p>
            </div>
          ) : (
            itineraries?.map((it: any) => (
              <div 
                key={it.id} 
                className="p-3 border rounded-2xl hover:border-primary hover:bg-primary/[0.02] cursor-pointer transition-all flex items-center gap-4 group"
                onClick={() => !isInserting && onSelect(it.id)}
              >
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border group-hover:border-primary/20">
                  {it.coverPhotoUrl ? (
                    <img src={it.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{it.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {it.daysCount || 0} Days • {it.destination || 'Global'}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="rounded-lg font-bold group-hover:bg-primary group-hover:text-white transition-all">
                  Insert
                </Button>
              </div>
            ))
          )}
        </div>

        {isInserting && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg z-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
            <p className="text-sm font-black text-primary animate-pulse tracking-widest uppercase">Cloning Template...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function QueryPaymentsSection({ queryId }: { queryId: string }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', queryId],
    queryFn: async () => {
      const res = await api.get(`/payments?queryId=${queryId}`);
      return res.data.data.payments;
    }
  });

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  const totalPaid = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm">
        <div>
          <h3 className="text-lg font-semibold">Payments Received</h3>
          <p className="text-sm text-muted-foreground">Total Paid: <span className="font-medium text-emerald-600 inline-flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{totalPaid.toLocaleString('en-IN')}</span></p>
        </div>
        <Button onClick={() => setIsPaymentModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Record Deposit
        </Button>
      </div>
      {!payments || payments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No Payments Yet</h3>
          <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" /> Record Initial Deposit
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p: any) => (
            <div key={p.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg"><IndianRupee className="w-4 h-4 mr-0.5 inline" /> {Number(p.amount).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{p.mode} • {new Date(p.paymentDate).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
      <PaymentEntryModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} queryId={queryId} />
    </div>
  );
}

