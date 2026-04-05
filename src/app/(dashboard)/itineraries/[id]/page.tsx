'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus, Trash2, Edit3, Loader2, MapPin, Clock, Image as ImageIcon,
  Upload, X, ChevronRight, Hotel, Camera, Search, ArrowLeft,
  Share2, Download, Copy, Check, GripVertical, Eye,
  Utensils, Car, Plane, Sun, LogIn, LogOut as LogOutIcon,
  Mountain, Compass, IndianRupee, CalendarRange,
  FileText, BookOpen, Pencil, Shield, CreditCard, XCircle, CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { format, addDays } from 'date-fns';
import { MediaLibraryModal } from '@/components/MediaLibraryModal';

const EVENT_TYPES = [
  { value: 'accommodation', label: 'Accommodation', icon: Hotel, color: 'text-blue-600 bg-blue-50' },
  { value: 'sightseeing', label: 'Sightseeing', icon: Mountain, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'activity', label: 'Activity', icon: Compass, color: 'text-purple-600 bg-purple-50' },
  { value: 'transport', label: 'Transport', icon: Car, color: 'text-orange-600 bg-orange-50' },
  { value: 'flight', label: 'Flight', icon: Plane, color: 'text-sky-600 bg-sky-50' },
  { value: 'meal', label: 'Meal', icon: Utensils, color: 'text-rose-600 bg-rose-50' },
  { value: 'checkin', label: 'Check-in', icon: LogIn, color: 'text-teal-600 bg-teal-50' },
  { value: 'checkout', label: 'Check-out', icon: LogOutIcon, color: 'text-slate-600 bg-slate-50' },
  { value: 'freeTime', label: 'Free Time', icon: Sun, color: 'text-amber-600 bg-amber-50' },
];

const getEventType = (type: string) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[1];

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'build');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const eventImgRef = useRef<HTMLInputElement>(null);
  const dayImgRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<'day' | 'packageTerms' | 'gallery'>('day');
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDuration, setEditingDuration] = useState(false);
  const [nightsInput, setNightsInput] = useState<number | ''>('');
  const [eventImgTarget, setEventImgTarget] = useState<string | null>(null);
  
  // Media Library State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<{ 
    type: 'cover' | 'day' | 'event' | 'gallery', 
    id?: string 
  } | null>(null);

  const { data: itinerary, isLoading } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: async () => { const r = await api.get(`/itineraries/${id}`); return r.data.data; },
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations-dropdown'],
    queryFn: () => api.get('/masters-v2/destinations').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['itinerary', id] });

  // Select first day on load
  useEffect(() => {
    if (itinerary?.days?.length && !selectedDayId) {
      setSelectedDayId(itinerary.days[0].id);
    }
  }, [itinerary, selectedDayId]);

  const updateMut = useMutation({ mutationFn: (data: any) => api.put(`/itineraries/${id}`, data), onSuccess: invalidate });
  const addDayMut = useMutation({ mutationFn: (data: any) => api.post(`/itineraries/${id}/days`, data), onSuccess: (res) => { invalidate(); setSelectedDayId(res.data.data.id); } });
  const updateDayMut = useMutation({ mutationFn: ({ dayId, data }: any) => api.put(`/itineraries/days/${dayId}`, data), onSuccess: invalidate });
  const removeDayMut = useMutation({ mutationFn: (dayId: string) => api.delete(`/itineraries/days/${dayId}`), onSuccess: () => { setSelectedDayId(null); invalidate(); } });
  const addEventMut = useMutation({ mutationFn: ({ dayId, data }: any) => api.post(`/itineraries/days/${dayId}/events`, data), onSuccess: invalidate });
  const updateEventMut = useMutation({ mutationFn: ({ eventId, data }: any) => api.put(`/itineraries/events/${eventId}`, data), onSuccess: () => { invalidate(); setEditingEvent(null); } });
  const removeEventMut = useMutation({ mutationFn: (eventId: string) => api.delete(`/itineraries/events/${eventId}`), onSuccess: invalidate });
  const deleteItineraryMut = useMutation({
    mutationFn: () => api.delete(`/itineraries/${id}`),
    onSuccess: () => {
      toast.success('Itinerary deleted');
      router.push('/itineraries');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('photo', file);
    try { await api.post(`/itineraries/${id}/cover-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Cover photo updated'); invalidate(); }
    catch { toast.error('Upload failed'); }
    finally { e.target.value = ''; }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files?.length) return;
    const fd = new FormData(); Array.from(files).forEach(f => fd.append('photos', f));
    try { await api.post(`/itineraries/${id}/gallery`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Gallery images added'); invalidate(); }
    catch { toast.error('Upload failed'); }
    finally { e.target.value = ''; }
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !eventImgTarget) return;
    const fd = new FormData(); fd.append('photo', file);
    try { await api.post(`/itineraries/events/${eventImgTarget}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Image updated'); invalidate(); }
    catch { toast.error('Upload failed'); }
    finally {
      e.target.value = '';
      setEventImgTarget(null);
    }
  };

  const handleDayImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !selectedDayId) return;
    const fd = new FormData(); fd.append('photo', file);
    try { await api.put(`/itineraries/days/${selectedDayId}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Day image updated'); invalidate(); }
    catch { toast.error('Upload failed'); }
    finally { e.target.value = ''; }
  };

  const handleShare = async () => {
    try {
      const res = await api.post(`/itineraries/${id}/generate-share-link`);
      const slug = res.data.data.shareSlug;
      // ALWAYS use the production domain for share links unless on a dev build
      const baseUrl = window.location.hostname === 'localhost' 
        ? window.location.origin 
        : 'https://imagicaholidays.com';
      const url = `${baseUrl}/share/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard!');
      invalidate();
    } catch { toast.error('Failed to generate link'); }
  };

  const handleExportPdf = async () => {
    try {
      const res = await api.get(`/itineraries/${id}/export-pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `Itinerary-${itinerary?.title || 'export'}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch { toast.error('PDF export failed'); }
  };

  const openMediaLibrary = (type: 'cover' | 'day' | 'event' | 'gallery', targetId?: string) => {
    setMediaModalTarget({ type, id: targetId });
    setIsMediaModalOpen(true);
  };

  const handleMediaSelect = async (url: string) => {
    if (!mediaModalTarget) return;
    const { type, id: targetId } = mediaModalTarget;

    try {
      if (type === 'cover') {
        await updateMut.mutateAsync({ coverPhotoUrl: url });
        toast.success('Cover photo updated from library');
      } else if (type === 'day' && targetId) {
        await api.put(`/itineraries/days/${targetId}`, { imageUrl: url });
        toast.success('Day image updated from library');
        invalidate();
      } else if (type === 'event' && targetId) {
        await api.put(`/itineraries/events/${targetId}`, { imageUrl: url });
        toast.success('Event image updated from library');
        invalidate();
      } else if (type === 'gallery') {
        await api.post(`/itineraries/${id}/gallery-bulk`, { imageUrls: [url] });
        toast.success('Image added to itinerary gallery');
        invalidate();
      }
    } catch (err) {
      toast.error('Failed to update image from library');
    } finally {
      setIsMediaModalOpen(false);
      setMediaModalTarget(null);
    }
  };

  const handleFinalize = () => {
    updateMut.mutate({ status: 'finalized' }, {
      onSuccess: () => {
        toast.success(
          'Itinerary Finalized! Ready to be converted into a Proposal.', 
          { description: 'You can now select this itinerary when creating a proposal for a lead.' }
        );
      }
    });
  };

  const handlePublishTemplate = async () => {
    try {
      const res = await api.post(`/itineraries/${id}/publish-template`);
      toast.success(res.data.message || 'Saved as a new Master Template!');
      // Navigate to the newly created template
      if (res.data?.data?.id) {
        router.push(`/itineraries/${res.data.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish template');
    }
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" /></div>;
  if (!itinerary) return <div className="text-center py-20 text-muted-foreground">Itinerary not found</div>;

  const selectedDay = itinerary.days?.find((d: any) => d.id === selectedDayId);
  const allDestinations = Array.from(new Set(itinerary.days?.map((d: any) => d.destination?.name).filter(Boolean))) as string[];
  const clientQuery = itinerary.proposals?.[0]?.query;

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Hidden file inputs */}
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
      <input ref={eventImgRef} type="file" accept="image/*" className="hidden" onChange={handleEventImageUpload} />
      <input ref={dayImgRef} type="file" accept="image/*" className="hidden" onChange={handleDayImageUpload} />

      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)} 
        onSelect={handleMediaSelect}
        title={
          mediaModalTarget?.type === 'cover' ? 'Select Cover Photo' :
          mediaModalTarget?.type === 'day' ? 'Select Day Photo' :
          mediaModalTarget?.type === 'event' ? 'Select Event Photo' : 'Select Gallery Photo'
        }
      />

       {/* Header with cover photo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className={cn(
          "relative rounded-2xl overflow-hidden shadow-xl min-h-[180px] transition-all duration-700",
          itinerary.coverPhotoUrl ? "bg-slate-900" : "bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800"
        )}>
          {itinerary.coverPhotoUrl && (
            <img 
              src={itinerary.coverPhotoUrl} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000" 
            />
          )}
          {/* Subtle Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative p-6 md:p-8 z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <Link href="/itineraries" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-xs font-medium mb-3 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Itineraries
                </Link>
                
                {clientQuery && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 shadow-xl border border-blue-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Draft Working Copy For: {clientQuery.name} 
                      <span className="opacity-60 text-[10px] uppercase font-black tracking-wider ml-1">({clientQuery.queryCode})</span>
                    </span>
                  </div>
                )}
                {editingTitle ? (
                  <div className="flex items-center gap-2 max-w-xl">
                    <Input 
                      value={titleInput} 
                      onChange={e => setTitleInput(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 font-black text-2xl h-12 rounded-xl focus:ring-0 focus:border-white/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateMut.mutate({ title: titleInput }, { onSuccess: () => setEditingTitle(false) });
                        } else if (e.key === 'Escape') setEditingTitle(false);
                      }}
                      autoFocus
                    />
                    <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => {
                      updateMut.mutate({ title: titleInput }, { onSuccess: () => setEditingTitle(false) });
                    }}><Check className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-xl" onClick={() => setEditingTitle(false)}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 group cursor-pointer text-white" onClick={() => { setTitleInput(itinerary.title); setEditingTitle(true); }}>
                    {itinerary.title}
                    <Pencil className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                )}
                {allDestinations.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-white/70" />
                    {allDestinations.map((d: string) => <span key={d} className="text-[10px] uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded font-bold text-white shadow-sm border border-white/10">{d}</span>)}
                  </div>
                )}

                {/* Travel Date Pickers */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                    <CalendarRange className="w-4 h-4 text-white/70 ml-1" />
                    <input 
                      type="date"
                      value={itinerary.travelDateFrom ? format(new Date(itinerary.travelDateFrom), 'yyyy-MM-dd') : ''}
                      onChange={(e) => updateMut.mutate({ travelDateFrom: e.target.value || null })}
                      className="bg-transparent text-xs font-bold text-white outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                      title="Travel Date (From)"
                    />
                    <span className="text-white/40 font-bold px-1">→</span>
                    <input 
                      type="date"
                      value={itinerary.travelDateTo ? format(new Date(itinerary.travelDateTo), 'yyyy-MM-dd') : ''}
                      onChange={(e) => updateMut.mutate({ travelDateTo: e.target.value || null })}
                      className="bg-transparent text-xs font-bold text-white outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                      title="Travel Date (To)"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/20 px-2 py-1 flex items-center rounded-md font-bold text-[10px] uppercase tracking-wider text-white border border-white/10">
                    {itinerary.status}
                  </span>
                  {editingDuration ? (
                     <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          value={nightsInput} 
                          onChange={e => setNightsInput(e.target.value ? parseInt(e.target.value) : '')}
                          className="w-16 h-7 bg-white/20 border-white/30 text-white rounded-lg text-xs font-bold"
                          placeholder="Nights"
                          autoFocus
                        />
                        <button 
                          className="bg-emerald-500 p-1.5 rounded-lg text-white"
                          onClick={() => {
                            updateMut.mutate({ nights: nightsInput === '' ? null : nightsInput }, { onSuccess: () => setEditingDuration(false) });
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button className="text-white/60 hover:text-white" onClick={() => setEditingDuration(false)}><X className="w-3 h-3" /></button>
                     </div>
                  ) : (
                    <span 
                      className="text-white/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-white cursor-pointer group/dur"
                      onClick={() => {
                        setNightsInput(itinerary.nights || '');
                        setEditingDuration(true);
                      }}
                    >
                      {itinerary.days?.length || 0} Days
                      {itinerary.nights !== null && itinerary.nights !== undefined && (
                        <> • {itinerary.nights} Nights</>
                      )}
                      <Pencil className="w-3 h-3 opacity-0 group-hover/dur:opacity-100 transition-opacity" />
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 md:justify-end shrink-0 items-center">
                {/* Compact Tabs in Header */}
                <TabsList className="bg-white/10 border border-white/20 rounded-xl p-1 h-9 mr-2">
                  <TabsTrigger value="build" className="rounded-lg font-bold text-[10px] uppercase tracking-wider text-white/70 data-[state=active]:bg-white data-[state=active]:text-primary px-3 transition-all">Build</TabsTrigger>
                  <TabsTrigger value="pricing" className="rounded-lg font-bold text-[10px] uppercase tracking-wider text-white/70 data-[state=active]:bg-white data-[state=active]:text-primary px-3 transition-all">Pricing</TabsTrigger>
                  <TabsTrigger value="final" className="rounded-lg font-bold text-[10px] uppercase tracking-wider text-white/70 data-[state=active]:bg-white data-[state=active]:text-primary px-3 transition-all">Final</TabsTrigger>
                </TabsList>

                {!itinerary.isTemplate && (
                  <Button size="sm" className="rounded-xl font-bold text-xs h-9 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 shadow-md shadow-emerald-500/20 text-white" onClick={handlePublishTemplate}>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Save as Template
                  </Button>
                )}

                <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs h-9" onClick={() => openMediaLibrary('cover')}>
                  <ImageIcon className="w-3.5 h-3.5 mr-1" /> Library
                </Button>
                <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs h-9" onClick={() => coverRef.current?.click()}>
                  <Camera className="w-3.5 h-3.5 mr-1" /> Upload
                </Button>
                <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs h-9" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>
                <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs h-9" onClick={handleExportPdf}>
                  <Download className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-4">
          {/* ═══ BUILD TAB ═══ */}
          <TabsContent value="build" className="space-y-0 mt-0 data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Day List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Days</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {itinerary.days?.map((day: any) => (
                    <div key={day.id} className="relative group/dayitem">
                      <button
                        onClick={() => {
                          setSelectedDayId(day.id);
                          setActiveSection('day');
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-xl transition-all group text-left",
                          activeSection === 'day' && selectedDayId === day.id 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100" 
                            : "hover:bg-slate-100 text-slate-600"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] transition-colors",
                          activeSection === 'day' && selectedDayId === day.id ? "bg-white text-blue-600" : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                        )}>
                          {day.dayNumber}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="font-bold text-xs truncate">
                            {day.destination?.name || 'Day ' + day.dayNumber}
                          </div>
                          {itinerary.travelDateFrom && (
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {format(addDays(new Date(itinerary.travelDateFrom), day.dayNumber - 1), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </button>
                      <button 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-rose-500 opacity-0 group-hover/dayitem:opacity-100 hover:bg-rose-50 transition-all active:scale-75"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete Day ${day.dayNumber}? All events on this day will be lost.`)) {
                            removeDayMut.mutate(day.id);
                          }
                        }}
                        title="Delete Day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addDayMut.mutate({ dayNumber: (itinerary.days?.length || 0) + 1 })}
                    className="flex items-center gap-2 p-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all font-bold text-[10px] uppercase tracking-wider mb-2"
                  >
                    <Plus className="w-4 h-4 ml-1" /> Add Day
                  </button>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setActiveSection('packageTerms')}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-xl transition-all group text-left",
                        activeSection === 'packageTerms' 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100" 
                          : "hover:bg-slate-100 text-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        activeSection === 'packageTerms' ? "bg-white text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">Package Terms</span>
                    </button>

                    <button
                      onClick={() => setActiveSection('gallery')}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-xl transition-all group text-left",
                        activeSection === 'gallery' 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100" 
                          : "hover:bg-slate-100 text-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        activeSection === 'gallery' ? "bg-white text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">Image Gallery</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Center: Content Area */}
              <div className="lg:col-span-7">
                {activeSection === 'day' ? (
                  <div className="space-y-6">
                    {selectedDay ? (
                      <div className="space-y-0">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                              {selectedDay.dayNumber}
                            </div>
                            <div>
                              <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase">Day {selectedDay.dayNumber} Timeline</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                  <MapPin className="w-3 h-3" /> {selectedDay.destination?.name || 'Destination Unset'}
                                </div>
                                {itinerary.travelDateFrom && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                      {format(addDays(new Date(itinerary.travelDateFrom), selectedDay.dayNumber - 1), 'EEEE, MMM d yyyy')}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <Button 
                              size="sm" 
                              className="rounded-xl font-bold text-xs h-9 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                              onClick={() => setShowEventDropdown(!showEventDropdown)}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
                            </Button>
                            {showEventDropdown && (
                              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 w-52 overflow-hidden animate-in fade-in zoom-in-95">
                                {EVENT_TYPES.map(type => (
                                  <button
                                    key={type.value}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-left text-sm transition-colors"
                                    onClick={() => {
                                      addEventMut.mutate({ dayId: selectedDayId, data: { type: type.value, title: type.label } });
                                      setShowEventDropdown(false);
                                    }}
                                  >
                                    <div className={cn('p-1.5 rounded-lg text-slate-500 bg-slate-100')}><type.icon className="w-3.5 h-3.5" /></div>
                                    <span className="font-bold text-xs text-slate-700">{type.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Day Headline Card */}
                        <div className="relative pl-8 border-l-2 border-slate-100 ml-5 -mt-2 pb-10">
                          <div className="absolute top-0 -left-[11px] w-5 h-5 rounded-full bg-white border-4 border-slate-200 shadow-sm z-10" />
                          
                          <Card className={cn(
                            "bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300",
                            editingDayId === selectedDay.id ? "ring-2 ring-blue-500 border-transparent" : ""
                          )}>
                            <div className="flex flex-col md:flex-row min-h-[200px]">
                              <div className="md:w-1/3 bg-slate-50 border-r border-slate-100 relative group/dayimg overflow-hidden shrink-0 min-h-[160px]">
                                {selectedDay.imageUrl ? (
                                  <img src={selectedDay.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/dayimg:scale-110" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <ImageIcon className="w-8 h-8 opacity-20 mb-2" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Add Image</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/dayimg:opacity-100 transition-opacity text-white gap-3 p-4 text-center">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Flagship Photo</p>
                                  <div className="flex flex-col gap-2 w-full max-w-[120px]">
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="rounded-xl font-bold text-[10px] h-8 bg-white/20 hover:bg-white/40 border-white/30 text-white" 
                                      onClick={(e) => { e.stopPropagation(); openMediaLibrary('day', selectedDay.id); }}
                                    >
                                      <ImageIcon className="w-3.5 h-3.5 mr-1" /> Library
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="secondary" 
                                      className="rounded-xl font-bold text-[10px] h-8 bg-white/20 hover:bg-white/40 border-white/30 text-white"
                                      onClick={(e) => { e.stopPropagation(); dayImgRef.current?.click(); }}
                                    >
                                      <Upload className="w-3.5 h-3.5 mr-1" /> Upload
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 p-6 relative">
                                <button 
                                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm z-10"
                                  onClick={() => setEditingDayId(editingDayId === selectedDay.id ? null : selectedDay.id)}
                                >
                                  {editingDayId === selectedDay.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4" />}
                                </button>

                                {editingDayId === selectedDay.id ? (
                                  <EditingDayForm 
                                    day={selectedDay} 
                                    onSave={(data) => updateDayMut.mutate({ dayId: selectedDay.id, data })}
                                  />
                                ) : (
                                  <div className="pr-8">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">Editorial Intro</div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-800 leading-tight mb-3">
                                      {selectedDay.title || `Day ${selectedDay.dayNumber}: Introduction`}
                                    </h2>
                                    <p className="text-[13px] font-medium text-slate-500 leading-relaxed line-clamp-4">
                                      {selectedDay.description || "Start adding a beautiful description or use a template from the right panel to populate this section."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Timeline Events */}
                        <div className="space-y-0">
                          {selectedDay.events?.map((ev: any) => {
                            const evType = getEventType(ev.type);
                            return (
                              <div key={ev.id} className="relative pl-8 border-l-2 border-slate-100 ml-5 pb-8">
                                <div className="absolute top-4 -left-[14px] w-7 h-7 rounded-full border-[3px] border-white bg-slate-100 flex items-center justify-center shadow-sm z-20">
                                  <evType.icon className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                                <motion.div 
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  className="group flex-1"
                                >
                                  <Card className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group duration-300 hover:-translate-y-1">
                                    <div className="flex flex-col sm:flex-row min-h-[140px]">
                                      <div className="sm:w-32 h-32 sm:h-auto bg-slate-50 border-r border-slate-100 relative group/img flex-shrink-0">
                                        {ev.imageUrl ? (
                                          <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                            <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-30">No Image</span>
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 scale-90 group-hover/img:scale-100 text-white gap-2 p-2">
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-7 w-full rounded-xl text-[9px] font-bold text-white hover:bg-white/20 border border-white/20"
                                            onClick={(e) => { e.stopPropagation(); openMediaLibrary('event', ev.id); }}
                                          >
                                            <ImageIcon className="w-3.5 h-3.5 mr-1" /> Library
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-7 w-full rounded-xl text-[9px] font-bold text-white hover:bg-white/20 border border-white/20"
                                            onClick={(e) => { e.stopPropagation(); setEventImgTarget(ev.id); eventImgRef.current?.click(); }}
                                          >
                                            <Upload className="w-3.5 h-3.5 mr-1" /> Upload
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="flex-1 p-5 flex flex-col">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <h4 className="font-black text-slate-800 tracking-tight leading-none">{ev.title}</h4>
                                              {ev.type === 'accommodation' && ev.metadata?.category && (
                                                <div className="flex gap-0.5">
                                                  {Array.from({ length: parseInt(ev.metadata.category) || 3 }).map((_, i) => (
                                                    <Sun key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                            {ev.type === 'accommodation' && ev.metadata?.hotelOption && (
                                              <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">
                                                {ev.metadata.hotelOption}
                                              </span>
                                            )}
                                          </div>
                                          
                                          <div className="flex gap-1">
                                            <button className="h-8 w-8 flex items-center justify-center bg-slate-50 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-slate-100" onClick={() => setEditingEvent(ev)}><Edit3 className="w-4 h-4" /></button>
                                            <button className="h-8 w-8 flex items-center justify-center bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-slate-100" onClick={() => removeEventMut.mutate(ev.id)}><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                        </div>

                                        {ev.type === 'accommodation' ? (
                                          <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-1">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-in</div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                  <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
                                                  {ev.metadata?.checkInDate || 'Not set'}
                                                </div>
                                              </div>
                                              <div className="space-y-1">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-out</div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                                                  <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
                                                  {ev.metadata?.checkOutDate || 'Not set'}
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                                              {ev.metadata?.roomType && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                  <Hotel className="w-3.5 h-3.5" />
                                                  <span className="uppercase tracking-wide">{ev.metadata.roomType}</span>
                                                </div>
                                              )}
                                              {ev.metadata?.mealPlan && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                  <Utensils className="w-3.5 h-3.5" />
                                                  <span className="uppercase tracking-wide">{ev.metadata.mealPlan}</span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {ev.description && (
                                              <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-3 py-1">
                                                {ev.description}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            {ev.description && <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{ev.description}</p>}
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                              {ev.startTime && (
                                                <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                                  <Clock className="w-3 h-3" /> {ev.startTime}
                                                </span>
                                              )}
                                              {ev.cost && (
                                                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border border-emerald-100 shadow-sm shadow-emerald-100/50">
                                                  ₹{Number(ev.cost).toLocaleString('en-IN')}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                </motion.div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-300 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 h-full">
                        <ChevronRight className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold text-sm uppercase tracking-widest">Select a day to edit</p>
                      </div>
                    )}
                  </div>
                ) : activeSection === 'packageTerms' ? (
                  <PackageTermsEditor itinerary={itinerary} onUpdate={(data: any) => updateMut.mutate(data)} />
                ) : (
                  <GalleryEditor itinerary={itinerary} onOpenLibrary={(type) => openMediaLibrary(type)} />
                )}
              </div>

              {/* Right: Suggestions */}
              <div className="lg:col-span-3 space-y-4">
                <SuggestionsPanel 
                  selectedDay={selectedDay} 
                  onAddEvent={(data: any) => { if (selectedDayId) addEventMut.mutate({ dayId: selectedDayId, data }); }} 
                  onUpdateDay={(data: any) => { if (selectedDayId) updateDayMut.mutate({ dayId: selectedDayId, data }); }}
                />
              </div>
            </div>
          </TabsContent>

          {/* ═══ PRICING TAB ═══ */}
          <TabsContent value="pricing" className="mt-0">
            <PricingTab itinerary={itinerary} onUpdate={(data: any) => updateMut.mutate(data)} />
          </TabsContent>

          {/* ═══ FINAL TAB ═══ */}
          <TabsContent value="final" className="mt-0">
            <FinalPreviewTab 
              itinerary={itinerary} 
              onShare={handleShare} 
              onExport={handleExportPdf}
              onDelete={() => deleteItineraryMut.mutate()}
              isDeleting={deleteItineraryMut.isPending}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Event Edit Modal */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          itinerary={itinerary}
          destId={itinerary.days?.find((d: any) => d.id === editingEvent.dayId)?.destinationId}
          onClose={() => setEditingEvent(null)}
          onDelete={(id) => {
            removeEventMut.mutate(id);
            setEditingEvent(null);
          }}
          onSave={(data) => {
            updateEventMut.mutate({ eventId: editingEvent.id, data });
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function EditingDayForm({ day, onSave }: { day: any; onSave: (data: any) => void }) {
  const [title, setTitle] = useState(day.title || '');
  const [description, setDescription] = useState(day.description || '');

  // Sync local state if day changes externally (e.g. from template)
  useEffect(() => {
    setTitle(day.title || '');
    setDescription(day.description || '');
  }, [day.title, day.description]);

  const handleSave = () => {
    if (title !== (day.title || '') || description !== (day.description || '')) {
      onSave({ title, description });
    }
  };

  return (
    <div className="space-y-4 pr-10 animate-in fade-in slide-in-from-top-1">
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Headline</label>
        <Input 
          className="font-black text-lg bg-slate-50 border-slate-200 h-10 rounded-xl focus:ring-0 focus:border-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Enter Day Headline..."
        />
      </div>
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Description</label>
        <textarea 
          className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          placeholder="Write a beautiful description..."
        />
      </div>
    </div>
  );
}

function SuggestionsPanel({ selectedDay, onAddEvent, onUpdateDay }: { selectedDay: any; onAddEvent: (data: any) => void; onUpdateDay: (data: any) => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'hotels' | 'activities' | 'transfers' | 'dayItinerary'>('dayItinerary');
  const destId = selectedDay?.destinationId;

  const { data } = useQuery({
    queryKey: ['suggestions', category, destId, search],
    queryFn: async () => {
      if (!destId && category !== 'dayItinerary') return [];
      let path = '';
      if (category === 'hotels') path = '/masters/hotels';
      else if (category === 'dayItinerary') path = '/masters-v2/day-itinerary-templates';
      else path = `/masters-v2/${category}`;
      
      const res = await api.get(path, { params: search ? { search } : {} });
      const items = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.items || res.data || []);
      
      if (category === 'dayItinerary') return items;
      return items.filter((i: any) => i.destinationId === destId);
    },
    enabled: category === 'dayItinerary' ? true : !!destId,
  });

  const typeMap: Record<string, string> = { hotels: 'accommodation', activities: 'activity', transfers: 'transport', dayItinerary: 'sightseeing' };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-slate-700 font-black uppercase tracking-widest opacity-50">Suggestions</h3>
      
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['dayItinerary', 'hotels', 'activities', 'transfers'] as const).map(c => (
          <button key={c} onClick={() => setCategory(c)} className={cn('px-4 py-2 rounded-xl text-[10px] whitespace-nowrap font-black uppercase tracking-wider transition-all shadow-sm', category === c ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50')}>
            {c === 'dayItinerary' ? 'Day Templates' : c}
          </button>
        ))}
      </div>
          
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder={`Search ${category}...`} className="pl-9 h-11 text-xs rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-slate-200" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {!destId && category !== 'dayItinerary' ? (
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-xs font-bold text-slate-400 bg-slate-50/50">
          <MapPin className="w-8 h-8 mx-auto mb-3 opacity-20" />
          Set destination to see local items
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 pb-10 no-scrollbar">
          {(data || []).map((item: any) => (
            <div key={item.id} className="flex gap-4 p-4 border border-slate-200/80 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all group relative">
              {item.photoUrl ? (
                <img src={item.photoUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-slate-100 flex-shrink-0" alt="" />
              ) : (
                 <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                   {category === 'hotels' ? <Hotel className="w-6 h-6 text-slate-200" /> : <ImageIcon className="w-6 h-6 text-slate-200" />}
                 </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-black text-xs text-slate-800 truncate leading-tight">{item.title || item.name || item.vehicleType}</p>
                {item.category && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{item.category}</p>}
                {(item.basePrice || item.pricePerPerson || item.price) && (
                  <p className="text-[11px] font-black text-slate-900 mt-1.5">₹{Number(item.basePrice || item.pricePerPerson || item.price).toLocaleString('en-IN')}</p>
                )}
              </div>
              <div className="flex items-center">
                <button 
                  className="h-9 w-9 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full flex-shrink-0 shadow-lg transition-transform active:scale-90" 
                  onClick={() => {
                    if (category === 'dayItinerary') {
                      onUpdateDay({ title: item.title, description: item.description, imageUrl: item.photoUrl });
                      toast.success('Applied Day Template');
                    } else {
                      const eventData = {
                        type: typeMap[category],
                        title: item.title || item.name || item.vehicleType || 'Event',
                        description: item.description || '',
                        cost: item.basePrice || item.pricePerPerson || item.price || 0,
                        metadata: { masterType: category, masterId: item.id, ...item },
                      };
                      onAddEvent(eventData);
                      toast.success(`Added ${item.title || item.name || item.vehicleType}`);
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {data?.length === 0 && <p className="text-center text-xs font-bold text-slate-300 py-10 uppercase tracking-widest">No Results</p>}
        </div>
      )}
    </div>
  );
}

function EventEditModal({ event, onClose, onSave, onDelete, destId, itinerary }: { event: any; onClose: () => void; onSave: (data: any) => void; onDelete: (id: string) => void; destId?: string; itinerary: any }) {
  const [form, setForm] = useState(() => ({ 
    ...event, 
    description: event.description || '', 
    metadata: event.metadata || {} 
  }));
  const [accomMode, setAccomMode] = useState<'manual' | 'master'>(event.metadata?.masterId ? 'master' : 'manual');
  
  // Update state if event changes externally
  useEffect(() => {
    setForm({ ...event, description: event.description || '', metadata: event.metadata || {} });
  }, [event]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setMeta = (k: string, v: any) => setForm((f: any) => ({ ...f, metadata: { ...f.metadata, [k]: v } }));
  const evType = getEventType(form.type);

  const { data: hotels } = useQuery({
    queryKey: ['hotels', destId],
    queryFn: async () => {
      if (!destId) return [];
      const res = await api.get('/masters/hotels');
      return res.data.data.filter((h: any) => h.destinationId === destId);
    },
    enabled: form.type === 'accommodation' && accomMode === 'master' && !!destId,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn("bg-white rounded-[32px] shadow-2xl w-full overflow-hidden flex flex-col transition-all duration-300", form.type === 'accommodation' ? 'max-w-2xl max-h-[90vh]' : 'max-w-lg max-h-[85vh]')} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-2xl shadow-sm border bg-white', evType.color)}><evType.icon className="w-5 h-5" /></div>
            <h2 className="font-black text-lg text-slate-800">
              {form.type === 'accommodation' 
                ? `Accommodation From ${form.metadata?.checkInDate || '...'}`
                : `Edit ${evType.label}`}
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-200/50 transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {form.type !== 'accommodation' && (
            <>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Title</label><Input className="h-11 rounded-2xl border-slate-200 focus:border-blue-400 focus:ring-0 bg-slate-50/50" value={form.title} onChange={e => set('title', e.target.value)} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Description</label><textarea className="w-full min-h-[80px] px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm focus:border-blue-400 focus:ring-0 resize-none transition-all" value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Start Time</label><Input type="time" className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.startTime || ''} onChange={e => set('startTime', e.target.value)} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">End Time</label><Input type="time" className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.endTime || ''} onChange={e => set('endTime', e.target.value)} /></div>
              </div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Cost (₹)</label><Input type="number" className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.cost || ''} onChange={e => set('cost', e.target.value)} /></div>
            </>
          )}

          {form.type === 'accommodation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Destination</label>
                  <select 
                    className="w-full h-11 px-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm focus:border-blue-400 focus:ring-0 outline-none"
                    value={form.metadata?.destinationId || ''}
                    onChange={(e) => setMeta('destinationId', e.target.value)}
                  >
                    <option value="">Choose Destination</option>
                    {(itinerary.days?.map((d: any) => d.destination).filter(Boolean).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.id === v.id) === i) || []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Type</label>
                  <select 
                    className="w-full h-11 px-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm focus:border-blue-400 focus:ring-0 outline-none"
                    value={accomMode}
                    onChange={(e) => setAccomMode(e.target.value as 'manual' | 'master')}
                  >
                    <option value="manual">Manual</option>
                    <option value="master">From Master</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 items-end">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Hotel Name</label>
                  {accomMode === 'master' ? (
                    <select 
                      className="w-full h-11 px-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm focus:border-blue-400 focus:ring-0"
                      value={form.metadata?.masterId || ''}
                      onChange={e => {
                        const h = hotels?.find((ht: any) => ht.id === e.target.value);
                        if (h) {
                          set('title', h.name);
                          setMeta('masterId', h.id);
                          setMeta('hotelName', h.name);
                          setMeta('category', h.category);
                        }
                      }}
                    >
                      <option value="">-- Choose Hotel --</option>
                      {(hotels || []).map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" 
                      value={form.metadata?.hotelName || ''} 
                      onChange={e => {
                        setMeta('hotelName', e.target.value);
                        set('title', e.target.value);
                      }} 
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Category</label>
                  <select 
                    className="w-full h-11 px-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm focus:border-blue-400 focus:ring-0"
                    value={form.metadata?.category || ''}
                    onChange={(e) => setMeta('category', e.target.value)}
                  >
                    <option value="">Choose</option>
                    <option value="Standard">Standard</option>
                    <option value="3 Star">3 Star</option>
                    <option value="4 Star">4 Star</option>
                    <option value="5 Star">5 Star</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Room Name</label>
                  <Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.roomType || ''} onChange={e => setMeta('roomType', e.target.value)} placeholder="e.g. DELUXE" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Meal Plan</label>
                  <Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.mealPlan || ''} onChange={e => setMeta('mealPlan', e.target.value)} placeholder="e.g. map" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Hotel Option</label>
                  <select className="w-full h-11 px-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm focus:border-blue-400 focus:ring-0" value={form.metadata?.hotelOption || 'Option 1'} onChange={e => setMeta('hotelOption', e.target.value)}>
                    <option value="Option 1">Option 1</option>
                    <option value="Option 2">Option 2</option>
                    <option value="Option 3">Option 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest block mb-3 ml-1">Enter Number of Rooms</label>
                <div className="grid grid-cols-6 gap-3 bg-slate-50/80 p-4 rounded-[24px] border border-slate-100 shadow-sm">
                  {[
                    { key: 'single', label: 'Single' },
                    { key: 'double', label: 'Double' },
                    { key: 'triple', label: 'Triple' },
                    { key: 'quad', label: 'Quad' },
                    { key: 'cwb', label: 'CWB' },
                    { key: 'cnb', label: 'CNB' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-1.5">{field.label}</label>
                      <input 
                        type="number" 
                        className="w-full h-10 text-center text-sm font-bold border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 outline-none shadow-sm"
                        value={form.metadata?.rooms?.[field.key] || 0}
                        onChange={(e) => {
                          const currentRooms = form.metadata?.rooms || {};
                          setMeta('rooms', { ...currentRooms, [field.key]: parseInt(e.target.value) || 0 });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50/40 p-5 rounded-[28px] border border-amber-100/60 shadow-inner grid grid-cols-2 gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><div className="w-12 h-12 rounded-full border-4 border-amber-400/20" /></div>
                <div>
                  <label className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest block mb-2 ml-1">Check-in*</label>
                  <div className="flex gap-2">
                    <Input type="date" className="h-11 rounded-2xl border-amber-200/50 bg-white shadow-sm flex-1" value={form.metadata?.checkInDate || ''} onChange={e => setMeta('checkInDate', e.target.value)} />
                    <select className="w-24 h-11 px-3 border border-amber-200/50 rounded-2xl bg-white shadow-sm text-xs font-bold" value={form.metadata?.checkInTime || '12:00'} onChange={e => setMeta('checkInTime', e.target.value)}>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest block mb-2 ml-1">Check-out*</label>
                  <div className="flex gap-2">
                    <Input type="date" className="h-11 rounded-2xl border-amber-200/50 bg-white shadow-sm flex-1" value={form.metadata?.checkOutDate || ''} onChange={e => setMeta('checkOutDate', e.target.value)} />
                    <select className="w-24 h-11 px-3 border border-amber-200/50 rounded-2xl bg-white shadow-sm text-xs font-bold" value={form.metadata?.checkOutTime || '12:00'} onChange={e => setMeta('checkOutTime', e.target.value)}>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{i.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Description</label>
                <textarea 
                  className="w-full min-h-[100px] px-5 py-4 border border-slate-200 rounded-[28px] bg-white text-sm focus:border-blue-400 focus:ring-0 resize-none shadow-sm transition-all" 
                  value={form.description || ''} 
                  placeholder="e.g. 2 rooms with breakfast and dinner"
                  onChange={e => set('description', e.target.value)} 
                />
              </div>
            </div>
          )}
          
          {form.type === 'flight' && (<>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Airline</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.airline || ''} onChange={e => setMeta('airline', e.target.value)} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Flight No.</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.flightNumber || ''} onChange={e => setMeta('flightNumber', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">From</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.from || ''} onChange={e => setMeta('from', e.target.value)} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">To</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.to || ''} onChange={e => setMeta('to', e.target.value)} /></div>
            </div>
          </>)}
          {form.type === 'transport' && (<>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Vehicle / Mode</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.vehicle || ''} onChange={e => setMeta('vehicle', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">From</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.from || ''} onChange={e => setMeta('from', e.target.value)} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">To</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.to || ''} onChange={e => setMeta('to', e.target.value)} /></div>
            </div>
          </>)}
          {form.type === 'meal' && (<>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Restaurant</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.restaurant || ''} onChange={e => setMeta('restaurant', e.target.value)} /></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Cuisine / Type</label><Input className="h-11 rounded-2xl border-slate-200 bg-slate-50/50" value={form.metadata?.cuisine || ''} onChange={e => setMeta('cuisine', e.target.value)} /></div>
          </>)}
        </div>

        <div className="flex items-center justify-between gap-4 p-8 border-t bg-slate-50/80 sticky bottom-0 z-10">
          <Button 
            variant="destructive" 
            className="rounded-[20px] font-bold px-8 h-12 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200/50 active:scale-95 transition-all" 
            onClick={() => {
              if (confirm('Are you sure you want to delete this event?')) {
                onDelete(form.id);
              }
            }}
          >
            <Trash2 className="w-5 h-5 mr-2" /> Delete
          </Button>

          <div className="flex gap-4">
            <Button variant="ghost" className="rounded-2xl font-bold px-8 h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 active:scale-95 transition-all" onClick={onClose}>Cancel</Button>
            <Button 
              className="rounded-[20px] font-bold px-10 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 active:scale-95 transition-all" 
              onClick={() => onSave({ title: form.title, description: form.description, startTime: form.startTime, endTime: form.endTime, cost: form.cost, metadata: form.metadata, type: form.type })}
            >
              <Check className="w-5 h-5 mr-2" /> Save
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PricingTab({ itinerary, onUpdate }: { itinerary: any; onUpdate: (data: any) => void }) {
  const [adults, setAdults] = useState(itinerary.adults || 2);
  const [children, setChildren] = useState(itinerary.children || 0);
  
  // Use markupPct as the global Tax/GST field for simplicity without schema bloat for global GST
  const [globalGst, setGlobalGst] = useState(Number(itinerary.markupPct) || 0);

  const defaultRows = Array.isArray(itinerary.costingBreakdown) && itinerary.costingBreakdown.length > 0
    ? itinerary.costingBreakdown
    : [];

  const [rows, setRows] = useState<any[]>(defaultRows);

  const handleAddRow = () => {
    setRows([...rows, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'Service',
      price: 0,
      isPerPerson: false,
      markup: 0,
    }]);
  };

  const autoPopulate = () => {
    if (!confirm('This will wipe your current itemized list and rebuild it from the itinerary events. Continue?')) return;
    
    const newRows: any[] = [];
    itinerary.days?.forEach((day: any) => {
      day.events?.forEach((ev: any) => {
        if (ev.cost) {
          newRows.push({
            id: Math.random().toString(36).substr(2, 9),
            name: ev.title,
            type: ev.type,
            price: Number(ev.cost),
            isPerPerson: false,
            markup: 0,
          });
        }
      });
    });
    setRows(newRows);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Calculations
  const totalPax = Number(adults) + Number(children); // Simplified pax. Can be split if needed.
  
  let subtotal = 0;
  
  const calculatedRows = rows.map(r => {
    const basePriced = r.isPerPerson ? (Number(r.price) * totalPax) : Number(r.price);
    const markedUp = basePriced + (basePriced * (Number(r.markup) || 0) / 100);
    subtotal += markedUp;
    return { ...r, finalTotal: markedUp };
  });

  const totalTaxAmount = subtotal * (Number(globalGst) / 100);
  const totalPackagePrice = subtotal + totalTaxAmount;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adults</label><Input type="number" className="mt-1 h-10 rounded-xl bg-slate-50" value={adults} onChange={e => setAdults(Number(e.target.value))} /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Children</label><Input type="number" className="mt-1 h-10 rounded-xl bg-slate-50" value={children} onChange={e => setChildren(Number(e.target.value))} /></div>
        <div className="md:col-span-2 flex items-end justify-end">
          <Button variant="outline" className="rounded-xl font-bold border-blue-200 text-blue-600 hover:bg-blue-50" onClick={autoPopulate}>
            <RefreshCw className="w-4 h-4 mr-2" /> Auto-Fill from Events
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 font-black text-[10px] text-slate-500 uppercase tracking-widest w-1/3">Item / Service</th>
                  <th className="text-left p-4 font-black text-[10px] text-slate-500 uppercase tracking-widest w-32">Base Price (₹)</th>
                  <th className="text-center p-4 font-black text-[10px] text-slate-500 uppercase tracking-widest w-24">Per Person</th>
                  <th className="text-left p-4 font-black text-[10px] text-slate-500 uppercase tracking-widest w-24">Markup %</th>
                  <th className="text-right p-4 font-black text-[10px] text-slate-500 uppercase tracking-widest w-32">Total (₹)</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {calculatedRows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <Input className="h-9 rounded-lg border-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white bg-transparent transition-all font-medium" placeholder="e.g. Hotel Stay" value={r.name} onChange={(e) => updateRow(i, 'name', e.target.value)} />
                    </td>
                    <td className="p-3">
                      <Input type="number" className="h-9 rounded-lg border-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white bg-transparent transition-all" value={r.price} onChange={(e) => updateRow(i, 'price', e.target.value)} />
                    </td>
                    <td className="p-3 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" checked={r.isPerPerson} onChange={(e) => updateRow(i, 'isPerPerson', e.target.checked)} title="Multiply by Pax" />
                    </td>
                    <td className="p-3">
                      <Input type="number" className="h-9 rounded-lg border-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white bg-transparent transition-all" value={r.markup} onChange={(e) => updateRow(i, 'markup', e.target.value)} />
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700">
                      ₹{Math.round(r.finalTotal).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => removeRow(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No items added yet. Click &quot;Add Row&quot; or &quot;Auto-Fill&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Button variant="outline" className="rounded-xl border-dashed border-2 font-bold text-slate-600 hover:bg-white" onClick={handleAddRow}>
              <Plus className="w-4 h-4 mr-2" /> Add Row
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
              <span className="font-bold text-slate-700">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Global Taxes / GST % 
              </span>
              <Input type="number" className="w-24 h-9 rounded-lg text-right" value={globalGst} onChange={(e) => setGlobalGst(Number(e.target.value))} />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black text-slate-900">Total Selling Price</span>
              <span className="text-3xl font-black text-blue-600">₹{Math.round(totalPackagePrice).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        
        <div>
          <Button 
            className="w-full h-16 rounded-[24px] text-lg font-black bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200/50 transition-all active:scale-95" 
            onClick={() => {
              onUpdate({ 
                adults, 
                children, 
                markupPct: globalGst, 
                costingBreakdown: rows,
                sellingPrice: totalPackagePrice,
                totalCost: subtotal // Saving subtotal as base layout totalCost
              });
              toast.success('Pricing saved and synchronized with all active proposals!');
            }}
          >
            <Check className="w-6 h-6 mr-3 text-green-400" /> Save Pricing & Sync
          </Button>
          <p className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-4">
            Updates will instantly sync to the attached Query Billing
          </p>
        </div>
      </div>
    </div>
  );
}

function FinalPreviewTab({ itinerary, onShare, onExport, onDelete, isDeleting }: { 
  itinerary: any; 
  onShare: () => void; 
  onExport: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const accomEvents = (itinerary.days || []).flatMap((d: any) => (d.events || []).filter((e: any) => e.type === 'accommodation'));
  
  const sanitize = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 paper-texture p-8 md:p-12 rounded-[40px] shadow-inner border border-slate-100 relative overflow-hidden">
      {/* Decorative Doodles */}
      <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
        <Sun className="w-20 h-20 rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10 pointer-events-none">
        <Mountain className="w-32 h-32 -rotate-12" />
      </div>
      <div className="flex justify-end gap-3 print:hidden">
        <Button variant="outline" className="rounded-2xl font-bold px-6 h-11 border-slate-200 hover:bg-slate-50 transition-all active:scale-95" onClick={onShare}>
          <Share2 className="w-4 h-4 mr-2 text-slate-500" /> Share Link
        </Button>
        <Button className="rounded-2xl font-bold px-8 h-11 bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 active:scale-95 transition-all" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" /> Export Premium PDF
        </Button>
      </div>

      {/* Hotel Summary — Premium Grid */}
      {accomEvents.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="font-handwriting text-4xl text-slate-900 tracking-tight">Accommodation Overview</h3>
            <div className="h-[2px] flex-1 bg-slate-900/10 border-b border-dashed border-slate-900/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(itinerary.days || []).map((day: any) => (day.events || []).filter((e: any) => e.type === 'accommodation').map((ev: any) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card className="rounded-[32px] border-none sketchy-border overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 bg-white relative">
                  <div className="washi-tape washi-tape-top-right bg-blue-400/20" />
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Hotel className="w-10 h-10 mb-2 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-30">No Image Preview</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm border border-white">
                        Day {day.dayNumber}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-serif text-xl text-slate-900 mb-1">{ev.metadata?.hotelName || ev.title}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: parseInt(ev.metadata?.category) || 3 }).map((_, i) => (
                            <Sun key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {ev.metadata?.hotelOption || 'Standard'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room Type</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Hotel className="w-3.5 h-3.5 text-slate-400" /> {ev.metadata?.roomType || '—'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meal Plan</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Utensils className="w-3.5 h-3.5 text-slate-400" /> {ev.metadata?.mealPlan || '—'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )))}
          </div>
        </section>
      )}

      {/* Main Itinerary — High Fidelity Stories */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <h3 className="font-handwriting text-5xl text-slate-900 tracking-tight">The Journey</h3>
          <div className="h-[2px] flex-1 bg-slate-900/10 border-b border-dashed border-slate-900/20" />
        </div>
        
        <div className="space-y-16">
          {(itinerary.days || []).map((day: any, idx: number) => (
            <motion.div 
              key={day.id} 
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className={cn("space-y-6", idx % 2 === 0 ? 'lg:order-1' : 'lg:order-2')}>
                  <div className="inline-flex items-center gap-3">
                    <span className="w-12 h-12 rounded-[20px] bg-slate-900 flex items-center justify-center text-white font-serif text-xl shadow-2xl shadow-slate-200">
                      {day.dayNumber}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white shadow-sm" />
                    </span>
                    <div className="h-[2px] w-8 bg-slate-900/10 border-b border-dashed border-slate-900/20" />
                    <span className="font-handwriting text-xl text-blue-600">Day Itinerary</span>
                  </div>
                  
                  <div>
                    <h4 className="font-serif text-4xl text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors duration-500">
                      {day.title || `Exploring ${day.destination?.name || 'the Unknown'}`}
                    </h4>
                    {day.destination?.name && (
                      <div className="flex items-center gap-2 text-slate-400 mb-6">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{day.destination.name}</span>
                      </div>
                    )}
                    <p className="text-slate-500 leading-relaxed text-sm max-w-lg mb-8">
                      {day.description || "Every journey is a story waiting to be told. This day is reserved for unique experiences and breathtaking moments captured across local landscapes."}
                    </p>
                  </div>

                  {(day.events || []).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {day.events.map((ev: any) => {
                        const evType = getEventType(ev.type);
                        return (
                          <div key={ev.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 transition-all hover:bg-white hover:shadow-md group/ev">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover/ev:scale-110", evType.color)}>
                              <evType.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[11px] font-bold text-slate-800 leading-none mb-1">{ev.title}</div>
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                {ev.startTime ? (
                                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {ev.startTime}</span>
                                ) : (
                                  <span>{evType.label}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={cn("relative aspect-[4/5] rounded-[48px] overflow-hidden sketchy-border shadow-2xl group", idx % 2 === 0 ? 'lg:order-2' : 'lg:order-1')}>
                  <div className="washi-tape washi-tape-top-right bg-amber-400/30" />
                  <div className="washi-tape washi-tape-bottom-left bg-emerald-400/30" />
                  {day.imageUrl ? (
                    <img src={day.imageUrl} alt="" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-200">
                      <ImageIcon className="w-20 h-20 opacity-20 mb-4" />
                      <span className="font-black text-xs uppercase tracking-[0.3em] opacity-30">The View Awaits</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Policies — Artisanal Layout */}
      {(itinerary.inclusionsHtml || itinerary.exclusionsHtml || itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
        <section className="pt-10 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {itinerary.inclusionsHtml && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-2xl text-slate-900">Inclusions</h4>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed prose prose-slate prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.inclusionsHtml) }} />
              </div>
            )}
            {itinerary.exclusionsHtml && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm shadow-rose-100/50">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-2xl text-slate-900">Exclusions</h4>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed prose prose-slate prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.exclusionsHtml) }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 pt-16 border-t border-slate-100">
            {itinerary.paymentPolicyHtml && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.paymentPolicyHtml) }} />
              </div>
            )}
            {itinerary.cancellationPolicyHtml && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cancellation</span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.cancellationPolicyHtml) }} />
              </div>
            )}
            {itinerary.termsHtml && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security</span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.termsHtml) }} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pricing Summary — Minimalist Elegance */}
      {itinerary.perPersonCost !== null && itinerary.perPersonCost !== undefined && (
        <section className="py-20 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            className="inline-block relative"
          >
            <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 -m-10" />
            <div className="relative bg-white border border-slate-100 rounded-[48px] px-16 py-12 shadow-2xl shadow-slate-200">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 block">Final Investment</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-serif text-5xl text-slate-900 tracking-tighter">₹{Number(itinerary.perPersonCost).toLocaleString('en-IN')}</span>
                <span className="text-sm font-bold text-slate-400">/ Person</span>
              </div>
              {itinerary.totalCost && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Package: ₹{Number(itinerary.totalCost).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* Danger Zone */}
      <section className="pt-20 border-t border-slate-100">
        <div className="bg-red-50/50 border border-red-100 rounded-[32px] p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Danger Zone</h3>
              </div>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Deleting this itinerary is permanent and cannot be undone. All days, events, and gallery images associated with this itinerary will be removed.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-red-200 hover:scale-105 transition-all"
              onClick={() => {
                if (window.confirm('Are you absolutely sure you want to delete this itinerary? This action is permanent.')) {
                  onDelete();
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
              Delete Itinerary
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}



function PackageTermsEditor({ itinerary, onUpdate }: { itinerary: any; onUpdate: (data: any) => void }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Package Terms</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage inclusions, exclusions, and company policies for this itinerary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TermSection 
          title="Inclusions" 
          icon={CheckCircle} 
          value={itinerary.inclusionsHtml} 
          onSave={(val: string) => onUpdate({ inclusionsHtml: val })}
          color="emerald"
          placeholder="List what's included (e.g. Breakfast, Sightseeing, Transfers)..."
        />
        <TermSection 
          title="Exclusions" 
          icon={XCircle} 
          value={itinerary.exclusionsHtml} 
          onSave={(val: string) => onUpdate({ exclusionsHtml: val })}
          color="rose"
          placeholder="List what's NOT included (e.g. GST, Personal Expenses)..."
        />
      </div>

      <TermSection 
        title="Payment Policy" 
        icon={CreditCard} 
        value={itinerary.paymentPolicyHtml} 
        onSave={(val: string) => onUpdate({ paymentPolicyHtml: val })}
        color="blue"
        placeholder="Describe your booking and final payment terms..."
      />

      <TermSection 
        title="Cancellation Policy" 
        icon={AlertTriangle} 
        value={itinerary.cancellationPolicyHtml} 
        onSave={(val: string) => onUpdate({ cancellationPolicyHtml: val })}
        color="amber"
        placeholder="Outline your refund and cancellation slab terms..."
      />

      <TermSection 
        title="Terms & Conditions" 
        icon={Shield} 
        value={itinerary.termsHtml} 
        onSave={(val: string) => onUpdate({ termsHtml: val })}
        color="slate"
        placeholder="Add any general terms, child policies, or legal fine print..."
      />
    </div>
  );
}

function TermSection({ title, icon: Icon, value, onSave, color, placeholder }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => { setLocalValue(value || ''); }, [value]);

  const handleSave = () => {
    if (localValue.trim() !== (value || '').trim()) {
      onSave(localValue);
    }
    setIsEditing(false);
  };

  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
  };

  return (
    <Card className="rounded-[32px] border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all group/term">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", colors[color] || colors.slate)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">{title}</h3>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all shadow-sm"
          >
            {isEditing ? <Check className="w-5 h-5 text-emerald-600" /> : <Edit3 className="w-5 h-5" />}
          </button>
        </div>

        {isEditing ? (
          <textarea
            className="w-full min-h-[120px] p-4 text-sm font-medium rounded-2xl border-slate-200 focus:border-blue-400 focus:ring-0 bg-slate-50/50 resize-none transition-all"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
            placeholder={placeholder}
          />
        ) : (
          <div className="min-h-[60px] text-[13px] font-medium text-slate-500 leading-relaxed whitespace-pre-wrap">
            {value ? value : <span className="italic opacity-50">No information added. Click edit to add {title.toLowerCase()}.</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

function GalleryEditor({ itinerary, onOpenLibrary }: { itinerary: any; onOpenLibrary: (type: 'gallery') => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const removeImg = async (id: string) => {
    if (!confirm('Remove this photo?')) return;
    try {
      await api.delete(`/itineraries/gallery/${id}`);
      toast.success('Photo removed');
      queryClient.invalidateQueries({ queryKey: ['itinerary', itinerary.id] });
    } catch { toast.error('Failed to remove'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('photos', f));
    
    try {
      await api.post(`/itineraries/${itinerary.id}/gallery`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photos uploaded');
      queryClient.invalidateQueries({ queryKey: ['itinerary', itinerary.id] });
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  // Re-use Media Library logic from parent scope if needed, or pass it down.
  // For simplicity here, we assume openMediaLibrary is available in context or passed as prop.
  // Since this is a nested function, it has access to parent's openMediaLibrary.

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Itinerary Gallery</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">These photos will appear in the "Memories" section of the proposal.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-2xl font-bold h-11 px-6 border-slate-200 hover:bg-slate-50"
            onClick={() => onOpenLibrary('gallery')}
          >
            <ImageIcon className="w-4 h-4 mr-2 text-blue-500" /> From Library
          </Button>
          <Button 
            className="rounded-2xl font-bold h-11 px-8 bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Upload Fresh
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {!itinerary.gallery?.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
           <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
             <ImageIcon className="w-6 h-6 text-slate-300" />
           </div>
           <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">No Photos Added</p>
           <p className="text-[10px] text-slate-400 mt-1">Upload destination photos to win over your client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itinerary.gallery.map((img: any) => (
            <div key={img.id} className="group relative aspect-square rounded-[32px] overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl">
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => removeImg(img.id)}
                  className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-red-500 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
