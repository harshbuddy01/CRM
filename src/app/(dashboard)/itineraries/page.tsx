'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarRange, Loader2, Search, Plus, Copy, Trash2,
  Edit3, MapPin, Clock, Eye, Image as ImageIcon,
  FileText, Share2, MoreHorizontal, CheckCircle,
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

export default function ItinerariesPage() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewType, setViewType] = useState<'templates' | 'clients'>('templates');

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
    mutationFn: (id: string) => api.post(`/itineraries/${id}/duplicate`),
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
      // Navigate to builder
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

  const items = data?.data || [];
  const total = data?.total || 0;

  const stats = {
    total: items.length,
    draft: items.filter((i: any) => i.status === 'draft').length,
    published: items.filter((i: any) => i.status === 'published').length,
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
        <Button
          className="rounded-xl px-6 font-bold shadow-lg shadow-primary/10"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      {/* View Toggles */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl w-max">
        <button
          onClick={() => setViewType('templates')}
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

      {/* Stats */}
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
          <h3 className="text-lg font-bold text-slate-900">No itineraries yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1 mb-6 text-sm">
            Start building beautiful day-by-day travel itineraries with images and pricing.
          </p>
          <Button className="rounded-xl px-8 font-bold" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create First Itinerary
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item: any) => {
            const destinations = item.days
              ?.map((d: any) => d.destination?.name)
              .filter(Boolean)
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

            return (
              <Card
                key={item.id}
                className="group bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
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
                  {viewType === 'clients' ? (
                    // Client Working Copies: Only show CONFIRMED (green) or DRAFT (amber)
                    item.proposals?.[0]?.status === 'confirmed' ? (
                      <span className={cn(
                        'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border shadow-sm',
                        STATUS_STYLES.confirmed
                      )}>
                        ✓ Confirmed
                      </span>
                    ) : (
                      <span className={cn(
                        'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border shadow-sm',
                        STATUS_STYLES.draft
                      )}>
                        Draft
                      </span>
                    )
                  ) : (
                    // Master Templates: Show actual status (draft/published)
                    <span className={cn(
                      'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border shadow-sm',
                      STATUS_STYLES[item.status] || STATUS_STYLES.draft
                    )}>
                      {item.status}
                    </span>
                  )}
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Link href={`/itineraries/${item.id}`}>
                      <Button size="sm" className="rounded-xl bg-white text-slate-900 hover:bg-white/90 shadow-lg font-bold h-9">
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    {viewType === 'clients' && item.proposals?.[0]?.query && (
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        {item.proposals[0].status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            CONFIRMED — {item.proposals[0].query.name} <span className="opacity-60 text-[10px] uppercase font-black tracking-wider ml-1">{item.proposals[0].query.queryCode}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            For: {item.proposals[0].query.name} <span className="opacity-60 text-[10px] uppercase font-black tracking-wider ml-1">{item.proposals[0].query.queryCode}</span>
                          </span>
                        )}
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
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600"
                      onClick={() => duplicateMutation.mutate(item.id)}
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
