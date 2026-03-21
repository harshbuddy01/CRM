'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function SupplierCommTab({ queryId }: { queryId: string }) {
  const { data: emails, isLoading } = useQuery({
    queryKey: ['supplier-emails', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/email-logs`);
      return (res.data.data || []).filter((e: any) => e.communicationType === 'supplier');
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Supplier Communications</h3>
      {!emails?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No supplier communications yet. Send booking confirmations from the Post Sales tab.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {emails.map((email: any) => (
            <Card key={email.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {email.sender?.name && `Sent by ${email.sender.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Supplier</span>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(email.sentAt), 'PPp')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
