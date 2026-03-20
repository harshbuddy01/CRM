'use client';
import { useAuthStore } from '@/lib/auth-store';

interface PermissionGateProps {
  perm: string;
  children: React.ReactNode;
}

export function PermissionGate({ perm, children }: PermissionGateProps) {
  const { user } = useAuthStore();
  
  if (!user || !user.permissions[perm]) {
    return null;
  }
  
  return <>{children}</>;
}
