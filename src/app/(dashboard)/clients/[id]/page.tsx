'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Fingerprint, 
  History,
  ExternalLink,
  User
} from 'lucide-react';
import { format } from 'date-fns';

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const res = await api.get(`/clients/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>;

  if (isError || !client) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Client Not Found</h2>
      <Button variant="outline" className="mt-4" onClick={() => router.push('/clients')}>Back to Directory</Button>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/clients')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground text-sm">Customer since {format(new Date(client.createdAt), 'MMMM yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="font-medium">{client.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">City/Location</p>
                  <p className="font-medium">{client.city || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Passport Number</p>
                  <p className="font-medium uppercase">{client.passportNumber || 'Not Provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{client.dateOfBirth ? format(new Date(client.dateOfBirth), 'PPP') : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DeleteClientSection clientId={id as string} clientName={client.name} />
        </div>

        {/* Booking History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Travel History</CardTitle>
                <CardDescription>Recent queries and bookings linked to this client.</CardDescription>
              </div>
              <Badge variant="outline" className="h-6">{client.queries.length} total</Badge>
            </CardHeader>
            <CardContent>
              {client.queries.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <History className="w-12 h-12 mx-auto opacity-10 mb-4" />
                  <p>No bookings found for this client yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.queries.map((q: any) => (
                    <div 
                      key={q.id} 
                      className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => router.push(`/queries/${q.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{q.destination || 'Custom Tour'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{q.queryCode}</span>
                            <span className="text-xs text-muted-foreground">• {format(new Date(q.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border">
                          {q.status.replace('_', ' ')}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Client Section ────────────────────────────────────────────────────
function DeleteClientSection({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.delete(`/clients/${clientId}`),
    onSuccess: async () => {
      const { toast } = await import('sonner');
      toast.success(`${clientName} has been permanently deleted.`);
      router.push('/clients');
    },
    onError: async (err: any) => {
      const serverMessage: string = err?.response?.data?.message || '';
      const isBlocked = err?.response?.status === 409;

      if (isBlocked) {
        // Show the reason inline — it's a business rule block, not a system error
        setBlockReason(serverMessage);
        setConfirming(false);
      } else {
        const { toast } = await import('sonner');
        toast.error(serverMessage || 'Failed to delete client. Please try again.');
        setConfirming(false);
      }
    }
  });

  return (
    <Card className={blockReason ? 'border-amber-200 bg-amber-50/40' : 'border-red-100 bg-red-50/30'}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-base ${blockReason ? 'text-amber-700' : 'text-red-700'}`}>
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {blockReason ? (
          // Blocked state — show clear reason why delete is not allowed
          <>
            <div className="flex gap-2.5 p-3 rounded-lg bg-amber-100 border border-amber-200">
              <span className="text-amber-600 text-sm mt-0.5 shrink-0">⚠️</span>
              <p className="text-xs text-amber-800 font-semibold leading-relaxed">{blockReason}</p>
            </div>
            <p className="text-[11px] text-amber-600/80 leading-relaxed">
              To delete this client, first go to their bookings and change the status to <strong>Lost</strong> or <strong>Invalid</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 font-bold"
              onClick={() => setBlockReason(null)}
            >
              Got it
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-red-600/80 leading-relaxed">
              Permanently delete this client. <strong>Clients with confirmed or active bookings cannot be deleted</strong> — only clients with no active business can be removed.
            </p>
            {!confirming ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-bold"
                onClick={() => setConfirming(true)}
              >
                Delete Client
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-red-700 text-center">Are you absolutely sure?</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, Delete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 font-bold"
                    onClick={() => setConfirming(false)}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
