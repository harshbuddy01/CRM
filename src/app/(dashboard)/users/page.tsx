'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { UserPlus, Shield, Edit2, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, KeyRound, Activity, Users, Search, Filter, RefreshCw, Clock, ChevronRight, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; label: string };
  isActive: boolean;
  isOnLeave: boolean;
  leaveUntil: string | null;
  maxLeads: number;
  mobileOnly: boolean;
  activeLeadCount: number;
  mobile: string | null;
  mobile2: string | null;
  department: string | null;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

const IMMORTAL_EMAILS = [
  'anish629028@gmail.com',
  'harshbuddy01@gmail.com',
  'amanasha481@gmail.com'
];

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
}

// ─── Action label map ───────────────────────────────────────
const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'query.created':       { label: 'Created Lead',        color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'query.updated':       { label: 'Updated Lead',        color: 'text-blue-700',    bg: 'bg-blue-100' },
  'query.status_changed':{ label: 'Changed Status',      color: 'text-violet-700',  bg: 'bg-violet-100' },
  'query.assigned':      { label: 'Assigned Lead',       color: 'text-indigo-700',  bg: 'bg-indigo-100' },
  'query.deleted':       { label: 'Deleted Lead',        color: 'text-red-700',     bg: 'bg-red-100' },
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
};

function getActionMeta(action: string) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  // Fallback: split on dot and humanize
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
];

// ─── Activity Log Tab ─────────────────────────────────────────
function ActivityLogTab() {
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
  if (selectedUser !== 'all') params.set('userId', selectedUser);
  if (selectedModule !== 'all') params.set('entityType', selectedModule);
  params.set('page', String(page));
  params.set('limit', '30');

  // Fetch logs with 30-second auto-refresh
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['admin-activity-logs', debouncedSearch, selectedUser, selectedModule, page],
    queryFn: () => api.get(`/admin/activity-logs?${params.toString()}`).then(r => r.data.data),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Fetch users for filter dropdown
  const { data: filterUsers } = useQuery({
    queryKey: ['admin-activity-log-users'],
    queryFn: () => api.get('/admin/activity-logs/users').then(r => r.data.data),
    staleTime: 60000,
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
            placeholder="Search by name, action, or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            className="w-full pl-9 pr-4 h-9 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* User filter */}
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
                : 'Team activity will appear here as actions are performed'}
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

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [expandedPermissions, setExpandedPermissions] = useState<string | null>(null);
  const [offboardingUser, setOffboardingUser] = useState<User | null>(null);

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(r => r.data.data),
  });

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => api.get('/users/roles').then(r => r.data.data),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreateForm(false);
      toast.success('User created successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUserId(null);
      toast.success('User updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update user'),
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, reassignToId }: { id: string; reassignToId: string }) => api.delete(`/users/${id}`, { data: { reassignToId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOffboardingUser(null);
      toast.success('User deactivated and workload re-assigned');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to deactivate user'),
  });

  const [activeTab, setActiveTab] = useState<'team' | 'activity'>('team');

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage team members, roles, permissions, and live activity tracking</p>
        </div>
        {activeTab === 'team' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-xl w-full sm:w-auto h-11 sm:h-9 shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 border-b">
        <button
          onClick={() => setActiveTab('team')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px',
            activeTab === 'team'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-4 h-4" />
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px',
            activeTab === 'activity'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Activity className="w-4 h-4" />
          Activity Log
          {/* Live pulse dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Activity Log Tab */}
      {activeTab === 'activity' && <ActivityLogTab />}

      {/* Team Members Tab */}
      {activeTab === 'team' && (
      <>

      {/* Create User Form */}
      {showCreateForm && (
        <CreateUserForm roles={roles || []} onSubmit={(data: any) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
      )}

      {/* Users Table */}
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/50 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                <th className="p-4 w-12 text-center italic">#</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersData?.map((u: User, index: number) => (
                <React.Fragment key={u.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-center font-bold text-slate-300 italic">{index + 1}</td>
                    <td className="p-4 font-black text-slate-900">
                      {String(u.name || '')}
                    </td>
                    <td className="p-4 font-medium text-slate-500">{String(u.email || '')}</td>
                    <td className="p-4">
                      { IMMORTAL_EMAILS.some(e => e.toLowerCase() === u.email?.toLowerCase().trim()) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200">
                          System Owner 🔒
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                          {String(u.role?.label ?? 'User')}{u.department ? ` · ${String(u.department)}` : ''}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                        {u.isOnLeave && (
                          <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">On Leave</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[10px] font-bold text-slate-400 uppercase">
                      {u.updatedAt ? format(new Date(u.updatedAt), 'dd MMM yy') : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(IMMORTAL_EMAILS.includes(currentUser?.email?.toLowerCase() || '') || (u.role?.name !== 'admin' && !IMMORTAL_EMAILS.includes(u.email.toLowerCase()))) && (
                          <button
                            onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {(IMMORTAL_EMAILS.includes(currentUser?.email?.toLowerCase() || '') || (u.role?.name !== 'admin' && !IMMORTAL_EMAILS.includes(u.email.toLowerCase()))) && (
                          <button
                            onClick={() => setExpandedPermissions(expandedPermissions === u.id ? null : u.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Permissions"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        {currentUser?.id !== u.id && !IMMORTAL_EMAILS.includes(u.email.toLowerCase()) && (
                          IMMORTAL_EMAILS.includes(currentUser?.email?.toLowerCase() || '') || 
                          u.role?.name !== 'admin'
                        ) && (
                          <button
                            onClick={() => setOffboardingUser(u)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove User"
                            aria-label={`Delete user ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Inline Edit & Permissions Row Content (Desktop) */}
                  {editingUserId === u.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="p-6 border-y border-slate-100 shadow-inner">
                        <EditUserForm
                          user={u}
                          roles={roles || []}
                          onSubmit={(data: any) => updateMutation.mutate({ id: u.id, data })}
                          isLoading={updateMutation.isPending}
                          onCancel={() => setEditingUserId(null)}
                        />
                      </td>
                    </tr>
                  )}
                  {expandedPermissions === u.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="p-6 border-y border-slate-100 shadow-inner">
                        <PermissionsPanel userId={u.id} userName={u.name} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {usersData?.map((u: User) => (
            <Card key={u.id} className="p-4 border-slate-200 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {IMMORTAL_EMAILS.some(e => e.toLowerCase() === u.email?.toLowerCase().trim()) ? 'System Owner 🔒' : `${String(u.role?.label ?? 'User')}${u.department ? ` · ${String(u.department)}` : ''}`}
                  </p>
                  <h3 className="font-black text-base text-slate-900 leading-tight">{String(u.name || '')}</h3>
                  <p className="text-xs font-medium text-slate-500">{String(u.email || '')}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 rounded shadow-xs">
                      <CheckCircle className="w-2.5 h-2.5" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 text-[9px] font-black uppercase border border-red-100 bg-red-50 px-1.5 py-0.5 rounded shadow-xs">
                      <XCircle className="w-2.5 h-2.5" /> Inactive
                    </span>
                  )}
                  {u.isOnLeave && (
                    <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">Leave</span>
                  )}
                </div>
              </div>
              
              {/* Leads removed as per request */}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "flex-1 h-9 rounded-xl font-black text-[10px] uppercase shadow-sm tracking-wide transition-all",
                    editingUserId === u.id ? "bg-primary text-white" : "text-slate-600"
                  )}
                  onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}
                >
                  <Edit2 className="w-3 h-3 mr-1.5" /> {editingUserId === u.id ? 'Close Edit' : 'Edit Profile'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "flex-1 h-9 rounded-xl font-black text-[10px] uppercase shadow-sm tracking-wide transition-all",
                    expandedPermissions === u.id ? "bg-amber-100 border-amber-300 text-amber-800" : "text-slate-600"
                  )}
                  onClick={() => setExpandedPermissions(expandedPermissions === u.id ? null : u.id)}
                >
                  <Shield className="w-3 h-3 mr-1.5" /> Permissions
                </Button>
                {(IMMORTAL_EMAILS.includes(currentUser?.email?.toLowerCase() || '') || (u.role?.name !== 'admin' && !IMMORTAL_EMAILS.includes(u.email.toLowerCase()))) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 p-0 shadow-xs"
                    onClick={() => setOffboardingUser(u)}
                    aria-label={`Delete user ${u.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Responsive Inline Panels (Mobile) */}
              {editingUserId === u.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <EditUserForm
                    user={u}
                    roles={roles || []}
                    onSubmit={(data: any) => updateMutation.mutate({ id: u.id, data })}
                    isLoading={updateMutation.isPending}
                    onCancel={() => setEditingUserId(null)}
                  />
                </div>
              )}
              {expandedPermissions === u.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <PermissionsPanel userId={u.id} userName={u.name} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Offboarding Modal */}
      {offboardingUser && (
        <OffboardingModal
          user={offboardingUser}
          usersList={usersData?.filter((u: User) => u.isActive && u.id !== offboardingUser.id) || []}
          onClose={() => setOffboardingUser(null)}
          onConfirm={(reassignToId) => deleteMutation.mutate({ id: offboardingUser.id, reassignToId })}
          isPending={deleteMutation.isPending}
        />
      )}
      </>
      )}
    </div>
  );
}



// ─── Create User Form ────────────────────────────────────────
function CreateUserForm({ roles, onSubmit, isLoading }: { roles: Role[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    roleId: '', 
    maxLeads: 50,
    mobile: '',
    department: '',
    sendCredentials: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-4">
      <h3 className="font-semibold">Create New User</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
        <select
          value={form.roleId}
          onChange={(e) => setForm({ ...form, roleId: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
          required
        >
          <option value="">Select Role</option>
          {roles
            .filter((r: Role) => r.name !== 'owner' && r.name !== 'admin') // Only the core 3 users can be Admins
            .map((r: Role) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Max Leads"
          value={form.maxLeads}
          onChange={(e) => setForm({ ...form, maxLeads: parseInt(e.target.value, 10) })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        />
        <input
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        />
        <input
          placeholder="Department (e.g. Sales, Ops)"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.sendCredentials}
          onChange={(e) => setForm({ ...form, sendCredentials: e.target.checked })}
          className="rounded"
        />
        <span className="text-muted-foreground">Send login details to their email</span>
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}

// ─── Edit User Form ──────────────────────────────────────────
function EditUserForm({ user, roles, onSubmit, isLoading, onCancel }: {
  user: User; roles: Role[]; onSubmit: (data: any) => void; isLoading: boolean; onCancel: () => void;
}) {
  const currentUser = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    roleId: user.role.id,
    maxLeads: user.maxLeads,
    isOnLeave: user.isOnLeave,
    mobile: user.mobile || '',
    department: user.department || '',
    password: '',
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...form };
    if (!data.password) delete data.password;
    onSubmit(data);
  };

  const handleResetAndSend = async () => {
    setIsResetting(true);
    try {
      await api.post(`/users/${user.id}/reset-password-send`);
      toast.success(`New password generated and emailed to ${String(user.name)}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const isImmortal = IMMORTAL_EMAILS.includes(user.email.toLowerCase());

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-medium text-sm">Edit {String(user.name || '')}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          type="email" placeholder="Email"
          disabled={isImmortal || (user.role.name === 'admin' && !IMMORTAL_EMAILS.includes(currentUser?.email?.toLowerCase() || ''))}
          className="px-3 py-2 border rounded-md text-sm bg-background disabled:bg-slate-50 disabled:text-slate-500 cursor-not-allowed" />
        <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
          disabled={isImmortal || (user.role.name === 'admin' && !IMMORTAL_EMAILS.includes(currentUser?.email?.toLowerCase() || ''))}
          className="px-3 py-2 border rounded-md text-sm bg-background disabled:bg-slate-50 disabled:text-slate-500 cursor-not-allowed">
          {roles
            .filter((r: Role) => r.name !== 'owner' && r.name !== 'admin')
            .map((r: Role) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <input type="number" value={form.maxLeads} onChange={(e) => setForm({ ...form, maxLeads: parseInt(e.target.value, 10) })}
          placeholder="Max Leads" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="New Password (leave blank to keep)" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          placeholder="Mobile" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Department" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isOnLeave} onChange={(e) => setForm({ ...form, isOnLeave: e.target.checked })} />
          On Leave
        </label>
      </div>
      <div className="flex gap-2 items-center">
        <button type="submit" disabled={isLoading}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted">Cancel</button>
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleResetAndSend}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {isResetting ? 'Resetting...' : 'Reset & Send Password'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Permissions Panel ───────────────────────────────────────
function PermissionsPanel({ userId, userName }: { userId: string; userName: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => api.get(`/users/${userId}/permissions`).then(r => r.data.data),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ permissionId, granted }: { permissionId: string; granted: boolean }) =>
      api.post(`/users/${userId}/permissions`, { permissionId, granted, reason: 'Admin override' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      toast.success('Permission updated');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (permissionId: string) =>
      api.delete(`/users/${userId}/permissions/${permissionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      toast.success('Override removed');
    },
  });

  if (isLoading) return <div className="h-20 bg-muted/50 rounded animate-pulse" />;
  if (!data) return null;

  // Build consolidated permission view
  const rolePerms = data.role?.rolePermissions || [];
  const overrides = data.permissionOverrides || [];
  const overrideMap = Object.fromEntries(overrides.map((o: any) => [o.permission.id, o]));

  // Group permissions by module
  const modules: Record<string, any[]> = {};
  for (const rp of rolePerms) {
    const mod = rp.permission.module;
    if (!modules[mod]) modules[mod] = [];
    const override = overrideMap[rp.permission.id];
    modules[mod].push({
      ...rp.permission,
      roleGranted: rp.granted,
      override: override ? override.granted : null,
      overrideId: override?.id,
      effective: override ? override.granted : rp.granted,
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Shield className="w-4 h-4" /> Permissions for {userName}
        <span className="text-xs text-muted-foreground ml-2">Role: {data.role?.label}</span>
      </h4>

      {Object.entries(modules).map(([module, perms]) => (
        <div key={module} className="space-y-1">
          <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{module}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {perms.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.effective ? 'bg-green-500' : 'bg-red-400'}`} />
                  <span>{p.label}</span>
                  {p.override !== null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">OVERRIDE</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {p.override === null ? (
                    <>
                      <button
                        onClick={() => overrideMutation.mutate({ permissionId: p.id, granted: !p.roleGranted })}
                        className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
                        title={p.roleGranted ? 'Revoke' : 'Grant'}
                      >
                        {p.roleGranted ? 'Revoke' : 'Grant'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => removeMutation.mutate(p.id)}
                      className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Offboarding Modal ───────────────────────────────────────
function OffboardingModal({ user, usersList, onClose, onConfirm, isPending }: {
  user: User; usersList: User[]; onClose: () => void; onConfirm: (reassignToId: string) => void; isPending: boolean;
}) {
  const [reassignTo, setReassignTo] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-offboard-stats', user.id],
    queryFn: () => api.get(`/users/${user.id}/offboard-stats`).then(r => r.data.data),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border overflow-hidden">
        <div className="p-5 border-b bg-muted/30">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" /> Remove Teammate
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Offboarding <strong className="text-foreground">{String(user.name || '')}</strong>
          </p>
        </div>
        
        <div className="p-5 space-y-5">
          {isLoading ? (
            <div className="h-20 bg-muted/40 animate-pulse rounded-lg" />
          ) : (
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-center">
                <span className="block text-2xl font-bold text-blue-700">{stats?.activeLeads || 0}</span>
                <span className="text-xs text-blue-600/80 font-medium uppercase tracking-wide">Active Leads</span>
              </div>
              <div className="flex-1 bg-amber-50/50 border border-amber-100 p-3 rounded-lg text-center">
                <span className="block text-2xl font-bold text-amber-700">{stats?.activeTours || 0}</span>
                <span className="text-xs text-amber-600/80 font-medium uppercase tracking-wide">Active Tours</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Reassign active work to:</label>
            <select
              className="w-full h-10 px-3 border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20"
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
            >
              <option value="">-- Select Team Member --</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.label})</option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 p-3 border rounded-lg bg-red-50/30 cursor-pointer hover:bg-red-50/50 transition-colors">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="text-sm text-muted-foreground leading-tight">
              I understand that this action will transfer all active work to the selected user and immediately deactivate <strong>{user.name}</strong>&apos;s account.
            </span>
          </label>
        </div>

        <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reassignTo)}
            disabled={!reassignTo || !confirmed || isPending}
            className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Remove & Reassign
          </button>
        </div>
      </div>
    </div>
  );
}
