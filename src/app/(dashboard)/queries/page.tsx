'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PlusCircle, 
  Loader2, 
  Search, 
  Columns3, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ArrowUpRight, 
  MessageCircle,
  RotateCcw,
  IndianRupee
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TRANSITIONS, LEAD_SOURCES } from '@/lib/constants';

type QueryData = {
  id: string;
  queryCode: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
  destination: string | null;
  adults?: number;
  children?: number;
  budget?: number | string | null;
  leadSource?: string | null;
  travelDateFrom?: string | null;
  travelDateTo?: string | null;
  assignedTo?: string | null;
  assignedUser?: { id: string; name: string } | null;
  _count?: { proposals: number };
  createdAt: string;
};

// Logical sales sequence stages
const SALES_SEQUENCE = [
  { id: 'all', label: 'All Inquiries', icon: '📋' },
  { id: 'new', label: '1. New Leads', icon: '🆕' },
  { id: 'quoted', label: '2. Quoted', icon: '📝' },
  { id: 'negotiation', label: '3. Negotiation', icon: '💬' },
  { id: 'confirmed', label: '4. Confirmed', icon: '✅' },
  { id: 'in_progress', label: '5. In Progress', icon: '🚀' },
  { id: 'completed', label: '6. Completed', icon: '🏁' },
  { id: 'lost', label: 'Lost / Dropped', icon: '❌' },
];

export default function QueriesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState('15');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [leadSource, setLeadSource] = useState<string>('all');
  const [assignedTo, setAssignedTo] = useState<string>('all');

  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch queries with filter parameters
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['queries', page, limit, search, status, leadSource, assignedTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit,
      });
      if (search.trim()) params.append('search', search.trim());
      if (status && status !== 'all') params.append('status', status);
      if (leadSource && leadSource !== 'all') params.append('leadSource', leadSource);
      if (assignedTo && assignedTo !== 'all') params.append('assignedTo', assignedTo);

      const res = await api.get(`/queries?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch status settings for custom database colors & labels
  const { data: statusSettings } = useQuery({
    queryKey: ['status-settings'],
    queryFn: async () => {
      const res = await api.get('/status-settings');
      return res.data.data;
    },
  });

  // Fetch active sales agents for admin filter
  const { data: agentsData } = useQuery({
    queryKey: ['active-agents'],
    queryFn: async () => {
      try {
        const res = await api.get('/users/agents');
        return res.data.data;
      } catch {
        return [];
      }
    },
    enabled: !!user?.permissions['query.view_all'],
  });

  // Quick inline status transition mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await api.patch(`/queries/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: (_, variables) => {
      const formatted = variables.newStatus.replace('_', ' ').toUpperCase();
      toast.success(`Lead status updated to ${formatted}`);
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
    },
  });

  const queries: QueryData[] = data?.data?.queries || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalCount = data?.data?.total || 0;
  const statusCounts = data?.data?.statusCounts || {};

  // KPI Calculations
  const totalLeads = statusCounts.all || totalCount || 0;
  const newLeads = statusCounts.new || 0;
  const activePipeline = (statusCounts.quoted || 0) + (statusCounts.negotiation || 0);
  const confirmedLeads = statusCounts.confirmed || 0;

  // Has active filter applied
  const hasActiveFilters = Boolean(
    search.trim() || 
    status !== 'all' || 
    leadSource !== 'all' || 
    assignedTo !== 'all'
  );

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setLeadSource('all');
    setAssignedTo('all');
    setPage(1);
  };

  // Helper: Open WhatsApp with customer greeting
  const handleWhatsApp = (phone: string, customerName: string, destination?: string | null) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const destText = destination ? ` regarding your trip to ${destination}` : '';
    const message = `Hello ${customerName}, greetings from Imagica Holidays! We received your travel inquiry${destText}. How can we assist you with your itinerary today?`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Helper: Resolve status metadata
  const getStatusMeta = (code: string) => {
    const s = statusSettings?.find((st: any) => st.code === code);
    if (s) return { label: s.label, color: s.colorHex };
    
    // Fallbacks
    switch (code) {
      case 'new': return { label: 'New', color: '#2563eb' };
      case 'quoted': return { label: 'Quoted', color: '#7c3aed' };
      case 'negotiation': return { label: 'Negotiation', color: '#d97706' };
      case 'confirmed': return { label: 'Confirmed', color: '#16a34a' };
      case 'in_progress': return { label: 'In Progress', color: '#0891b2' };
      case 'completed': return { label: 'Completed', color: '#059669' };
      case 'lost': return { label: 'Lost', color: '#dc2626' };
      case 'invalid': return { label: 'Invalid', color: '#64748b' };
      default: return { label: code.replace('_', ' '), color: '#64748b' };
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Leads Directory
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {totalLeads} Total
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-xs md:text-sm">
            Track, prioritize, and advance incoming customer inquiries through your sales sequence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/pipeline">
            <Button 
              variant="outline" 
              className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900 transition-all text-xs"
            >
              <Columns3 className="w-4 h-4 mr-2 text-slate-500" />
              Pipeline View
            </Button>
          </Link>

          {user?.permissions['query.create'] && (
            <Link href="/queries/new">
              <Button className="h-10 px-5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95 text-xs">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Lead
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Executive Sales Sequence Pulse (Minimal Luxury Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Metric 1: Total Leads */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Leads</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalLeads}</div>
          <p className="text-[11px] text-slate-500 mt-1">In active inquiries</p>
        </Card>

        {/* Metric 2: New / Fresh */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">1. New Inquiries</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 tracking-tight">{newLeads}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Awaiting first contact</p>
        </Card>

        {/* Metric 3: Active Pipeline (Quoted + Negotiation) */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">2-3. Active Pipeline</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">{activePipeline}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Quoted & in discussion</p>
        </Card>

        {/* Metric 4: Confirmed Bookings */}
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">4. Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 tracking-tight">{confirmedLeads}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Won bookings closed</p>
        </Card>
      </div>

      {/* 3. Sales Sequence Stage Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {SALES_SEQUENCE.map((st) => {
          const isActive = status === st.id;
          const count = statusCounts[st.id] ?? 0;
          return (
            <button
              key={st.id}
              onClick={() => {
                setStatus(st.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Smart Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by customer, phone, ID, destination, or email..."
              className="pl-10 pr-9 h-10 rounded-xl border-slate-200 text-xs focus:ring-slate-900/10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button 
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Lead Source Filter */}
            <Select 
              value={leadSource} 
              onValueChange={(val) => {
                setLeadSource(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl border-slate-200 text-xs font-semibold">
                <SelectValue placeholder="Source: All" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs font-medium">All Sources</SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs font-medium">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assigned Agent Filter (For Admins / Managers) */}
            {user?.permissions['query.view_all'] && agentsData && agentsData.length > 0 && (
              <Select 
                value={assignedTo} 
                onValueChange={(val) => {
                  setAssignedTo(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-xl border-slate-200 text-xs font-semibold">
                  <SelectValue placeholder="Agent: All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-medium">All Agents</SelectItem>
                  {agentsData.map((ag: any) => (
                    <SelectItem key={ag.id} value={ag.id} className="text-xs font-medium">
                      {ag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Page Size Selector */}
            <Select 
              value={limit} 
              onValueChange={(val) => {
                setLimit(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[110px] h-10 rounded-xl border-slate-200 text-xs font-semibold">
                <SelectValue placeholder="15 / page" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="10" className="text-xs font-medium">10 / page</SelectItem>
                <SelectItem value="15" className="text-xs font-medium">15 / page</SelectItem>
                <SelectItem value="25" className="text-xs font-medium">25 / page</SelectItem>
                <SelectItem value="50" className="text-xs font-medium">50 / page</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 px-3 text-xs text-slate-500 hover:text-slate-900 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Leads Data Presentation */}
      <div className="space-y-4">
        {isLoading && !queries.length ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading leads sequence...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600 bg-red-50/50 rounded-2xl border border-red-200 shadow-sm text-sm">
            {error instanceof Error ? error.message : 'Failed to load inquiries'}
          </div>
        ) : queries.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">No inquiries found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'No leads currently in this stage.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="rounded-xl text-xs font-semibold">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600 py-3.5 pl-6">
                      Lead ID & Source
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600">
                      Customer & Pax
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600">
                      Destination & Dates
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600">
                      Budget & Proposal
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600">
                      Stage & Sequence
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600">
                      Fast Contact
                    </TableHead>
                    {user?.permissions['query.view_all'] && (
                      <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600">
                        Assigned To
                      </TableHead>
                    )}
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-600 text-right pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queries.map((q) => {
                    const statusMeta = getStatusMeta(q.status);
                    const allowedTransitions = TRANSITIONS[q.status] || [];
                    const proposalCount = q._count?.proposals || 0;

                    return (
                      <TableRow 
                        key={q.id} 
                        className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 group"
                      >
                        {/* 1. Lead ID & Source */}
                        <TableCell className="py-4 pl-6">
                          <div className="space-y-1">
                            <Link 
                              href={`/queries/${q.id}`} 
                              className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1"
                            >
                              <span>{q.queryCode}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <div className="flex items-center gap-2">
                              {q.leadSource && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                                  {q.leadSource}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {new Date(q.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Customer & Pax */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-sm">{q.name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>
                                {q.adults || 1} Adult{(q.adults || 1) > 1 ? 's' : ''}
                                {q.children ? `, ${q.children} Child` : ''}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* 3. Destination & Dates */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{q.destination || 'Not specified'}</span>
                            </div>
                            {q.travelDateFrom && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>
                                  {new Date(q.travelDateFrom).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                  {q.travelDateTo && ` - ${new Date(q.travelDateTo).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* 4. Budget & Proposal */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-bold text-xs text-slate-900 flex items-center">
                              {q.budget ? (
                                <>
                                  <IndianRupee className="w-3 h-3 text-slate-400 mr-0.5" />
                                  <span>{Number(q.budget).toLocaleString('en-IN')}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 font-normal text-[11px]">Budget not set</span>
                              )}
                            </div>
                            <div>
                              {proposalCount > 0 ? (
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  {proposalCount} Proposal{proposalCount > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">No proposals yet</span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* 5. Stage & Sequence (Quick Status Changer) */}
                        <TableCell>
                          {allowedTransitions.length > 0 && user?.permissions['query.status_change'] ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-xs hover:opacity-80 transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: `${statusMeta.color}15`,
                                    color: statusMeta.color,
                                    borderColor: `${statusMeta.color}35`,
                                  }}
                                  title="Click to advance sales stage"
                                >
                                  <span>{statusMeta.label}</span>
                                  <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48 rounded-xl p-1.5">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                                  Move to Next Stage:
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {allowedTransitions.map((targetCode) => {
                                  const targetMeta = getStatusMeta(targetCode);
                                  return (
                                    <DropdownMenuItem
                                      key={targetCode}
                                      onClick={() => updateStatusMutation.mutate({ id: q.id, newStatus: targetCode })}
                                      className="text-xs font-semibold cursor-pointer rounded-lg px-2.5 py-1.5 flex items-center gap-2 hover:bg-slate-50"
                                    >
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: targetMeta.color }} 
                                      />
                                      <span>{targetMeta.label}</span>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span
                              className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-xs"
                              style={{
                                backgroundColor: `${statusMeta.color}15`,
                                color: statusMeta.color,
                                borderColor: `${statusMeta.color}35`,
                              }}
                            >
                              {statusMeta.label}
                            </span>
                          )}
                        </TableCell>

                        {/* 6. Fast Contact (WhatsApp, Call, Mail) */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {/* WhatsApp Button */}
                            <button
                              onClick={() => handleWhatsApp(q.phone, q.name, q.destination)}
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors shadow-xs"
                              title={`Chat with ${q.name} on WhatsApp`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            {/* Call Button */}
                            <a
                              href={`tel:${q.phone}`}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                              title={`Call ${q.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* Email Button */}
                            {q.email && (
                              <a
                                href={`mailto:${q.email}`}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                                title={`Email ${q.email}`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </TableCell>

                        {/* 7. Assigned Agent */}
                        {user?.permissions['query.view_all'] && (
                          <TableCell className="text-xs">
                            {q.assignedUser?.name ? (
                              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="truncate max-w-[120px]">{q.assignedUser.name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* 8. Action */}
                        <TableCell className="text-right pr-6">
                          <Link href={`/queries/${q.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold hover:bg-slate-900 hover:text-white transition-all shadow-xs"
                            >
                              Open Lead →
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {queries.map((q) => {
                const statusMeta = getStatusMeta(q.status);

                return (
                  <Card
                    key={q.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Top Row: Lead Code, Source, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/queries/${q.id}`} 
                          className="font-black text-xs text-slate-900 tracking-tight hover:underline"
                        >
                          {q.queryCode}
                        </Link>
                        {q.leadSource && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                            {q.leadSource}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg border shadow-xs"
                        style={{
                          backgroundColor: `${statusMeta.color}15`,
                          color: statusMeta.color,
                          borderColor: `${statusMeta.color}35`,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Customer Info & Destination */}
                    <div className="space-y-1">
                      <div className="font-extrabold text-base text-slate-900 leading-snug">
                        {q.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {q.destination || 'No destination'}
                        </span>
                        <span>•</span>
                        <span>{q.adults || 1} Adult{(q.adults || 1) > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Budget & Fast Contact Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</div>
                        <div className="font-bold text-xs text-slate-800">
                          {q.budget ? `₹${Number(q.budget).toLocaleString('en-IN')}` : 'Not set'}
                        </div>
                      </div>

                      {/* Fast Contact Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleWhatsApp(q.phone, q.name, q.destination)}
                          className="h-9 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <a
                          href={`tel:${q.phone}`}
                          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-400 text-[11px]">
                        {q.assignedUser?.name ? `Assigned: ${q.assignedUser.name}` : 'Unassigned'}
                      </div>
                      <Link 
                        href={`/queries/${q.id}`} 
                        className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 6. Pagination Bar */}
      {!isError && queries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{(page - 1) * Number(limit) + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * Number(limit), totalCount)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{totalCount}</span> inquiries
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200"
            >
              Previous
            </Button>
            <div className="text-xs font-bold text-slate-700 px-2">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || isPlaceholderData}
              className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}