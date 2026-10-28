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
import { 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  MapPin, 
  IndianRupee, 
  Users, 
  Loader2, 
  ArrowLeft, 
  Building, 
  Car, 
  CreditCard, 
  Ban, 
  Zap, 
  Check, 
  CheckCircle2, 
  Trophy, 
  Star, 
  AlertTriangle,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  MessageCircle,
  Send,
  Bell,
  Play,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
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
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundEstimate, setRefundEstimate] = useState<any>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string>('');
  const [selectedDispatchDay, setSelectedDispatchDay] = useState(1);

  // Editing Ops Notes
  const [isEditingOps, setIsEditingOps] = useState(false);
  const [opsNotes, setOpsNotes] = useState('');
  const [assignedOps, setAssignedOps] = useState('');

  const { data: tour, isLoading, isError } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      const res = await api.get(`/tours/${tourId}`);
      return res.data.data;
    }
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/users/agents');
      return res.data.data;
    },
    enabled: !!(user?.role === 'admin' || user?.role === 'system_owner')
  });

  useEffect(() => {
    if (tour) {
      setOpsNotes(tour.opsNotes || '');
      setAssignedOps(tour.assignedOps || '');
    }
  }, [tour]);

  const opsMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/tours/${tourId}/ops`, { opsNotes, assignedOps });
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

  const completeTourMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/tours/${tourId}/ops`, { status: 'completed' });
    },
    onSuccess: () => {
      toast.success('🎉 Tour marked as Completed! Operations are now archived.');
      setIsCompleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to mark tour as completed');
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
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel tour');
    }
  });

  const sendReviewInviteMutation = useMutation({
    mutationFn: async (customPhone?: string) => {
      const res = await api.post(`/tours/${tourId}/send-review-invite`, {
        testPhone: customPhone || testPhoneNumber || undefined
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Review invite dispatched!');
      if (data?.data?.directWaUrl) {
        window.open(data.data.directWaUrl, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch review invite');
    }
  });

  const handleCopyReviewLink = (code: string) => {
    const url = `https://imagicaholidays.com/review/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Review link copied to clipboard!');
  };

  const setPhaseMutation = useMutation({
    mutationFn: async (phase: 'upcoming' | 'running' | 'completed') => {
      const res = await api.post(`/tours/${tourId}/set-phase`, { phase });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Tour phase updated!');
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update phase');
    }
  });

  const sendPretourReminderMutation = useMutation({
    mutationFn: async (customPhone?: string) => {
      const res = await api.post(`/tours/${tourId}/send-pretour-reminder`, {
        testPhone: customPhone || testPhoneNumber || undefined
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success('Pre-tour reminder sent!');
      if (data?.data?.directWaUrl) {
        window.open(data.data.directWaUrl, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send pre-tour reminder');
    }
  });

  const sendDailyDispatchMutation = useMutation({
    mutationFn: async ({ dayNumber, customPhone }: { dayNumber?: number; customPhone?: string }) => {
      const res = await api.post(`/tours/${tourId}/send-daily-dispatch`, {
        dayNumber: dayNumber || selectedDispatchDay,
        testPhone: customPhone || testPhoneNumber || undefined
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Daily dispatch sent!');
      if (data?.data?.directWaUrl) {
        window.open(data.data.directWaUrl, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send daily dispatch');
    }
  });

  const runSimulation = async () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    toast.info('🚀 Starting 2-Minute Full Lifecycle Simulation...');

    try {
      // Step 1: Upcoming (0s)
      setSimulationStep('Step 1/3: Phase Upcoming — Sending Day -2 Reminder & Balance Notice...');
      await api.post(`/tours/${tourId}/set-phase`, { phase: 'upcoming' });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      const pretour = await api.post(`/tours/${tourId}/send-pretour-reminder`, { testPhone: testPhoneNumber || undefined });
      if (pretour.data?.data?.directWaUrl) {
        window.open(pretour.data.data.directWaUrl, '_blank');
      }
      toast.success('Step 1: Pre-Tour Reminder Dispatched via WhatsApp!');

      // Delay 30s
      await new Promise(r => setTimeout(r, 30000));

      // Step 2: Running (30s)
      setSimulationStep('Step 2/3: Phase Running — Trip Starts! Sending Day 1 Logistics...');
      await api.post(`/tours/${tourId}/set-phase`, { phase: 'running' });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      const day1 = await api.post(`/tours/${tourId}/send-daily-dispatch`, { dayNumber: 1, testPhone: testPhoneNumber || undefined });
      if (day1.data?.data?.directWaUrl) {
        window.open(day1.data.data.directWaUrl, '_blank');
      }
      toast.success('Step 2: Day 1 Driver & Hotel Dispatched via WhatsApp!');

      // Delay 30s
      await new Promise(r => setTimeout(r, 30000));

      // Step 3: Completed (60s)
      setSimulationStep('Step 3/3: Phase Completed — Tour Concludes! Locking Operations & Sending Review Invite...');
      await api.post(`/tours/${tourId}/set-phase`, { phase: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      const review = await api.post(`/tours/${tourId}/send-review-invite`, { testPhone: testPhoneNumber || undefined });
      if (review.data?.data?.directWaUrl) {
        window.open(review.data.data.directWaUrl, '_blank');
      }
      toast.success('🎉 Step 3: Tour Concluded and Review Link Dispatched via WhatsApp!');
    } catch (e: any) {
      toast.error('Simulation error: ' + (e.response?.data?.message || e.message || 'Failed'));
    } finally {
      setSimulationRunning(false);
      setSimulationStep('');
    }
  };

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
  const isCompleted = tour.status === 'completed';
  const isRunning = tour.status === 'running';
  const isCancelled = tour.status === 'cancelled';
  const isUpcoming = tour.status === 'upcoming';

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

  // Helper to calculate lifecycle of each day
  const getDayLifecycle = (dayIndex: number) => {
    if (isCompleted) return { status: 'completed', label: 'Concluded' };
    if (isCancelled) return { status: 'cancelled', label: 'Cancelled' };
    if (!tour.startDate) return { status: 'upcoming', label: 'Upcoming' };

    const start = new Date(tour.startDate);
    start.setHours(0, 0, 0, 0);

    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + dayIndex);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dayDate.getTime() < today.getTime()) {
      return { status: 'completed', label: 'Concluded' };
    } else if (dayDate.getTime() === today.getTime() && isRunning) {
      return { status: 'active_today', label: 'Happening Today' };
    } else {
      return { status: 'upcoming', label: 'Upcoming' };
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/tours')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{tour.tourCode}</h1>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                isRunning ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                isUpcoming ? 'bg-amber-50 text-amber-700 border-amber-200' :
                isCompleted ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {tour.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm font-medium">
              {query?.name} • { 
                (tour.startDate && tour.endDate) 
                ? `${format(new Date(tour.startDate), 'MMM d, yyyy')} – ${format(new Date(tour.endDate), 'MMM d, yyyy')}`
                : 'Dates Pending'
              }
            </p>
          </div>
        </div>
        
        {/* Dynamic Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Completed State: Banner & Payment Settlement */}
          {isCompleted ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-500/20">
                <Trophy className="w-4 h-4 text-emerald-200" />
                <span>Trip Completed & Delivered</span>
              </div>
              
              {/* Payment Settlement remains accessible on completed tours */}
              <Button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-10 shadow-sm"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Record Settlement
              </Button>
            </div>
          ) : (
            <>
              {/* Dispatch & Assignment (Accessible during upcoming & running) */}
              {!isCancelled && (user?.role === 'admin' || user?.role === 'system_owner' || user?.role === 'ops') && (
                <Link href={`/tours/${tourId}/dispatch`}>
                  <Button variant="outline" className="border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold rounded-xl h-10 shadow-sm">
                    <Zap className="w-4 h-4 mr-1.5 text-blue-600" /> Dispatch & Assign
                  </Button>
                </Link>
              )}

              {/* Record Payment */}
              {!isCancelled && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold rounded-xl h-10 shadow-sm"
                >
                  <CreditCard className="w-4 h-4 mr-1.5 text-emerald-600" /> Record Payment
                </Button>
              )}

              {/* Complete Tour (Active during running) */}
              {isRunning && (user?.role === 'admin' || user?.role === 'system_owner' || user?.role === 'ops') && (
                <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10 shadow-md shadow-emerald-600/20">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Completed
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-black text-slate-900">Mark Tour as Concluded?</DialogTitle>
                      <DialogDescription className="text-xs text-slate-500">
                        This transitions the tour to <strong>Completed</strong>, archives active dispatches, and schedules the post-journey guest review process.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)} className="rounded-xl text-xs font-bold">
                        Back
                      </Button>
                      <Button 
                        onClick={() => completeTourMutation.mutate()} 
                        disabled={completeTourMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        {completeTourMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                        Confirm Completion
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Cancel Tour (Hidden on completed tours) */}
              {!isCancelled && !isCompleted && (user?.role === 'admin' || user?.role === 'system_owner' || user?.role === 'ops') && (
                <PermissionGate perm="cancellation.create">
                  <Dialog open={isCancelModalOpen} onOpenChange={handleOpenCancelModal}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold rounded-xl h-10">
                        <Ban className="w-4 h-4 mr-1.5" /> Cancel Tour
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900">Cancel Tour Confirmation</DialogTitle>
                        <DialogDescription className="text-rose-600 font-medium text-xs">
                          Warning: This action will cancel the booking and recalculate refund obligations.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        {isLoadingEstimate ? (
                          <div className="flex items-center text-xs text-slate-500"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating refund estimate...</div>
                        ) : refundEstimate ? (
                          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-900 text-xs">
                            <p className="font-bold mb-1">Estimated Refund: ₹{Number(refundEstimate.refundAmount).toLocaleString('en-IN')}</p>
                            <p className="text-[11px] text-rose-700/80">{refundEstimate.reason}</p>
                          </div>
                        ) : null}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Reason for Cancellation</label>
                          <Textarea 
                            placeholder="e.g. Customer medical emergency, unable to travel (Min 20 characters)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} className="rounded-xl text-xs font-bold">Back</Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => cancelMutation.mutate()} 
                          disabled={cancelReason.trim().length < 20 || cancelMutation.isPending}
                          className="rounded-xl text-xs font-bold"
                        >
                          {cancelMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                          Confirm Cancellation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </PermissionGate>
              )}
            </>
          )}
        </div>
      </div>

      {tour.cancellation && (
        <div className="bg-rose-50 text-rose-800 p-4 border border-rose-200 rounded-2xl flex flex-col gap-1.5">
          <div className="flex items-center font-bold text-sm"><Ban className="w-4 h-4 mr-2 text-rose-600" /> Tour Cancelled</div>
          <p className="text-xs"><strong>Reason:</strong> {tour.cancellation.reason}</p>
          <div className="flex gap-6 mt-1 text-xs">
            <p><strong>Refund Amount:</strong> ₹{Number(tour.cancellation.refundAmount).toLocaleString('en-IN')}</p>
            <p className="capitalize"><strong>Status:</strong> {tour.cancellation.refundStatus?.replace('_', ' ')}</p>
          </div>
        </div>
      )}

      {/* ── Comprehensive Tour Lifecycle & Communication Dispatcher ── */}
      <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                Interactive Lifecycle Suite
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-600">Test every phase on +{tour.query?.phone?.replace(/\D/g, '') || '918235337180'}</span>
            </div>
            <h2 className="text-base font-black text-slate-900 mt-1">Tour Phase Progression & Client WhatsApp Dispatch</h2>
          </div>

          {/* Quick Simulation Runner */}
          <div className="flex items-center gap-2">
            <Button
              onClick={runSimulation}
              disabled={simulationRunning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              {simulationRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>Simulating (Check WhatsApp)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current mr-1" />
                  <span>Run 2-Min Full Lifecycle Simulation</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {simulationStep && (
          <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-indigo-900 text-xs font-bold animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{simulationStep}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          {/* Phase Switcher Buttons */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Current Tour Phase (Click Any Phase to Transition)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Phase 1: Upcoming */}
              <button
                type="button"
                onClick={() => setPhaseMutation.mutate('upcoming')}
                disabled={setPhaseMutation.isPending || simulationRunning}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isUpcoming 
                    ? 'border-amber-400 bg-amber-50/70 shadow-sm ring-1 ring-amber-300' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isUpcoming ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  1
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    Upcoming (Pre-Trip)
                    {isUpcoming && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pre-trip countdown, Day -2 reminder & balance payment notices</p>
                </div>
              </button>

              {/* Phase 2: Running */}
              <button
                type="button"
                onClick={() => setPhaseMutation.mutate('running')}
                disabled={setPhaseMutation.isPending || simulationRunning}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isRunning 
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isRunning ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  2
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    Running (In Progress)
                    {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active journey, daily driver/hotel dispatch & timeline progression</p>
                </div>
              </button>

              {/* Phase 3: Completed */}
              <button
                type="button"
                onClick={() => setPhaseMutation.mutate('completed')}
                disabled={setPhaseMutation.isPending || simulationRunning}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isCompleted 
                    ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-400' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  3
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    Completed (Concluded)
                    {isCompleted && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Operations locked, settlement balance open & automated review invites</p>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: Pre-Trip Reminder */}
            <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Bell className="w-3 h-3 text-amber-600" /> Day -2 Reminder
                </span>
                <span className="text-[10px] text-amber-700/80 font-bold">₹{Math.max(0, balance).toLocaleString('en-IN')} Due</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                "Are you excited traveling with Imagica Holidays? Pre-departure balance reminder..."
              </p>
              <Button
                size="sm"
                onClick={() => sendPretourReminderMutation.mutate(undefined)}
                disabled={sendPretourReminderMutation.isPending || simulationRunning}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 rounded-lg shadow-none"
              >
                {sendPretourReminderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MessageCircle className="w-3 h-3 mr-1" />}
                Send Pre-Trip WhatsApp
              </Button>
            </div>

            {/* Action 2: Daily Logistics Dispatch */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Car className="w-3 h-3 text-emerald-600" /> Daily Dispatch
                </span>
                <select
                  value={selectedDispatchDay}
                  onChange={(e) => setSelectedDispatchDay(Number(e.target.value))}
                  className="text-[10px] font-bold bg-white border border-emerald-300 rounded px-1.5 py-0.5 text-emerald-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <option key={d} value={d}>Day {d}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                "Good morning! Assigned Driver: Samar A, Tonight's Hotel: Hotel Hangsha Regency..."
              </p>
              <Button
                size="sm"
                onClick={() => sendDailyDispatchMutation.mutate({ dayNumber: selectedDispatchDay })}
                disabled={sendDailyDispatchMutation.isPending || simulationRunning}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-lg shadow-none"
              >
                {sendDailyDispatchMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MessageCircle className="w-3 h-3 mr-1" />}
                Send Day {selectedDispatchDay} WhatsApp
              </Button>
            </div>

            {/* Action 3: Review Link Invitation */}
            <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Review Invite
                </span>
                <span className="text-[10px] text-blue-700/80 font-bold">{tour.reviewStatus || 'PENDING'}</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                "Thank you for traveling with us! Share review: imagicaholidays.com/review/{tour.tourCode}..."
              </p>
              <Button
                size="sm"
                onClick={() => sendReviewInviteMutation.mutate(undefined)}
                disabled={sendReviewInviteMutation.isPending || simulationRunning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 rounded-lg shadow-none"
              >
                {sendReviewInviteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MessageCircle className="w-3 h-3 mr-1" />}
                Send Review WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Finances */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black text-slate-900">Customer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{query?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:${query?.phone}`} className="hover:underline hover:text-primary">{query?.phone}</a>
              </div>
              {query?.email && (
                <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${query?.email}`} className="hover:underline hover:text-primary truncate">{query?.email}</a>
                </div>
              )}
              <div className="border-t pt-3 grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-0.5">Destination</p>
                  <p className="font-bold text-slate-800 truncate">{query?.destination || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-0.5">Travelers</p>
                  <p className="font-bold text-slate-800">{tour.passengerCount} Pax</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Ledger */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black text-slate-900">Payment Ledger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <p className="font-bold text-slate-600">Total Package</p>
                <p className="font-black text-slate-900">₹{sellingPrice.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                <p className="font-bold">Amount Paid</p>
                <p className="font-black">₹{totalPaid.toLocaleString('en-IN')}</p>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-xl border text-xs ${
                balance > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <p className="font-bold">Balance Due</p>
                <p className="font-black">₹{balance.toLocaleString('en-IN')}</p>
              </div>

              {tour.payments && tour.payments.length > 0 && (
                <div className="pt-3 border-t mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction History</p>
                    <span className="text-[10px] font-bold text-slate-400">{tour.payments.length} Records</span>
                  </div>
                  <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                    {tour.payments.map((p: any) => (
                      <div key={p.id} className="text-xs bg-slate-50/90 border border-slate-100 rounded-xl p-2.5 space-y-1">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span className="inline-flex items-center gap-1.5 capitalize font-black text-slate-900">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                              {p.mode}
                            </span>
                            ₹{Number(p.amount).toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            p.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status === 'verified' ? '✓ VERIFIED' : p.status?.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                          <span>{format(new Date(p.paymentDate), 'MMM d, yyyy')}</span>
                          {p.referenceUtr && (
                            <span className="font-mono text-slate-600 truncate max-w-[150px]" title={p.referenceUtr}>
                              Ref: {p.referenceUtr}
                            </span>
                          )}
                        </div>

                        {/* Collector / Staff Details */}
                        {(p.collector?.name || p.user?.name) && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
                            <span className="text-slate-400">Collected by:</span>
                            <span className="font-bold text-slate-800">{p.collector?.name || p.user?.name}</span>
                            {(() => {
                              const rawRole = p.collector?.role ?? p.user?.role;
                              const roleStr = typeof rawRole === 'object' ? (rawRole?.label || rawRole?.name || '') : (rawRole || '');
                              return roleStr ? (
                                <span className="text-[9px] text-slate-400 uppercase font-mono">
                                  ({String(roleStr).replace('_', ' ')})
                                </span>
                              ) : null;
                            })()}
                          </div>
                        )}

                        {p.notes && (
                          <p className="text-[10px] italic text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-100">
                            Note: {p.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Dynamic Itinerary with Live Day Progression */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-black text-slate-900">Itinerary Plan</CardTitle>
                  {isRunning && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Compass className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                      Active Tour
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      All Concluded
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Day-by-day journey progression and field logistics.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                {(() => {
                  const tourDays = (latestProposal?.days && latestProposal.days.length > 0)
                    ? latestProposal.days
                    : (latestProposal?.itinerary?.days || []);

                  if (!tourDays || tourDays.length === 0) {
                    return (
                      <div className="text-center py-10 text-slate-400">
                        <MapPin className="w-8 h-8 opacity-25 mx-auto mb-2" />
                        <p className="text-xs">Itinerary outline not available.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                      {(tourDays as any[]).map((day: any, idx: number) => {
                        const assignedHotel = tour.bookingServices?.find((b: any) => b.dayNumber === day.dayNumber && b.serviceType === 'hotel');
                        const assignedDriver = tour.tourDrivers?.find((td: any) => td.dayNumber === day.dayNumber)?.driver;
                        const lifecycle = getDayLifecycle(idx);

                        const proposedHotel = typeof day.hotel === 'object' 
                          ? day.hotel?.name 
                          : (day.hotel || day.events?.find((e: any) => e.type === 'accommodation')?.title || null);

                        const activitiesList = day.activities 
                          ? (typeof day.activities === 'string' ? day.activities.split(',').map((a: string) => a.trim()).filter(Boolean) : [])
                          : (day.events?.filter((e: any) => e.type === 'sightseeing' || e.type === 'activity').map((e: any) => e.title) || []);

                        return (
                          <div 
                            key={idx} 
                            className={`relative flex items-start transition-all ${
                              lifecycle.status === 'active_today'
                                ? 'bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-200 shadow-sm -ml-2 pl-3'
                                : lifecycle.status === 'completed'
                                ? 'opacity-85'
                                : ''
                            }`}
                          >
                            {/* Animated Timeline Pin */}
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 z-10 mr-3 shadow-sm ${
                              lifecycle.status === 'active_today'
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md animate-pulse'
                                : lifecycle.status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-600'
                            }`}>
                              {lifecycle.status === 'completed' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span>{day.dayNumber}</span>
                              )}
                            </div>

                            <div className="pt-0.5 w-full text-xs space-y-1">
                              {/* Day Title & Status Badge */}
                              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                                <p className={`font-bold leading-tight ${
                                  lifecycle.status === 'active_today' ? 'text-slate-900' : 'text-slate-700'
                                }`}>
                                  {typeof day.title === 'object' ? (day.title?.name || JSON.stringify(day.title)) : (day.title || `Day ${day.dayNumber}`)}
                                </p>

                                {lifecycle.status === 'active_today' ? (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                    </span>
                                    Today
                                  </span>
                                ) : lifecycle.status === 'completed' ? (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ✓ Concluded
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-500">
                                    Upcoming
                                  </span>
                                )}
                              </div>

                              {/* Assigned Hotel */}
                              {assignedHotel ? (
                                <p className="text-emerald-700 font-bold flex items-center text-[11px] bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded-lg w-fit">
                                  <Building className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
                                  <span>Hotel: {assignedHotel.serviceName}</span>
                                </p>
                              ) : proposedHotel ? (
                                <p className="text-slate-500 flex items-center text-[11px] bg-slate-50 px-2 py-0.5 rounded-lg w-fit">
                                  <Building className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                                  <span>Proposed: {proposedHotel}</span>
                                </p>
                              ) : null}

                              {/* Assigned Chauffeur */}
                              {assignedDriver ? (
                                <p className="text-blue-700 font-bold flex items-center text-[11px] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg w-fit">
                                  <Car className="w-3 h-3 mr-1 text-blue-600 shrink-0" />
                                  <span>Driver: {assignedDriver.name} ({assignedDriver.vehicleNo})</span>
                                </p>
                              ) : (
                                <p className="text-slate-400 flex items-center text-[10px] italic">
                                  <Car className="w-3 h-3 mr-1 text-slate-300 shrink-0" />
                                  <span>No chauffeur assigned yet</span>
                                </p>
                              )}

                              {/* Activities Outline */}
                              {activitiesList.length > 0 && (
                                <div className="text-slate-500 mt-1 pl-2.5 border-l border-slate-200 text-[11px] space-y-0.5">
                                  {activitiesList.map((act: string, i: number) => (
                                    <p key={i}>• {act}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Right Column: Operations Overview & Review Outcome */}
        <div className="lg:col-span-1 space-y-6">
          {/* Post-Tour Review Banner if Completed or if Review Triggered */}
          {(isCompleted || tour.reviewStatus === 'SENT' || tour.reviewStatus === 'COMPLETED') && (
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-b from-slate-50 to-white overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-slate-900">Post-Journey Review</CardTitle>
                      <p className="text-[11px] text-slate-500">Google Reviews & Private Feedback</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    tour.reviewStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    tour.reviewStatus === 'SENT' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {tour.reviewStatus || 'PENDING'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {tour.reviewRating === 5 || tour.reviewAction === 'google_review_redirect' || tour.reviewAction === 'opened_google_review' ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-black">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>5.0 ★ Google Review Confirmed</span>
                    </div>
                    <p className="text-[11px] text-amber-800/80">Guest completed a verified 5-star Google Review.</p>
                  </div>
                ) : tour.reviewRating && tour.reviewRating < 5 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-black">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{tour.reviewRating}.0 ★ Service Feedback</span>
                    </div>
                    {tour.reviewDisappointments && Array.isArray(tour.reviewDisappointments) && (
                      <div className="flex flex-wrap gap-1">
                        {tour.reviewDisappointments.map((tag: string, i: number) => (
                          <span key={i} className="text-[9px] bg-white border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {tour.reviewNotes && (
                      <p className="text-[11px] text-rose-800 italic bg-white/70 p-2 rounded-lg border border-rose-100">
                        "{tour.reviewNotes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      {tour.reviewStatus === 'SENT' 
                        ? `Review Invitation Dispatched (Attempt ${tour.reviewFollowupCount || 1}/3)` 
                        : 'Review invitation awaiting dispatch'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {tour.reviewSentAt 
                        ? `Last sent on ${format(new Date(tour.reviewSentAt), 'dd MMM yyyy, hh:mm a')}`
                        : 'Scheduled via 10:00 AM daily cron or manual trigger below.'}
                    </p>
                  </div>
                )}

                {/* Review Link & Quick Actions */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Public Review URL</label>
                  <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://imagicaholidays.com/review/${tour.tourCode}`} 
                      className="bg-transparent text-[11px] text-slate-600 font-mono flex-1 outline-none px-1"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleCopyReviewLink(tour.tourCode)} 
                      className="h-7 px-2 text-xs font-bold hover:bg-white"
                      title="Copy link"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                    </Button>
                    <a 
                      href={`https://imagicaholidays.com/review/${tour.tourCode}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-7 px-2 text-xs font-bold text-slate-700 hover:bg-white rounded-md transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 1-Click WhatsApp Trigger */}
                <div className="space-y-2 pt-1">
                  <Button 
                    onClick={() => sendReviewInviteMutation.mutate(undefined)} 
                    disabled={sendReviewInviteMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10 shadow-sm"
                  >
                    {sendReviewInviteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4 mr-2" />
                    )}
                    Send Review via WhatsApp ({tour.query?.phone || 'Guest'})
                  </Button>
                </div>

                {/* Custom Test Dispatch */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Send Test to Any Number
                  </p>
                  <div className="flex gap-1.5">
                    <Input 
                      placeholder="+918235337180 or +917889..." 
                      value={testPhoneNumber} 
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      className="text-xs h-9 rounded-xl border-slate-200"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (!testPhoneNumber) {
                          toast.error('Enter a phone number to test');
                          return;
                        }
                        sendReviewInviteMutation.mutate(testPhoneNumber);
                      }}
                      disabled={sendReviewInviteMutation.isPending}
                      className="h-9 px-3 rounded-xl text-xs font-bold shrink-0"
                    >
                      Send Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operations Dashboard */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-black text-slate-900">Operations Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Ops Handling Agent</p>
                {isEditingOps && (user?.role === 'admin' || user?.role === 'system_owner') ? (
                  <select
                    value={assignedOps}
                    onChange={(e) => setAssignedOps(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="">Unassigned</option>
                    {agents?.map((agent: any) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="font-bold text-xs flex items-center gap-2 text-slate-800">
                    <div className="w-6 h-6 bg-slate-100 text-slate-700 flex items-center justify-center rounded-full text-[10px] font-black">
                      {tour.assignedOpsUser?.name?.[0] || '?'}
                    </div>
                    {tour.assignedOpsUser?.name || 'Unassigned'}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Field Representatives (Drivers)</p>
                <div className="text-xs flex flex-col gap-1.5 mt-1">
                  {tour.tourDrivers && tour.tourDrivers.length > 0 ? (
                    Array.from(new Set(tour.tourDrivers.map((td: any) => td.driver?.name).filter(Boolean))).map((name: any, i) => {
                      const driver = tour.tourDrivers.find((td: any) => td.driver?.name === name)?.driver;
                      return (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-lg border border-blue-100 w-fit font-bold">
                          <Car className="w-3.5 h-3.5 text-blue-600" /> {name} {driver?.phone ? `(${driver.phone})` : ''}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-slate-400 text-xs italic font-normal">Not dispatched / no drivers assigned yet</span>
                  )}
                </div>
              </div>

              {/* Handover Notes */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Operations Handover Notes</p>
                  {!isCompleted && (user?.role === 'admin' || user?.role === 'ops' || user?.role === 'system_owner') ? (
                    !isEditingOps ? (
                      <Button variant="ghost" size="sm" onClick={handleEditOpsClick} className="h-6 px-2 text-[10px] font-bold">Edit</Button>
                    ) : null
                  ) : null}
                </div>

                {isEditingOps ? (
                  <div className="space-y-2 text-xs">
                    <Textarea 
                      value={opsNotes} 
                      onChange={(e) => setOpsNotes(e.target.value)} 
                      placeholder="Provide logistics, driver contact, and booking references..."
                      className="min-h-[100px] text-xs rounded-xl"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingOps(false)} className="h-7 text-xs rounded-lg">Cancel</Button>
                      <Button size="sm" onClick={() => opsMutation.mutate()} disabled={opsMutation.isPending} className="h-7 text-xs rounded-lg bg-slate-900 text-white">
                        {opsMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null} Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs whitespace-pre-wrap text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 min-h-[80px]">
                    {tour.opsNotes || 'No operational notes have been recorded for this tour yet.'}
                  </div>
                )}
              </div>

              {isCompleted ? (
                <div className="p-3 bg-slate-100 rounded-xl text-center">
                  <p className="text-[11px] font-bold text-slate-500">🔒 Tour Concluded: Operational logs are locked.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Manual Payment Entry Modal */}
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
