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

  // Filter by search query and exclude cancelled/lost
  let filteredTours = toursList.filter((t: any) => {
    if (t.status === 'cancelled') return false;
    return (
      t.tourCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.query?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.query?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.query?.queryCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tours & Operations</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              Operations Hub
            </span>
          </div>
          <p className="text-slate-500 mt-0.5 text-xs font-medium">
            Monitor real-time guest journeys, chauffeurs, and post-tour reviews.
          </p>
        </div>
      </div>

      {/* Top Operational Metrics (Minimal 3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'running' ? 'all' : 'running')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'running' 
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' 
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Active On Tour</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{statusCounts.running}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Trips currently in progress</p>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'upcoming' ? 'all' : 'upcoming')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'upcoming' 
              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400' 
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Upcoming Departures</p>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{statusCounts.upcoming}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Departing soon</p>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'completed' 
              ? 'bg-slate-100 border-slate-300 ring-1 ring-slate-400' 
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Completed Tours</p>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{statusCounts.completed}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully concluded</p>
        </div>
      </div>

      {/* Search & Main Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by tour code, guest name, destination..."
              className="pl-9 h-9 rounded-lg border-slate-200 bg-white text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Tabs without Cancelled */}
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
            {[
              { id: 'all', label: 'All Active', count: statusCounts.running + statusCounts.upcoming + statusCounts.completed },
              { id: 'running', label: 'Ongoing', count: statusCounts.running, isLive: true },
              { id: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
              { id: 'completed', label: 'Completed', count: statusCounts.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCompletedSubFilter('all');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  statusFilter === tab.id 
                  ? 'bg-white shadow-sm text-slate-900' 
                  : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.id ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters for Completed Tours */}
        {statusFilter === 'completed' && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Review Status:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: '5star', label: '⭐ 5★ Google Reviews' },
              { id: 'feedback', label: '⚠️ Reported Feedback' },
              { id: 'pending', label: '⏳ Review Pending' }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setCompletedSubFilter(sub.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
                  completedSubFilter === sub.id
                    ? 'bg-slate-900 text-white border-slate-900'
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
        <div className="flex h-56 items-center justify-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : !filteredTours || filteredTours.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-white">
          <Luggage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No active tours found</h3>
          <p className="text-slate-400 mt-0.5 text-xs">
            {searchTerm ? 'Try adjusting your search terms.' : 'There are currently no active tours in this view.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTours.map((tour: any) => {
            const isRunning = tour.status === 'running';
            const isCompleted = tour.status === 'completed';
            const isUpcoming = tour.status === 'upcoming';
            const progress = isRunning ? getTourProgress(tour.startDate, tour.endDate) : null;

            return (
              <Card 
                key={tour.id} 
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-none hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-4 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                          <span className="font-bold text-slate-600">{tour.tourCode}</span>
                          {tour.query?.queryCode && (
                            <Link href={`/queries/${tour.query.id}`} className="hover:text-blue-600">
                              ({tour.query.queryCode})
                            </Link>
                          )}
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900 mt-0.5">
                          {tour.query?.name ?? 'Guest'}
                        </CardTitle>
                      </div>

                      {isRunning ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Day {progress?.elapsedDays}/{progress?.totalDays}
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Review Outcome for Completed Tours */}
                    {isCompleted && (
                      <div className="mt-2">
                        {tour.reviewRating === 5 || tour.reviewAction === 'google_review_redirect' ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span className="font-semibold">5.0 ★ Google Review</span>
                          </div>
                        ) : tour.reviewRating && tour.reviewRating < 5 ? (
                          <div 
                            onClick={() => setSelectedReviewModal(tour)}
                            className="flex items-center justify-between text-xs text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-rose-100/60"
                          >
                            <span className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              {tour.reviewRating}.0★ Feedback
                            </span>
                            <span className="text-[10px] underline font-bold">View</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-2.5">
                    {/* Destination & Travelers */}
                    <div className="flex justify-between items-center py-1.5 px-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">{tour.destination}</span>
                      <span className="font-bold text-slate-900 shrink-0">{tour.passengerCount} Pax</span>
                    </div>

                    {/* Key Details Table */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" /> Dates
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatDateSafe(tour.startDate, 'MMM d')} – {formatDateSafe(tour.endDate, 'MMM d, yyyy')}
                        </span>
                      </div>

                      {tour.assignedOpsUser && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Ops Lead
                          </span>
                          <span className="font-semibold text-slate-800">{tour.assignedOpsUser.name}</span>
                        </div>
                      )}

                      {tour.driver && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Car className="w-3.5 h-3.5" /> Driver
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                            {tour.driver.name} {tour.driver.vehicleNo ? `(${tour.driver.vehicleNo})` : ''}
                          </span>
                        </div>
                      )}

                      {tour.sellingPrice && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-slate-400">Package Value</span>
                          <span className="font-bold text-slate-900">₹{tour.sellingPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Link href={`/tours/${tour.id}`} className="block">
                    <Button 
                      className="w-full h-9 rounded-lg font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 border-slate-900 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>View Tour Operations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
