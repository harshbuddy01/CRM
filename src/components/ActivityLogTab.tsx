'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Activity, Search, RefreshCw, Clock, Globe } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// ─── Action label map ───────────────────────────────────────
const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'query.created':       { label: 'Created Lead',        color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'query.updated':       { label: 'Updated Lead',        color: 'text-blue-700',    bg: 'bg-blue-100' },
  'query.status_changed':{ label: 'Changed Status',      color: 'text-violet-700',  bg: 'bg-violet-100' },
  'query.assigned':      { label: 'Assigned Lead',       color: 'text-indigo-700',  bg: 'bg-indigo-100' },
  'query.deleted':       { label: 'Deleted Lead',        color: 'text-red-700',     bg: 'bg-red-100' },
  'query.email_sent':    { label: 'Sent Email',          color: 'text-sky-700',     bg: 'bg-sky-100' },
  'note.created':        { label: 'Added Note',          color: 'text-amber-700',   bg: 'bg-amber-100' },
  'note.deleted':        { label: 'Deleted Note',        color: 'text-red-700',     bg: 'bg-red-100' },
  'proposal.created':    { label: 'Created Proposal',    color: 'text-cyan-700',    bg: 'bg-cyan-100' },
  'proposal.sent':       { label: 'Sent Proposal',       color: 'text-teal-700',    bg: 'bg-teal-100' },
  'proposal.updated':    { label: 'Updated Proposal',    color: 'text-blue-700',    bg: 'bg-blue-100' },
  'payment.created':     { label: 'Recorded Payment',    color: 'text-green-700',   bg: 'bg-green-100' },
  'payment.deleted':     { label: 'Deleted Payment',     color: 'text-red-700',     bg: 'bg-red-100' },
  'tour.created':        { label: 'Created Tour',        color: 'text-orange-700',  bg: 'bg-orange-100' },
  'tour.updated':        { label: 'Updated Tour',        color: 'text-orange-700',  bg: 'bg-orange-100' },
  'user.login':          { label: 'Logged In',           color: 'text-slate-700',   bg: 'bg-slate-100' },
  'user.logout':         { label: 'Logged Out',          color: 'text-slate-500',   bg: 'bg-slate-100' },
  'user.created':        { label: 'Created User',        color: 'text-purple-700',  bg: 'bg-purple-100' },
  'user.updated':        { label: 'Updated User',        color: 'text-purple-700',  bg: 'bg-purple-100' },
  'permission.denied':   { label: 'Access Denied',       color: 'text-red-700',     bg: 'bg-red-100' },
};

function getActionMeta(action: string) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const [module, verb] = action.split('.');
  return {
    label: `${verb?.replace(/_/g, ' ') ?? action} (${module})`,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  };
}

const MODULE_OPTIONS = [
  { value: 'all',      label: 'All Modules' },
  { value: 'query',    label: 'Leads / Queries' },
  { value: 'note',     label: 'Notes' },
  { value: 'proposal', label: 'Proposals' },
  { value: 'payment',  label: 'Payments' },
  { value: 'tour',     label: 'Tours' },
  { value: 'user',     label: 'Users' },
  { value: 'itinerary',label: 'Itineraries' },
  { value: 'system',   label: 'System' },
];

interface ActivityLogTabProps {
  /** If true, shows all team activity with user filter. If false, shows only current user's activity. */
  isAdmin?: boolean;
}

export function ActivityLogTab({ isAdmin = false }: ActivityLogTabProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [page, setPage] = useState(1);
  const [isLivePulse, setIsLivePulse] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Build query params
  const params = new URLSearchParams();
  if (debouncedSearch) params.set('search', debouncedSearch);
  if (isAdmin && selectedUser !== 'all') params.set('userId', selectedUser);
  if (selectedModule !== 'all') params.set('entityType', selectedModule);
  params.set('page', String(page));
  params.set('limit', '30');

  // Choose endpoint based on role
  const endpoint = isAdmin
    ? `/admin/activity-logs?${params.toString()}`
    : `/admin/my-activity-logs?${params.toString()}`;

  // Fetch logs with 30-second auto-refresh
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: [isAdmin ? 'admin-activity-logs' : 'my-activity-logs', debouncedSearch, selectedUser, selectedModule, page],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Fetch users for filter dropdown (admin only)
  const { data: filterUsers } = useQuery({
    queryKey: ['admin-activity-log-users'],
    queryFn: () => api.get('/admin/activity-logs/users').then(r => r.data.data),
    staleTime: 60000,
    enabled: isAdmin, // Only fetch user list for admins
  });

  // Pulse animation on each refetch
  useEffect(() => {
    setIsLivePulse(true);
    const t = setTimeout(() => setIsLivePulse(false), 1200);
    return () => clearTimeout(t);
  }, [dataUpdatedAt]);

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;
  const retentionDays = data?.retentionDays ?? 7;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2.5 h-2.5 rounded-full bg-emerald-500 transition-all duration-300',
            isLivePulse ? 'scale-150 opacity-100' : 'scale-100 opacity-60',
            isFetching && 'animate-pulse'
          )} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Live · Auto-refreshes every 30s
          </span>
          {isFetching && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
          <Clock className="w-3 h-3" />
          Last {retentionDays} days only — older logs are auto-purged nightly
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            className="w-full pl-9 pr-4 h-9 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* User filter — admin only */}
        {isAdmin && (
          <select
            value={selectedUser}
            onChange={e => { setSelectedUser(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
          >
            <option value="all">All Team Members</option>
            {(filterUsers ?? []).map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        {/* Module filter */}
        <select
          value={selectedModule}
          onChange={e => { setSelectedModule(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
        >
          {MODULE_OPTIONS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Stats summary */}
      {pagination && (
        <p className="text-xs text-muted-foreground">
          Showing <strong>{logs.length}</strong> of <strong>{pagination.total}</strong> activity entries
        </p>
      )}

      {/* Log Feed */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Activity className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-muted-foreground">No activity found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {debouncedSearch || selectedUser !== 'all' || selectedModule !== 'all'
                ? 'Try adjusting your filters'
                : isAdmin
                  ? 'Team activity will appear here as actions are performed'
                  : 'Your activity will appear here as you perform actions'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log: any, idx: number) => {
              const meta = getActionMeta(log.action);
              const userName = log.user?.name ?? 'System';
              const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              const isNewEntry = idx === 0 && isLivePulse;

              return (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-3 p-4 transition-all duration-500',
                    isNewEntry && 'bg-emerald-50/60',
                    'hover:bg-slate-50/60'
                  )}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {log.user?.profilePhoto ? (
                      <img
                        src={log.user.profilePhoto}
                        alt={userName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold ring-1 ring-border">
                        {userInitials}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-semibold text-sm text-slate-900 truncate">{userName}</span>
                      {log.user?.role?.label && (
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{log.user.role.label}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Action badge */}
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', meta.bg, meta.color)}>
                        {meta.label}
                      </span>
                      {/* Entity */}
                      {log.entityType && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {log.entityType}
                          {log.entityId ? ` #${log.entityId.slice(-8)}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Old → New value (if present) */}
                    {log.newValue && typeof log.newValue === 'object' && Object.keys(log.newValue).length > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-1 font-mono bg-slate-50 rounded px-2 py-1 border max-w-md truncate">
                        {Object.entries(log.newValue).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="mr-2">
                            <span className="text-slate-400">{k}:</span> <span className="text-slate-700">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp + IP */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        <span className="text-slate-300 mx-1">·</span>
                        {format(new Date(log.createdAt), 'dd MMM, hh:mm a')}
                      </span>
                      {log.ipAddress && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {log.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* New badge */}
                  {isNewEntry && (
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full">NEW</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!pagination.hasMore}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
