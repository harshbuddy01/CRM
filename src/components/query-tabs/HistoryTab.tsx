'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function HistoryTab({ queryId }: { queryId: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['history', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/history`);
      return res.data.data || [];
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Activity History</h3>
      {!logs?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No activity logs found.</CardContent></Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-muted space-y-4">
          {logs.map((log: any) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{formatAction(log.action)}</p>
                      {log.oldValue && log.newValue && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.oldValue)} → {JSON.stringify(log.newValue)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{log.user?.name || 'System'}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(log.createdAt), 'PPp')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    'query.created': 'Query Created',
    'query.status_changed': 'Status Changed',
    'query.assigned': 'Query Assigned',
    'query.updated': 'Query Updated',
    'payment.created': 'Payment Added',
    'payment.deleted': 'Payment Deleted',
    'proposal.created': 'Proposal Created',
    'proposal.sent': 'Proposal Sent',
    'tour.created': 'Tour Created',
    'note.created': 'Note Added',
    'integration.email.success': 'Email Sent Successfully',
    'integration.email.failed': 'Email Delivery Failed',
    'integration.whatsapp.success': 'WhatsApp Dispatched',
    'integration.whatsapp.failed': 'WhatsApp Failed',
    'integration.razorpay.success': 'Online Payment Received',
    'integration.razorpay.failed': 'Online Payment Failed',
  };
  return map[action] || action.replace(/\./g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
