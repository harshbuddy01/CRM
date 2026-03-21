'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { EmailComposeModal } from '@/components/EmailComposeModal';

export function MailsTab({ queryId, queryEmail }: { queryId: string; queryEmail?: string | null }) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const { data: emails, isLoading } = useQuery({
    queryKey: ['email-logs', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}`);
      return (res.data.data.emailLogs || []).filter((e: any) => e.communicationType !== 'supplier');
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Customer Emails</h3>
        {queryEmail && (
          <Button onClick={() => setIsComposeOpen(true)} className="gap-2">
            <Mail className="w-4 h-4" /> Compose Email
          </Button>
        )}
      </div>

      {!emails?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No emails sent yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {emails.map((email: any) => (
            <Card key={email.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      To: {queryEmail} {email.sender?.name && `• By ${email.sender.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${email.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {email.status === 'sent' ? 'Sent' : 'Failed'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(email.sentAt), 'PPp')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isComposeOpen && (
        <EmailComposeModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          queryId={queryId}
          queryCode=""
          customerName=""
          customerEmail={queryEmail || ''}
        />
      )}
    </div>
  );
}
