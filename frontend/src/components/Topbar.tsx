'use client';

import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, User, Bell, Check, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
};

export function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Notifications Data ---
  const { data: notifData, isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=10');
      return res.data.data as { notifications: Notification[], unreadCount: number };
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (id === 'all') await api.patch('/notifications/read-all');
      else await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleLogout = async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      console.error(e);
    }
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="font-semibold md:hidden text-lg tracking-tight">
        TravelCRM
      </div>
      <div className="hidden md:block text-sm text-muted-foreground">
        Welcome back, <span className="text-foreground font-medium">{user?.name}</span>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <Popover>
          {/* @ts-ignore */}
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="w-5 h-5" />
              {notifData?.unreadCount ? (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background" />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border">
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {notifData?.unreadCount ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-primary"
                  onClick={() => markReadMutation.mutate('all')}
                  disabled={markReadMutation.isPending}
                >
                  <Check className="w-3 h-3 mr-1" /> Mark all read
                </Button>
              ) : null}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {isLoadingNotifs ? (
                <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : notifData?.notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">You have no notifications</div>
              ) : (
                <div className="flex flex-col">
                  {notifData?.notifications.map((notif: Notification) => (
                    <div 
                      key={notif.id}
                      className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                      onClick={() => {
                        if (!notif.isRead) markReadMutation.mutate(notif.id);
                        if (notif.actionUrl) router.push(notif.actionUrl);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <p className={`text-sm ${notif.isRead ? 'font-medium' : 'font-bold'}`}>{notif.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Account */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
