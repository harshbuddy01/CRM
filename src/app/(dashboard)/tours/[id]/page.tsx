'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Phone, Mail, MapPin, IndianRupee, Users, Send, Loader2, ArrowLeft, Luggage, Building, Plane, Car, Route, Clock, CreditCard, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { PermissionGate } from '@/components/PermissionGate';
import { toast } from 'sonner';
import { PaymentEntryModal } from '@/components/PaymentEntryModal';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundEstimate, setRefundEstimate] = useState<any>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);

  // Editing Ops Notes
  const [isEditingOps, setIsEditingOps] = useState(false);
  const [opsNotes, setOpsNotes] = useState('');

  const { data: tour, isLoading, isError } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      const res = await api.get(`/tours/${tourId}`);
      return res.data.data;
    }
  });

  const opsMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/tours/${tourId}/ops`, { opsNotes });
    },
    onSuccess: () => {
      toast.success('Operations notes updated');
      setIsEditingOps(false);
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update ops notes');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/tours/${tourId}/cancel`, { reason: cancelReason });
    },
    onSuccess: () => {
      toast.success('Tour cancelled successfully');
      setIsCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel tour');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>;
  }

  if (isError || !tour) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-red-500 font-medium">Failed to load tour details.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const query = tour.query;
  const latestProposal = tour.proposal;
  const totalPaid = tour.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const sellingPrice = latestProposal ? Number(latestProposal.sellingPrice) : 0;
  const balance = sellingPrice - totalPaid;

  const handleEditOpsClick = () => {
    setOpsNotes(tour.opsNotes || '');
    setIsEditingOps(true);
  };

  const handleOpenCancelModal = async (open: boolean) => {
    setIsCancelModalOpen(open);
    if (open && !refundEstimate) {
      setIsLoadingEstimate(true);
      try {
        const res = await api.get(`/tours/${tourId}/refund-estimate`);
        setRefundEstimate(res.data.data);
      } catch (e) {
        toast.error('Failed to calculate exact refund');
      } finally {
        setIsLoadingEstimate(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/tours')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tour.tourCode}</h1>
              <span className={`px-2 py-1 rounded text-xs font-bold tracking-widest uppercase ${
                tour.status === 'running' ? 'bg-blue-100 text-blue-700' :
                tour.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                tour.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                'bg-red-100 text-red-700'
              }`}>
                {tour.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              {query?.name} • { 
                (tour.startDate && tour.endDate) 
                ? `${format(new Date(tour.startDate), 'MMM d, yyyy')} to ${format(new Date(tour.endDate), 'MMM d, yyyy')}`
                : 'Dates Pending'
              }
            </p>
          </div>
        </div>
        
        {tour.status !== 'cancelled' && tour.status !== 'completed' && user?.role === 'admin' && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)}>
              <CreditCard className="w-4 h-4 mr-2" /> Record Payment
            </Button>
            <PermissionGate perm="cancellation.create">
              <Dialog open={isCancelModalOpen} onOpenChange={handleOpenCancelModal}>
                {/* @ts-ignore - Trigger interface typing override */}
              <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Ban className="w-4 h-4 mr-2" /> Cancel Tour
                  </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Tour Confirmation</DialogTitle>
                  <DialogDescription className="text-red-600 font-medium">
                    Warning: This action is irreversible. A refund will be automatically calculated based on business rules.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {isLoadingEstimate ? (
                    <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating refund estimate...</div>
                  ) : refundEstimate ? (
                    <div className="bg-red-50 p-3 rounded border border-red-100 text-red-900 text-sm">
                      <p className="font-semibold mb-1">Estimated Refund: <IndianRupee className="w-3 h-3 inline pb-0.5" />{Number(refundEstimate.refundAmount).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-red-700/80">{refundEstimate.reason}</p>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for Cancellation</label>
                    <Textarea 
                      placeholder="e.g. Customer medical emergency, unable to travel (Min 20 characters)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>Back</Button>
                  <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelReason.trim().length < 20 || cancelMutation.isPending}>
                    {cancelMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Confirm Cancellation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </PermissionGate>
          </div>
        )}
      </div>

      {tour.cancellation && (
        <div className="bg-red-50 text-red-800 p-4 border border-red-200 rounded-lg flex flex-col gap-2">
          <div className="flex items-center font-bold text-lg"><Ban className="w-5 h-5 mr-2" /> Tour Cancelled</div>
          <p className="text-sm"><strong>Reason:</strong> {tour.cancellation.reason}</p>
          <div className="flex gap-6 mt-2 text-sm">
            <p><strong>Refund Amount:</strong> <span className="inline-flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{Number(tour.cancellation.refundAmount).toLocaleString('en-IN')}</span></p>
            <p className="capitalize"><strong>Status:</strong> {tour.cancellation.refundStatus.replace('_', ' ')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Flow & Finances */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Customer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{query?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{query?.phone}</span>
              </div>
              {query?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{query?.email}</span>
                </div>
              )}
              <div className="border-t pt-4 grid grid-cols-2 gap-y-4 text-sm mt-2">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Destination</p>
                  <p className="font-medium">{query?.destination || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Travelers</p>
                  <p className="font-medium">{tour.passengerCount} Pax</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Payment Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
                  <p className="text-sm font-medium">Total Package</p>
                  <p className="font-bold inline-flex items-center"><IndianRupee className="w-4 h-4 mr-0.5" />{sellingPrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                  <p className="text-sm font-medium">Amount Paid</p>
                  <p className="font-bold inline-flex items-center"><IndianRupee className="w-4 h-4 mr-0.5" />{totalPaid.toLocaleString('en-IN')}</p>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg border ${balance > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-gray-50 text-gray-800'}`}>
                  <p className="text-sm font-medium">Balance Due</p>
                  <p className="font-bold inline-flex items-center"><IndianRupee className="w-4 h-4 mr-0.5" />{balance.toLocaleString('en-IN')}</p>
                </div>

                {tour.payments && tour.payments.length > 0 && (
                  <div className="pt-4 border-t mt-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction History</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {tour.payments.map((p: any) => (
                        <div key={p.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between font-medium">
                            <span className="capitalize">{p.mode.replace('_', ' ')}</span>
                            <span className="inline-flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{Number(p.amount).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{format(new Date(p.paymentDate), 'MMM d, yy')}</span>
                            <span className={`${p.status === 'verified' ? 'text-emerald-600' : p.status === 'pending' ? 'text-amber-600' : 'text-red-500'}`}>{p.status.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Itinerary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Itinerary Plan</CardTitle>
              {latestProposal ? (
                <CardDescription>From approved Proposal v{latestProposal.version}</CardDescription>
              ) : (
                <CardDescription>No stored proposal details found.</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {latestProposal?.days ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {(latestProposal.days as any[]).map((day: any, idx: number) => (
                    <div key={idx} className="relative flex items-start group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border bg-background text-xs font-bold shrink-0 z-10 mr-4 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {day.dayNumber}
                      </div>
                      <div className="pt-1 w-full text-sm">
                        <p className="font-semibold mb-1">{day.title}</p>
                        {day.hotel && <p className="text-muted-foreground flex items-center mb-1"><Building className="w-3 h-3 mr-1" /> {day.hotel}</p>}
                        {day.activities && day.activities.length > 0 && (
                          <div className="text-muted-foreground mt-2 space-y-1 pl-4 border-l-2">
                            {day.activities.map((act: string, i: number) => (
                              <p key={i} className="text-xs flex items-center relative before:w-1.5 before:h-1.5 before:rounded-full before:bg-muted-foreground/30 before:mr-2">
                                {act}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  <p className="text-sm">Itinerary outline not available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Operations Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Operations Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 border-b pb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ops Handling Agent</p>
                <div className="font-medium text-sm flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 text-primary flex items-center justify-center rounded-full text-xs font-bold">
                    {tour.assignedOpsUser?.name?.[0] || '?'}
                  </div>
                  {tour.assignedOpsUser?.name || 'Unassigned'}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Field Representative</p>
                <p className="font-medium text-sm">
                  {tour.assignedFieldUser?.name || 'Not dispatched / unassigned'}
                </p>
              </div>
            </CardContent>
            <div className="p-4 bg-muted/30">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold">Operations Handover Notes</p>
                {user?.role === 'admin' || user?.role === 'ops' ? (
                  !isEditingOps ? (
                    <Button variant="ghost" size="sm" onClick={handleEditOpsClick} className="h-6 px-2 text-xs">Edit</Button>
                  ) : null
                ) : null}
              </div>
              {isEditingOps ? (
                <div className="space-y-2 text-sm">
                  <Textarea 
                    value={opsNotes} 
                    onChange={(e) => setOpsNotes(e.target.value)} 
                    placeholder="Provide logistics, driver contact, and booking references..."
                    className="min-h-[120px] text-xs resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingOps(false)} className="h-7 text-xs">Cancel</Button>
                    <Button size="sm" onClick={() => opsMutation.mutate()} disabled={opsMutation.isPending} className="h-7 text-xs">
                      {opsMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null} Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap text-muted-foreground bg-card border rounded p-3 min-h-[100px]">
                  {tour.opsNotes || 'No operational notes have been recorded for this tour yet.'}
                </div>
              )}
            </div>
            {tour.status !== 'completed' && tour.status !== 'cancelled' && (user?.role === 'ops' || user?.role === 'admin') && (
              <div className="p-4 border-t bg-emerald-50/50">
                  <p className="text-xs text-center text-muted-foreground">Field Updates are restricted to Field Agents during the running status of the tour.</p>
              </div>
            )}
          </Card>
        </div>

      </div>

      <PaymentEntryModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        tourId={tourId} 
        queryId={tour.queryId} 
        totalAmount={sellingPrice}
        paidAmount={totalPaid}
        balanceDue={balance}
      />

    </div>
  );
}
