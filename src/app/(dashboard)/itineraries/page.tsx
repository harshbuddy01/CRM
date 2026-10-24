'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarRange, Loader2, Search, Plus, Copy, Trash2,
  Edit3, MapPin, Clock, Eye, Image as ImageIcon,
  FileText, Share2, MoreHorizontal, CheckCircle, XCircle, Lock, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

interface ClientLifecycle {
  status: 'in_progress' | 'confirmed' | 'draft' | 'completed' | 'lost';
  badgeLabel: string;
  badgeStyle: string;
  tagLabel: string;
  tagStyle: string;
  isEditable: boolean;
  lockReason?: string;
}

function getClientItineraryLifecycle(item: any): ClientLifecycle {
  const proposal = item.proposals?.[0];
  const query = proposal?.query;
  const tour = proposal?.tours?.[0];

  // 1. Check if Lost or Invalid
  if (query?.status === 'lost' || query?.status === 'invalid') {
    return {
      status: 'lost',
      badgeLabel: '✕ Lost',
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
      tagLabel: `✕ LOST — ${query?.name || 'Inquiry'}`,
      tagStyle: 'bg-rose-50 text-rose-700 border-rose-200',
      isEditable: false,
      lockReason: 'Lead marked as Lost in CRM — editing locked'
    };
  }

  const now = new Date();
  const endDate = tour?.endDate ? new Date(tour.endDate) : (proposal?.travelDateTo ? new Date(proposal.travelDateTo) : (query?.travelDateTo ? new Date(query.travelDateTo) : null));
  const startDate = tour?.startDate ? new Date(tour.startDate) : (proposal?.travelDateFrom ? new Date(proposal.travelDateFrom) : (query?.travelDateFrom ? new Date(query.travelDateFrom) : null));

  // 2. Check if Completed
  const isPastTour = endDate && endDate < now;
  if (tour?.status === 'completed' || query?.status === 'completed' || (proposal?.status === 'confirmed' && isPastTour)) {
    return {
      status: 'completed',
      badgeLabel: '✓ Completed',
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      tagLabel: `✓ COMPLETED — ${query?.name || 'Tour'}`,
      tagStyle: 'bg-slate-50 text-slate-700 border-slate-200',
      isEditable: false,
      lockReason: 'Tour completed — historical itinerary is locked'
    };
  }

  // 3. Check if In Progress / On Tour (Current ongoing trip)
  const isOngoing = startDate && endDate && startDate <= now && now <= endDate;
  if (tour?.status === 'running' || query?.status === 'in_progress' || (proposal?.status === 'confirmed' && isOngoing)) {
    return {
      status: 'in_progress',
      badgeLabel: '✈ On Tour',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 font-bold',
      tagLabel: `✈ ON TOUR — ${query?.name || 'Traveler'}`,
      tagStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      isEditable: true
    };
  }

  // 4. Check if Confirmed (Upcoming booked tour)
  if (proposal?.status === 'confirmed' || query?.status === 'confirmed' || tour?.status === 'upcoming') {
    return {
      status: 'confirmed',
      badgeLabel: '✓ Confirmed',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      tagLabel: `✓ CONFIRMED — ${query?.name || 'Booked'}`,
      tagStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isEditable: true
    };
  }

  // 5. Default Draft
  return {
    status: 'draft',
    badgeLabel: 'Draft',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    tagLabel: `● For: ${query?.name || 'Draft'}`,
    tagStyle: 'bg-blue-50 text-blue-700 border-blue-100',
    isEditable: true
  };
}

const LIFECYCLE_ORDER: Record<string, number> = {
  in_progress: 1,
  confirmed: 2,
  draft: 3,
  completed: 4,
  lost: 5,
};

export default function ItinerariesPage() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewType, setViewType] = useState<'templates' | 'clients'>('templates');
  const [clientFilter, setClientFilter] = useState<'all' | 'in_progress' | 'confirmed' | 'draft' | 'completed' | 'lost'>('all');

  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['itineraries', searchTerm, viewType],
    queryFn: async () => {
      const params: any = { isTemplate: viewType === 'templates' };
      if (searchTerm) params.search = searchTerm;
      const res = await api.get('/itineraries', { params });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/itineraries/${id}`),
    onSuccess: () => {
      toast.success('Itinerary deleted');
      qc.invalidateQueries({ queryKey: ['itineraries'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, asTemplate }: { id: string; asTemplate: boolean }) =>
      api.post(`/itineraries/${id}/duplicate`, { asTemplate }),
    onSuccess: () => {
      toast.success('Itinerary duplicated');
      qc.invalidateQueries({ queryKey: ['itineraries'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to duplicate'),
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) return toast.error('Title is required');
    setCreating(true);
    try {
      const res = await api.post('/itineraries', {
        title: newTitle.trim(),
        days: [{ title: 'Day 1' }],
        isTemplate: true // New ones are templates
      });
      toast.success('Itinerary created');
      setShowCreate(false);
      setNewTitle('');
      qc.invalidateQueries({ queryKey: ['itineraries'] });
      const id = res.data?.data?.id;
      if (id) {
        router.push(`/itineraries/${id}`);
      } else {
        toast.error('Invalid created itinerary ID');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const rawItems = data?.data || [];

  // Calculate dynamic lifecycle counts for Client Working Copies
  const clientCounts = useMemo(() => {
    const counts = { all: rawItems.length, in_progress: 0, confirmed: 0, draft: 0, completed: 0, lost: 0 };
    rawItems.forEach((item: any) => {
      const lc = getClientItineraryLifecycle(item);
      counts[lc.status] = (counts[lc.status] || 0) + 1;
    });
    return counts;
  }, [rawItems]);

  // Sort and filter items
  const items = useMemo(() => {
    if (viewType === 'templates') return rawItems;

    // Filter by client lifecycle status
    let filtered = rawItems;
    if (clientFilter !== 'all') {
      filtered = rawItems.filter((item: any) => getClientItineraryLifecycle(item).status === clientFilter);
    }

    // Smart Lifecycle Sort: In Progress (1) -> Confirmed (2) -> Drafts (3) -> Completed (4) -> Lost (5)
    return [...filtered].sort((a: any, b: any) => {
      const orderA = LIFECYCLE_ORDER[getClientItineraryLifecycle(a).status] || 99;
      const orderB = LIFECYCLE_ORDER[getClientItineraryLifecycle(b).status] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [rawItems, viewType, clientFilter]);

  const stats = {
    total: rawItems.length,
    draft: rawItems.filter((i: any) => i.status === 'draft').length,
    published: rawItems.filter((i: any) => i.status === 'published').length,
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">
            Itinerary Builder
          </h1>
          <p className="text-muted-foreground mt-2 text-xs md:text-sm font-medium">
            Create and manage master destination templates and working client drafts.
          </p>
        </div>
        {viewType === 'templates' && (
          <Button
            className="rounded-xl px-6 font-bold shadow-lg shadow-primary/10"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        )}
      </div>

      {/* View Toggles & Client Lifecycle Filters */}
      <div className="space-y-3">
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-max">
          <button
            onClick={() => { setViewType('templates'); setClientFilter('all'); }}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              viewType === 'templates' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Master Templates
          </button>
          <button
            onClick={() => setViewType('clients')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              viewType === 'clients' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Client Working Copies
          </button>
        </div>

        {/* Client Working Copies Lifecycle Filter Bar */}
        {viewType === 'clients' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
            {[
              { id: 'all', label: `All (${clientCounts.all})`, color: 'hover:border-slate-300' },
              { id: 'in_progress', label: `✈ On Tour (${clientCounts.in_progress})`, color: 'text-blue-700 border-blue-200 bg-blue-50/50' },
              { id: 'confirmed', label: `✓ Confirmed (${clientCounts.confirmed})`, color: 'text-emerald-700 border-emerald-200 bg-emerald-50/50' },
              { id: 'draft', label: `Drafts (${clientCounts.draft})`, color: 'text-amber-700 border-amber-200 bg-amber-50/50' },
              { id: 'completed', label: `✓ Completed (${clientCounts.completed})`, color: 'text-slate-700 border-slate-200 bg-slate-50/50' },
              { id: 'lost', label: `✕ Lost (${clientCounts.lost})`, color: 'text-rose-700 border-rose-200 bg-rose-50/50' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setClientFilter(f.id as any)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                  clientFilter === f.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : cn("bg-white text-slate-600 border-slate-200 hover:bg-slate-50", f.color)
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {viewType === 'templates' ? (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            { label: 'Total', value: stats.total, icon: CalendarRange, text: 'text-blue-600/70', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Drafts', value: stats.draft, icon: Edit3, text: 'text-amber-600/70', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
            { label: 'Published', value: stats.published, icon: Share2, text: 'text-emerald-600/70', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          ].map((item) => (
            <Card key={item.label} className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn('text-[10px] md:text-xs font-black uppercase tracking-widest', item.text)}>{item.label}</p>
                    <h3 className="text-lg md:text-2xl font-black mt-1 text-slate-900">{item.value}</h3>
                  </div>
                  <div className={cn('p-2 rounded-xl shadow-sm', item.bg, item.iconColor)}>
                    <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Total Copies', value: clientCounts.all, icon: CalendarRange, text: 'text-blue-600/70', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Active / On Tour', value: clientCounts.in_progress + clientCounts.confirmed, icon: Compass, text: 'text-emerald-600/70', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Completed Tours', value: clientCounts.completed, icon: CheckCircle, text: 'text-slate-600/70', bg: 'bg-slate-100', iconColor: 'text-slate-600' },
            { label: 'Lost Inquiries', value: clientCounts.lost, icon: XCircle, text: 'text-rose-600/70', bg: 'bg-rose-50', iconColor: 'text-rose-600' },
          ].map((item) => (
            <Card key={item.label} className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn('text-[10px] md:text-xs font-black uppercase tracking-widest', item.text)}>{item.label}</p>
                    <h3 className="text-lg md:text-2xl font-black mt-1 text-slate-900">{item.value}</h3>
                  </div>
                  <div className={cn('p-2 rounded-xl shadow-sm', item.bg, item.iconColor)}>
                    <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search itineraries..."
            className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Itinerary</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. Sikkim 5N6D Premium Package"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-11 rounded-xl"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !creating) handleCreate();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="rounded-xl font-bold">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Itinerary Cards Grid */}
      {isError ? (
        <div className="border-2 border-dashed rounded-2xl py-16 text-center text-red-500">
          <p className="font-bold text-lg">Error loading itineraries</p>
          <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl py-16 text-center">
          <CalendarRange className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-slate-900">
            {clientFilter !== 'all' ? `No itineraries with status "${clientFilter}"` : 'No itineraries yet'}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-6 text-sm">
            {clientFilter !== 'all'
              ? 'Try switching the filter to "All" to view all available working copies.'
              : 'Start building beautiful day-by-day travel itineraries with images and pricing.'}
          </p>
          {clientFilter !== 'all' ? (
            <Button variant="outline" className="rounded-xl font-bold" onClick={() => setClientFilter('all')}>
              Show All Itineraries
            </Button>
          ) : (
            <Button className="rounded-xl px-8 font-bold" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create First Itinerary
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item: any) => {
            const destinations = item.days
              ?.map((d: any) => d.destination?.name)
              .filter(Boolean)
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

            const lifecycle = viewType === 'clients' ? getClientItineraryLifecycle(item) : null;

            return (
              <Card
                key={item.id}
                className={cn(
                  "group bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 border",
                  lifecycle?.status === 'lost' && "border-rose-300 bg-rose-50/15",
                  lifecycle?.status === 'completed' && "border-slate-300 bg-slate-50/25",
                  lifecycle?.status === 'in_progress' && "border-blue-300 shadow-blue-500/5",
                  lifecycle?.status === 'confirmed' && "border-emerald-300 shadow-emerald-500/5",
                  (!lifecycle || lifecycle.status === 'draft') && "border-slate-200"
                )}
              >
                {/* Cover Photo */}
                <div className="relative h-40 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 overflow-hidden">
                  {item.coverPhotoUrl ? (
                    <img src={item.coverPhotoUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  {/* Status Badge */}
                  {lifecycle ? (
                    <span className={cn(
                      'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border shadow-sm',
                      lifecycle.badgeStyle
                    )}>
                      {lifecycle.badgeLabel}
                    </span>
                  ) : (
                    <span className={cn(
                      'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border shadow-sm',
                      STATUS_STYLES[item.status] || STATUS_STYLES.draft
                    )}>
                      {item.status}
                    </span>
                  )}

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center gap-2">
                    {lifecycle && !lifecycle.isEditable ? (
                      <Button
                        disabled
                        size="sm"
                        title={lifecycle.lockReason}
                        className="rounded-xl bg-slate-900/75 backdrop-blur-sm text-white/90 cursor-not-allowed shadow-lg font-bold h-9 border border-white/20"
                      >
                        <Lock className="w-3.5 h-3.5 mr-1.5" />
                        {lifecycle.status === 'lost' ? 'Locked (Lost)' : 'Locked (Completed)'}
                      </Button>
                    ) : (
                      <Link href={`/itineraries/${item.id}`}>
                        <Button size="sm" className="rounded-xl bg-white text-slate-900 hover:bg-white/90 shadow-lg font-bold h-9">
                          <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    {lifecycle && item.proposals?.[0]?.query && (
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border",
                          lifecycle.tagStyle
                        )}>
                          {lifecycle.status === 'lost' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          ) : lifecycle.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                          ) : lifecycle.status === 'in_progress' ? (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                          ) : lifecycle.status === 'confirmed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          )}
                          {lifecycle.tagLabel}
                          <span className="opacity-60 text-[10px] uppercase font-black tracking-wider ml-1">
                            {item.proposals[0].query.queryCode}
                          </span>
                        </span>
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1">{item.title}</h3>
                    {destinations?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        {destinations.slice(0, 3).map((dest: string) => (
                          <span key={dest} className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
                            {dest}
                          </span>
                        ))}
                        {destinations.length > 3 && (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            +{destinations.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item._count?.days || item.days?.length || 0} days
                    </span>
                    {item.perPersonCost && (
                      <span className="font-bold text-slate-800">
                        ₹{Number(item.perPersonCost).toLocaleString('en-IN')}/person
                      </span>
                    )}
                    <span className="ml-auto text-[10px]">
                      {item.createdAt && format(new Date(item.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <Link href={`/itineraries/${item.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full rounded-lg h-8 text-xs font-bold text-slate-600 hover:text-primary">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Open
                      </Button>
                    </Link>
                    <Button
                      variant="ghost" size="icon"
                      title="Duplicate as new working copy"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600"
                      onClick={() => duplicateMutation.mutate({ id: item.id, asTemplate: viewType === 'templates' })}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
                      onClick={() => {
                        if (confirm('Delete this itinerary?')) deleteMutation.mutate(item.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
