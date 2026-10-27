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
  ListFilter,
  Phone, 
  MapPin, 
  Users, 
  Calendar, 
  X, 
  ChevronDown, 
  MessageCircle,
  RotateCcw,
  IndianRupee,
  LayoutGrid
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

// Logical sales sequence tabs — clean, minimal, without tacky emojis
const SEQUENCE_STAGES = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'lost', label: 'Lost' },
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
      toast.success(`Lead moved to ${formatted}`);
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
  const handleWhatsApp = (e: React.MouseEvent, phone: string, customerName: string, destination?: string | null) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const destText = destination ? ` regarding your trip to ${destination}` : '';
    const message = `Hello ${customerName}, greetings from Imagica Holidays! We received your inquiry${destText}. How can we assist you with your itinerary today?`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Helper: Resolve status metadata
  const getStatusMeta = (code: string) => {
    const s = statusSettings?.find((st: any) => st.code === code);
    if (s) return { label: s.label, color: s.colorHex };
    
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

  // Helper: Get user initials
  const getInitials = (name?: string | null) => {
    if (!name) return '—';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  return (
    <div className="space-y-4 p-4 md:p-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* 1. Sleek Top Bar (Title, View Switcher & Action) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Leads
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {statusCounts.all || totalCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher: List / Board */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-md bg-white text-slate-900 font-semibold shadow-xs flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-slate-700" />
              List
            </span>
            <Link 
              href="/pipeline" 
              className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Columns3 className="w-3.5 h-3.5" />
              Board
            </Link>
          </div>

          {user?.permissions['query.create'] && (
            <Link href="/queries/new">
              <Button className="h-9 px-3.5 rounded-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs text-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                New Lead
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Unified Sequence & Filter Toolbar */}
      <div className="space-y-3 pt-1">
        {/* Sales Sequence Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
          {SEQUENCE_STAGES.map((st) => {
            const isActive = status === st.id;
            const count = statusCounts[st.id] ?? 0;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setStatus(st.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {/* Instant Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search leads, phone, destination..."
              className="pl-8 pr-7 h-8.5 text-xs rounded-lg border-slate-200 focus-visible:ring-slate-400"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Source & Agent Selectors */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Source */}
            <Select 
              value={leadSource} 
              onValueChange={(val) => {
                setLeadSource(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8.5 text-xs w-[130px] rounded-lg border-slate-200 font-medium">
                <SelectValue placeholder="Source: All" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all" className="text-xs">All Sources</SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Agent (Admins/Managers) */}
            {user?.permissions['query.view_all'] && agentsData && agentsData.length > 0 && (
              <Select 
                value={assignedTo} 
                onValueChange={(val) => {
                  setAssignedTo(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs w-[140px] rounded-lg border-slate-200 font-medium">
                  <SelectValue placeholder="Agent: All" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all" className="text-xs">All Agents</SelectItem>
                  {agentsData.map((ag: any) => (
                    <SelectItem key={ag.id} value={ag.id} className="text-xs">
                      {ag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8.5 px-2.5 text-xs text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Modern, Sleek Leads Table */}
      <div className="space-y-3">
        {isLoading && !queries.length ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200/80">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Loading leads...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-600 bg-red-50/50 rounded-xl border border-red-200 text-xs">
            {error instanceof Error ? error.message : 'Failed to load inquiries'}
          </div>
        ) : queries.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200/80 flex flex-col items-center justify-center space-y-2">
            <Search className="w-6 h-6 text-slate-300 mb-1" />
            <p className="text-sm font-semibold text-slate-700">No leads found</p>
            <p className="text-xs text-slate-400">
              {hasActiveFilters ? 'Try changing your search or filters' : 'No leads in this stage.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 text-xs rounded-lg">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60 border-b border-slate-200/80">
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider py-3 pl-4">
                      Client
                    </TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
                      Destination & Pax
                    </TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
                      Travel Dates
                    </TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
                      Budget
                    </TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
                      Stage
                    </TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
                      Owner
                    </TableHead>
                    <TableHead className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider text-right pr-4">
                      Contact
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
                        onClick={() => router.push(`/queries/${q.id}`)}
                        className="hover:bg-slate-50/90 transition-colors border-b border-slate-100 cursor-pointer group"
                      >
                        {/* 1. Client & Lead Code */}
                        <TableCell className="py-3.5 pl-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                                {q.name}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                {q.queryCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{q.phone}</span>
                              {q.leadSource && (
                                <>
                                  <span>·</span>
                                  <span className="capitalize">{q.leadSource}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Destination & Pax */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-medium text-xs text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{q.destination || 'Open / Unset'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {q.adults || 1} Adult{(q.adults || 1) > 1 ? 's' : ''}
                              {q.children ? `, ${q.children} Child` : ''}
                            </div>
                          </div>
                        </TableCell>

                        {/* 3. Travel Dates */}
                        <TableCell>
                          <div className="text-xs text-slate-700">
                            {q.travelDateFrom ? (
                              <div className="space-y-0.5">
                                <div>
                                  {new Date(q.travelDateFrom).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                  {q.travelDateTo && ` – ${new Date(q.travelDateTo).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}`}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(q.travelDateFrom).getFullYear()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Flexible / Not set</span>
                            )}
                          </div>
                        </TableCell>

                        {/* 4. Budget & Proposal */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-xs text-slate-800">
                              {q.budget ? `₹${Number(q.budget).toLocaleString('en-IN')}` : '—'}
                            </div>
                            {proposalCount > 0 && (
                              <span className="text-[10px] font-medium text-purple-600">
                                {proposalCount} Proposal{proposalCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* 5. Stage & Sequence (Quick Status Dropdown) */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {allowedTransitions.length > 0 && user?.permissions['query.status_change'] ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all hover:ring-2 hover:ring-slate-200"
                                  style={{
                                    backgroundColor: `${statusMeta.color}12`,
                                    color: statusMeta.color,
                                    borderColor: `${statusMeta.color}30`,
                                  }}
                                  title="Change lead stage"
                                >
                                  <div 
                                    className="w-1.5 h-1.5 rounded-full" 
                                    style={{ backgroundColor: statusMeta.color }} 
                                  />
                                  <span>{statusMeta.label}</span>
                                  <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-44 rounded-xl p-1">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                                  Change Stage
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {allowedTransitions.map((targetCode) => {
                                  const targetMeta = getStatusMeta(targetCode);
                                  return (
                                    <DropdownMenuItem
                                      key={targetCode}
                                      onClick={() => updateStatusMutation.mutate({ id: q.id, newStatus: targetCode })}
                                      className="text-xs font-medium cursor-pointer rounded-lg px-2.5 py-1.5 flex items-center gap-2"
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
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: `${statusMeta.color}12`,
                                color: statusMeta.color,
                                borderColor: `${statusMeta.color}30`,
                              }}
                            >
                              <div 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: statusMeta.color }} 
                              />
                              <span>{statusMeta.label}</span>
                            </span>
                          )}
                        </TableCell>

                        {/* 6. Owner / Agent */}
                        <TableCell>
                          {q.assignedUser?.name ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                                {getInitials(q.assignedUser.name)}
                              </div>
                              <span className="text-xs text-slate-700 truncate max-w-[110px]">
                                {q.assignedUser.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Unassigned</span>
                          )}
                        </TableCell>

                        {/* 7. Fast Contact Actions */}
                        <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* WhatsApp Button */}
                            <button
                              onClick={(e) => handleWhatsApp(e, q.phone, q.name, q.destination)}
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title={`Chat with ${q.name} on WhatsApp`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Call Button */}
                            <a
                              href={`tel:${q.phone}`}
                              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                              title={`Call ${q.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2.5">
              {queries.map((q) => {
                const statusMeta = getStatusMeta(q.status);

                return (
                  <div
                    key={q.id}
                    onClick={() => router.push(`/queries/${q.id}`)}
                    className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-2.5 active:bg-slate-50 transition-colors"
                  >
                    {/* Top: Name, Lead Code, Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{q.name}</div>
                        <div className="text-[11px] text-slate-400">{q.queryCode} · {q.phone}</div>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${statusMeta.color}12`,
                          color: statusMeta.color,
                          borderColor: `${statusMeta.color}30`,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Middle: Destination & Budget */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{q.destination || 'No destination'}</span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        {q.budget ? `₹${Number(q.budget).toLocaleString('en-IN')}` : '—'}
                      </div>
                    </div>

                    {/* Bottom: Fast WhatsApp and Call */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <div className="text-[11px] text-slate-400">
                        {q.assignedUser?.name || 'Unassigned'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleWhatsApp(e, q.phone, q.name, q.destination)}
                          className="h-7 px-2.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <a
                          href={`tel:${q.phone}`}
                          className="h-7 px-2.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. Minimal Pagination Bar */}
      {!isError && queries.length > 0 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-800">{(page - 1) * Number(limit) + 1}–{Math.min(page * Number(limit), totalCount)}</span> of{' '}
            <span className="font-medium text-slate-800">{totalCount}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 rounded-lg text-xs font-medium border-slate-200"
            >
              Previous
            </Button>
            <span className="px-2 text-slate-700 font-semibold">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || isPlaceholderData}
              className="h-8 px-3 rounded-lg text-xs font-medium border-slate-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
