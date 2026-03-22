'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { User, Lock, Eye, EyeOff, CheckCircle, Edit2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();

  // ─── Edit Profile State ────────────────────────────────────
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ─── Change Password State ─────────────────────────────────
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // If email was changed, require current password
    const emailChanged = editEmail.toLowerCase() !== (user?.email || '').toLowerCase();
    if (emailChanged && !confirmCurrentPassword) {
      toast.error('Current password is required to change your email');
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload: any = { name: editName, email: editEmail };
      if (emailChanged) payload.currentPassword = confirmCurrentPassword;

      await api.put(`/users/${user?.id}`, payload);

      // Update local auth store with new name/email
      if (user && accessToken) {
        setAuth({ ...user, name: editName, email: editEmail.toLowerCase() }, accessToken);
      }

      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
      setConfirmCurrentPassword('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl p-4 md:p-0 pb-24 md:pb-8">
      <div>
        <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">My Profile</h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your account settings</p>
      </div>

      {/* Profile Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-900 leading-tight truncate">{user?.name || 'Loading...'}</h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5 truncate">{user?.email || ''}</p>
            <span 
              className="inline-flex items-center px-2.5 py-1 mt-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10"
              aria-label="Account role"
            >
              {user?.roleLabel || user?.role || 'User'}
            </span>
          </div>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent shadow-xs active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Card */}
      {isEditingProfile && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Edit2 className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Edit Profile</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-background"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-background"
                required
              />
            </div>

            {editEmail.toLowerCase() !== (user?.email || '').toLowerCase() && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Password <span className="text-red-500">*</span></label>
                <p className="text-xs text-muted-foreground mb-1">Required to confirm email change</p>
                <input
                  type="password"
                  value={confirmCurrentPassword}
                  onChange={(e) => setConfirmCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditName(user?.name || '');
                  setEditEmail(user?.email || '');
                  setConfirmCurrentPassword('');
                }}
                className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Password</label>
            <div className="relative mt-1">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">New Password</label>
            <div className="relative mt-1">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-background"
              required
            />
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {confirmPassword && newPassword && confirmPassword === newPassword && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !oldPassword || !newPassword || newPassword !== confirmPassword}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
