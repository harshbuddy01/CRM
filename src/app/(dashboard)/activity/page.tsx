'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { ActivityLogTab } from '@/components/ActivityLogTab';
import { Activity } from 'lucide-react';

/**
 * /activity — "My Activity" page for non-admin team members.
 * Shows ONLY the current user's own activity logs.
 * Admins are redirected to /users (which has the full team activity view).
 */
export default function MyActivityPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 p-4 md:p-0 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            My Activity
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Your recent actions and activity trail — last 7 days
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{user.name}</span>
            <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-wider">{user.roleLabel}</span>
          </div>
        )}
      </div>

      {/* Activity Log — isAdmin=false → calls /my-activity-logs, no user filter */}
      <ActivityLogTab isAdmin={false} />
    </div>
  );
}
