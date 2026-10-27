'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Luggage, 
  Search, 
  Loader2, 
  ArrowRight, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  IndianRupee, 
  Car, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Compass,
  MessageSquare,
  Ban
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';

export default function ToursListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [completedSubFilter, setCompletedSubFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReviewModal, setSelectedReviewModal] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tours', statusFilter],
    queryFn: async () => {
      let url = '/tours';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      return res.data.data;
    }
  });

  const toursList: any[] = data?.tours || [];
  const statusCounts = data?.statusCounts || {
    all: 0,
    running: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  };

  // Filter by search query
  let filteredTours = toursList.filter((t: any) => 
    t.tourCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.query?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.query?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.query?.queryCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If in 'completed' tab, apply structured sub-filter
  if (statusFilter === 'completed') {
    if (completedSubFilter === '5star') {
      filteredTours = filteredTours.filter(t => t.reviewRating === 5 || t.reviewAction === 'google_review_redirect');
    } else if (completedSubFilter === 'feedback') {
      filteredTours = filteredTours.filter(t => (t.reviewRating && t.reviewRating < 5) || t.reviewDisappointments?.length > 0 || t.reviewNotes);
    } else if (completedSubFilter === 'pending') {
      filteredTours = filteredTours.filter(t => t.reviewStatus === 'SENT' || t.reviewStatus === 'PENDING');
    }
  }

  const formatDateSafe = (dateString: string | null | undefined, fmt = 'MMM d, yyyy') => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '—';
      return format(d, fmt);
    } catch {
      return '—';
    }
  };

  const getTourProgress = (startDateStr: string, endDateStr: string) => {
    try {
      const start = new Date(startDateStr).getTime();
      const end = new Date(endDateStr).getTime();
      const now = new Date().getTime();
      const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      const elapsedDays = Math.min(totalDays, Math.max(1, Math.round((now - start) / (1000 * 60 * 60 * 24)) + 1));
      const percent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
      return { totalDays, elapsedDays, percent };
    } catch {
      return { totalDays: 1, elapsedDays: 1, percent: 50 };
    }
  };

  const getDaysAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const days = Math.round((now - d) / (1000 * 60 * 60 * 24));
      if (days <= 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days} days ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">Tours Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
              Operations Hub
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-xs md:text-sm font-medium">
            Monitor real-time guest journeys, active chauffeurs, and post-tour service reviews.
          </p>
        </div>
      </div>

      {/* Top Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div 
          onClick={() => setStatusFilter('running')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'running' 
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md' 
              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Active On Tour</p>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{statusCounts.running}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Trips live on the road</p>
        </div>

        <div 
          onClick={() => setStatusFilter('upcoming')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'upcoming' 
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-md' 
              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Upcoming Departures</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{statusCounts.upcoming}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Starting next</p>
        </div>

        <div 
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'completed' 
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-md' 
              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Completed Tours</p>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{statusCounts.completed}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Delivered journeys</p>
        </div>

        <div 
          onClick={() => setStatusFilter('cancelled')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'cancelled' 
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-md' 
              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">Cancelled / Lost</p>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{statusCounts.cancelled}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Voided bookings</p>
        </div>
      </div>

      {/* Search & Main Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by tour code, guest name, destination..."
              className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Tabs with Live Count Badges */}
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar scrollbar-none gap-1">
            {[
              { id: 'all', label: 'All Active', count: statusCounts.all },
              { id: 'running', label: 'Ongoing', count: statusCounts.running, isLive: true },
              { id: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
              { id: 'completed', label: 'Completed', count: statusCounts.completed },
              { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCompletedSubFilter('all');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  statusFilter === tab.id 
                  ? 'bg-white shadow-sm text-slate-900' 
                  : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  statusFilter === tab.id ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Structured Sub-Filters for Completed Tours */}
        {statusFilter === 'completed' && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 pl-1">
              Filter By Outcome:
            </span>
            {[
              { id: 'all', label: 'All Concluded' },
              { id: '5star', label: '⭐ 5★ Google Reviews' },
              { id: 'feedback', label: '⚠️ Reported Issues / Feedback' },
              { id: 'pending', label: '⏳ Review Pending' }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setCompletedSubFilter(sub.id)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${
                  completedSubFilter === sub.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tours Grid */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : !filteredTours || filteredTours.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-white shadow-sm">
          <Luggage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No tours match your criteria</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto text-xs">
            {searchTerm ? 'Try adjusting your search terms.' : `There are currently no ${statusFilter !== 'all' ? statusFilter : ''} tours.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTours.map((tour: any) => {
            const isRunning = tour.status === 'running';
            const isCompleted = tour.status === 'completed';
            const isCancelled = tour.status === 'cancelled';
            const isUpcoming = tour.status === 'upcoming';
            const progress = isRunning ? getTourProgress(tour.startDate, tour.endDate) : null;

            return (
              <Card 
                key={tour.id} 
                className={`transition-all duration-200 group overflow-hidden rounded-2xl flex flex-col justify-between ${
                  isRunning 
                    ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/30 to-white shadow-md hover:shadow-xl ring-1 ring-emerald-400/20' 
                    : isCompleted 
                    ? 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow-md'
                    : isCancelled
                    ? 'border-rose-100 bg-rose-50/20 opacity-80'
                    : 'border-slate-200 bg-white hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Header Banner */}
                  <CardHeader className="p-4 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                            {tour.tourCode}
                          </span>
                          {tour.query?.queryCode && (
                            <Link 
                              href={`/queries/${tour.query.id}`}
                              className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-0.5"
                            >
                              ({tour.query.queryCode})
                            </Link>
                          )}
                        </div>
                        <CardTitle className="text-base font-black text-slate-900 leading-tight">
                          {tour.query?.name ?? 'Valued Guest'}
                        </CardTitle>
                      </div>

                      {/* Status Badges */}
                      {isRunning ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase shadow-sm shadow-emerald-500/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          <span>Day {progress?.elapsedDays} of {progress?.totalDays}</span>
                        </div>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          Completed
                        </span>
                      ) : isUpcoming ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {/* Running Trip Live Progress Bar */}
                    {isRunning && progress && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800">
                          <span className="flex items-center gap-1">
                            <Compass className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
                            On Tour Currently
                          </span>
                          <span>{progress.percent}% Completed</span>
                        </div>
                        <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completed Tour: Post-Journey Review Outcome Banner */}
                    {isCompleted && (
                      <div className="mt-2.5">
                        {tour.reviewRating === 5 || tour.reviewAction === 'google_review_redirect' ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 text-amber-900">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                              <span className="text-xs font-black">5.0 ★ Google Review</span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          </div>
                        ) : tour.reviewRating && tour.reviewRating < 5 ? (
                          <div 
                            onClick={() => setSelectedReviewModal(tour)}
                            className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 cursor-pointer hover:bg-rose-100/70 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span className="text-xs font-black">{tour.reviewRating}.0★ Guest Feedback</span>
                              </div>
                              <span className="text-[10px] font-bold text-rose-700 underline">View Notes</span>
                            </div>
                            {tour.reviewDisappointments && Array.isArray(tour.reviewDisappointments) && tour.reviewDisappointments.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {tour.reviewDisappointments.map((tag: string, i: number) => (
                                  <span key={i} className="text-[9px] bg-white border border-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : tour.reviewStatus === 'SENT' ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-xs font-bold">Review Invite Sent ({tour.reviewFollowupCount || 1}/3)</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-700">Awaiting</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-medium">Concluded {getDaysAgo(tour.endDate)}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Archived</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  {/* Card Content & Structured Logistics */}
                  <CardContent className="p-4 pt-1 space-y-3">
                    {/* Destination & Pax Box */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Destination</p>
                        <p className="font-bold text-slate-800 truncate mt-0.5">{tour.destination}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Travelers</p>
                        <p className="font-bold text-slate-800 mt-0.5">{tour.passengerCount} Guests</p>
                      </div>
                    </div>

                    {/* Timeline & Operations */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between font-medium">
                        <span className="flex items-center text-slate-500">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          Travel Dates
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatDateSafe(tour.startDate, 'MMM d')} – {formatDateSafe(tour.endDate, 'MMM d, yyyy')}
                        </span>
                      </div>

                      {tour.assignedOpsUser && (
                        <div className="flex items-center justify-between font-medium">
                          <span className="flex items-center text-slate-500">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            Ops Lead
                          </span>
                          <span className="font-bold text-slate-800">{tour.assignedOpsUser.name}</span>
                        </div>
                      )}

                      {tour.driver && (
                        <div className="flex items-center justify-between font-medium">
                          <span className="flex items-center text-slate-500">
                            <Car className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            Chauffeur
                          </span>
                          <span className="font-bold text-slate-800 truncate max-w-[140px]">
                            {tour.driver.name} {tour.driver.vehicleNo ? `(${tour.driver.vehicleNo})` : tour.driver.vehicleName ? `(${tour.driver.vehicleName})` : ''}
                          </span>
                        </div>
                      )}

                      {tour.sellingPrice && (
                        <div className="flex items-center justify-between font-medium">
                          <span className="flex items-center text-slate-500">
                            <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            Package Value
                          </span>
                          <span className="font-bold text-slate-900">
                            ₹{tour.sellingPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0">
                  <Link href={`/tours/${tour.id}`} className="block">
                    <Button 
                      className={`w-full h-10 rounded-xl font-bold transition-all text-xs ${
                        isRunning 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      <span>View Tour Operations</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Feedback Detail Modal */}
      {selectedReviewModal && (
        <Dialog open={!!selectedReviewModal} onOpenChange={() => setSelectedReviewModal(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md">
                  Guest Feedback Report
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {selectedReviewModal.tourCode}
                </span>
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 mt-2">
                {selectedReviewModal.query?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submitted on {formatDateSafe(selectedReviewModal.reviewCompletedAt, 'MMM d, yyyy • h:mm a')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-5 h-5 ${
                        s <= (selectedReviewModal.reviewRating || 0)
                          ? 'fill-amber-400 text-amber-500' 
                          : 'text-slate-200'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {selectedReviewModal.reviewRating} out of 5 Stars
                </span>
              </div>

              {selectedReviewModal.reviewDisappointments && selectedReviewModal.reviewDisappointments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Reported Pain Points:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedReviewModal.reviewDisappointments.map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-1 rounded-lg font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReviewModal.reviewNotes && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Client Written Notes:</p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                    "{selectedReviewModal.reviewNotes}"
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Customer Phone</span>
                  <a href={`tel:${selectedReviewModal.query?.phone}`} className="font-bold text-slate-900 hover:text-primary">
                    {selectedReviewModal.query?.phone || '—'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Ops Lead</span>
                  <span className="font-bold text-slate-900">
                    {selectedReviewModal.assignedOpsUser?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                className="w-full h-10 rounded-xl text-xs font-bold"
                onClick={() => setSelectedReviewModal(null)}
              >
                Close
              </Button>
              <Link href={`/tours/${selectedReviewModal.id}`} className="w-full">
                <Button className="w-full h-10 rounded-xl text-xs font-bold bg-slate-900 text-white">
                  Open Operations
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
