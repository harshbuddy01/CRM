'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { UserPlus, Shield, Edit2, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permission overrides</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <CreateUserForm roles={roles || []} onSubmit={(data: any) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 w-12">S.No</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Leads</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.map((u: User, index: number) => (
                <>
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {u.role.label}{u.department ? ` · ${u.department}` : ''}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                        {u.isOnLeave && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">On Leave</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{u.activeLeadCount} / {u.maxLeads}</span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {u.updatedAt ? format(new Date(u.updatedAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUserId(editingUserId === u.id ? null : u.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedPermissions(expandedPermissions === u.id ? null : u.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== u.id && u.role?.name !== 'Administrator' ? (
                          <button
                            onClick={() => updateMutation.mutate({
                              id: u.id,
                              data: { isActive: !u.isActive }
                            })}
                            className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-400 cursor-not-allowed`} title="System Admins cannot be deactivated">
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </span>
                        )}
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => setOffboardingUser(u)}
                            className="p-1 hover:bg-red-50 rounded text-red-500"
                            title="Deactivate User & Reassign Work"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Inline Edit Row */}
                  {editingUserId === u.id && (
                    <tr key={`edit-${u.id}`} className="bg-muted/30">
                      <td colSpan={8} className="p-4">
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
                  {/* Inline Permissions Row */}
                  {expandedPermissions === u.id && (
                    <tr key={`perm-${u.id}`} className="bg-muted/30">
                      <td colSpan={8} className="p-4">
                        <PermissionsPanel userId={u.id} userName={u.name} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          {roles.map((r: Role) => (
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
      toast.success(`New password generated and emailed to ${user.name}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-medium text-sm">Edit {user.name}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          type="email" placeholder="Email" className="px-3 py-2 border rounded-md text-sm bg-background" />
        <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm bg-background">
          {roles.map((r: Role) => <option key={r.id} value={r.id}>{r.label}</option>)}
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
            Offboarding <strong className="text-foreground">{user.name}</strong>
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
