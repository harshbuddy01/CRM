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
  FileText, BookOpen, Pencil, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  const [eventImgTarget, setEventImgTarget] = useState<string | null>(null);

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

  const handleShare = async () => {
    try {
      const res = await api.post(`/itineraries/${id}/generate-share-link`);
      const slug = res.data.data.shareSlug;
      const url = `${window.location.origin}/share/${slug}`;
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

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" /></div>;
  if (!itinerary) return <div className="text-center py-20 text-muted-foreground">Itinerary not found</div>;

  const selectedDay = itinerary.days?.find((d: any) => d.id === selectedDayId);
  const allDestinations = Array.from(new Set(itinerary.days?.map((d: any) => d.destination?.name).filter(Boolean))) as string[];

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Hidden file inputs */}
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
      <input ref={eventImgRef} type="file" accept="image/*" className="hidden" onChange={handleEventImageUpload} />

      {/* Header with cover photo */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        {itinerary.coverPhotoUrl && <img src={itinerary.coverPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <Link href="/itineraries" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-xs font-medium mb-3 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Itineraries
              </Link>
              {editingTitle ? (
                <div className="flex items-center gap-2 max-w-xl">
                  <Input 
                    value={titleInput} 
                    onChange={e => setTitleInput(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 font-black text-2xl h-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateMut.mutate({ title: titleInput });
                        setEditingTitle(false);
                      } else if (e.key === 'Escape') setEditingTitle(false);
                    }}
                    autoFocus
                  />
                  <Button size="sm" variant="secondary" onClick={() => {
                    updateMut.mutate({ title: titleInput });
                    setEditingTitle(false);
                  }}><Check className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setEditingTitle(false)}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 group cursor-pointer" onClick={() => { setTitleInput(itinerary.title); setEditingTitle(true); }}>
                  {itinerary.title}
                  <Pencil className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              )}
              {allDestinations.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <MapPin className="w-3.5 h-3.5 text-white/60" />
                  {allDestinations.map((d: string) => <span key={d} className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-medium">{d}</span>)}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white/20 px-2 py-1 flex items-center rounded-md font-bold text-xs capitalize">
                  {itinerary.status}
                </span>
                <span className="text-white/60 text-sm">{itinerary.days?.length || 0} Days</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
              <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs" onClick={() => coverRef.current?.click()}>
                <Camera className="w-3.5 h-3.5 mr-1" /> Cover Photo
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Share
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs" onClick={handleExportPdf}>
                <Download className="w-3.5 h-3.5 mr-1" /> PDF
              </Button>
              
              {itinerary.status !== 'finalized' && (
                <Button size="sm" className="rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 border-none text-white ml-2 shadow-lg shadow-emerald-500/20" onClick={handleFinalize}>
                  <Check className="w-3.5 h-3.5 mr-1 text-white" /> Finalize & Create Proposal
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="build" className="rounded-lg font-bold text-xs">Build</TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg font-bold text-xs">Pricing</TabsTrigger>
          <TabsTrigger value="final" className="rounded-lg font-bold text-xs">Final Preview</TabsTrigger>
        </TabsList>

        {/* ═══ BUILD TAB ═══ */}
        <TabsContent value="build" className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Day List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-700">Days</h3>
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => addDayMut.mutate({})}>
                  <Plus className="w-3 h-3 mr-1" /> Add Day
                </Button>
              </div>
              <div className="space-y-3">
                {itinerary.days?.map((day: any) => (
                  <div
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer group',
                      selectedDayId === day.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 hover:border-blue-300 bg-white'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-colors',
                          selectedDayId === day.id ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                        )}>
                          {day.dayNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-800">Day {day.dayNumber}</span>
                            <div className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-slate-200 text-slate-500">
                              <Edit3 className="w-3 h-3" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px] truncate">{day.destination?.name || 'No Destination'}</p>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); if (confirm('Remove this day?')) removeDayMut.mutate(day.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {selectedDayId === day.id && (
                      <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <select
                          className="w-full text-xs h-8 px-2 border rounded-lg bg-white shadow-sm"
                          value={day.destinationId || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateDayMut.mutate({ dayId: day.id, data: { destinationId: e.target.value || null } })}
                        >
                          <option value="">— Destination —</option>
                          {destinations.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <Input
                          placeholder="Day title..."
                          className="h-8 text-xs rounded-lg shadow-sm"
                          defaultValue={day.title || ''}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => { if (e.target.value !== (day.title || '')) updateDayMut.mutate({ dayId: day.id, data: { title: e.target.value } }); }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Events & Day Description */}
            <div className="lg:col-span-6 space-y-4">
              {selectedDay ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-700">
                      Day {selectedDay.dayNumber} Events
                      {selectedDay.destination?.name && <span className="font-normal text-muted-foreground ml-1">— {selectedDay.destination.name}</span>}
                    </h3>
                    <div className="relative">
                      <Button size="sm" className="h-7 text-xs rounded-lg" onClick={() => setShowEventDropdown(!showEventDropdown)}>
                        <Plus className="w-3 h-3 mr-1" /> New Event
                      </Button>
                      {showEventDropdown && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border shadow-xl p-2 w-52">
                          {EVENT_TYPES.map(type => (
                            <button
                              key={type.value}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm transition-colors"
                              onClick={() => {
                                addEventMut.mutate({ dayId: selectedDayId, data: { type: type.value, title: type.label } });
                                setShowEventDropdown(false);
                              }}
                            >
                              <div className={cn('p-1 rounded-md', type.color)}><type.icon className="w-3.5 h-3.5" /></div>
                              <span className="font-medium text-xs">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day Description Editor */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <label className="text-xs font-bold text-blue-800 uppercase tracking-wider">Day Description</label>
                    </div>
                    <textarea 
                      key={`desc-${selectedDay.id}`}
                      className="w-full min-h-[80px] p-3 text-sm rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white shadow-sm resize-y"
                      placeholder="Write a descriptive narrative about what happens on this day..."
                      defaultValue={selectedDay.description || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (selectedDay.description || '')) {
                          updateDayMut.mutate({ dayId: selectedDay.id, data: { description: e.target.value } });
                        }
                      }}
                    />
                  </div>

                  {selectedDay.events?.length === 0 ? (
                    <div className="border-2 border-dashed rounded-xl py-12 text-center text-muted-foreground">
                      <CalendarRange className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">No events yet</p>
                      <p className="text-xs mt-1">Click "+ New Event" to add activities</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDay.events.map((ev: any) => {
                        const evType = getEventType(ev.type);
                        return (
                          <Card key={ev.id} className="bg-white border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                            <div className="flex items-start gap-3 p-3">
                              <div className={cn('p-2 rounded-lg flex-shrink-0 mt-0.5', evType.color)}>
                                <evType.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-sm text-slate-800">{ev.title}</h4>
                                    {ev.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{ev.description}</p>}
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                      {ev.startTime && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{ev.startTime}{ev.endTime && ` – ${ev.endTime}`}</span>}
                                      {ev.cost && <span className="font-bold text-slate-700">₹{Number(ev.cost).toLocaleString('en-IN')}</span>}
                                      <span className="capitalize text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-medium">{ev.type}</span>
                                    </div>
                                  </div>
                                  {ev.imageUrl && (
                                    <img src={ev.imageUrl} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-0.5 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-primary" onClick={() => setEditingEvent(ev)}>
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-500" onClick={() => { setEventImgTarget(ev.id); eventImgRef.current?.click(); }}>
                                  <Camera className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => removeEventMut.mutate(ev.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ChevronRight className="w-8 h-8 mb-2 opacity-30" />
                  <p className="font-medium text-sm">Select a day to manage events</p>
                </div>
              )}
            </div>

            {/* Right: Suggestions */}
            <div className="lg:col-span-3 space-y-3">
              <SuggestionsPanel 
                selectedDay={selectedDay} 
                onAddEvent={(data: any) => { if (selectedDayId) addEventMut.mutate({ dayId: selectedDayId, data }); }} 
                onApplyDayTemplate={async ({ title, description, event }) => {
                  if (selectedDayId) {
                    await updateDayMut.mutateAsync({ dayId: selectedDayId, data: { title, description } });
                    await addEventMut.mutateAsync({ dayId: selectedDayId, data: event });
                    toast.success('Applied Day Itinerary Template');
                  }
                }}
              />
            </div>
          </div>
          
          {/* Bottom: Terms & Conditions Wrapper */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Terms & Conditions</h3>
            </div>
            <textarea
              className="w-full min-h-[200px] p-4 text-sm rounded-xl border-slate-200 focus:border-slate-300 focus:ring-0 bg-white shadow-sm resize-y"
              placeholder="Enter pricing terms, inclusions, exclusions, and general policies here..."
              defaultValue={itinerary.termsHtml || ''}
              onBlur={(e) => {
                if (e.target.value !== (itinerary.termsHtml || '')) {
                  updateMut.mutate({ termsHtml: e.target.value });
                }
              }}
            />
          </div>
        </TabsContent>

        {/* ═══ PRICING TAB ═══ */}
        <TabsContent value="pricing">
          <PricingTab itinerary={itinerary} onUpdate={(data: any) => updateMut.mutate(data)} />
        </TabsContent>

        {/* ═══ FINAL TAB ═══ */}
        <TabsContent value="final">
          <FinalPreviewTab itinerary={itinerary} onShare={handleShare} onExport={handleExportPdf} />
        </TabsContent>
      </Tabs>

      {/* Event Edit Modal */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={(data: any) => updateEventMut.mutate({ eventId: editingEvent.id, data })}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function SuggestionsPanel({ selectedDay, onAddEvent, onApplyDayTemplate }: { selectedDay: any; onAddEvent: (data: any) => void; onApplyDayTemplate: (data: any) => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'hotels' | 'activities' | 'transfers' | 'dayItinerary'>('hotels');
  const destId = selectedDay?.destinationId;

  const { data } = useQuery({
    queryKey: ['suggestions', category, destId, search],
    queryFn: async () => {
      if (!destId) return [];
      let path = '';
      if (category === 'hotels') path = '/masters/hotels';
      else if (category === 'dayItinerary') path = '/masters-v2/day-itinerary-templates';
      else path = `/masters-v2/${category}`;
      
      const res = await api.get(path, { params: search ? { search } : {} });
      const items = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.items || res.data || []);
      return items.filter((i: any) => i.destinationId === destId);
    },
    enabled: !!destId,
  });

  const typeMap: Record<string, string> = { hotels: 'accommodation', activities: 'activity', transfers: 'transport', dayItinerary: 'sightseeing' };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-slate-700">Suggestions</h3>
      {!destId ? (
        <div className="border-2 border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground">
          <MapPin className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
          Select a destination for the active day to see suggestions
        </div>
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {(['hotels', 'activities', 'transfers', 'dayItinerary'] as const).map(c => (
              <button key={c} onClick={() => setCategory(c)} className={cn('px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap font-bold capitalize transition-colors', category === c ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                {c === 'dayItinerary' ? 'Day Itineraries' : c}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 h-8 text-xs rounded-lg bg-slate-50 border-slate-200" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {(data || []).map((item: any) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow group">
                {item.photoUrl && <img src={item.photoUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-slate-100" alt="" />}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-bold text-xs text-slate-800 truncate">{item.title || item.name || item.vehicleType}</p>
                  {item.category && <p className="text-[10px] text-muted-foreground mt-0.5">{item.category}</p>}
                  {item.description && <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">{item.description}</p>}
                  {(item.basePrice || item.pricePerPerson || item.price) && (
                    <p className="text-[10px] font-bold text-slate-700 mt-1">₹{Number(item.basePrice || item.pricePerPerson || item.price).toLocaleString('en-IN')}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary bg-primary/5 hover:bg-primary/20 rounded-xl flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                    const eventData = {
                      type: typeMap[category],
                      title: item.title || item.name || item.vehicleType || 'Event',
                      description: category === 'dayItinerary' ? null : (item.description || ''),
                      cost: item.basePrice || item.pricePerPerson || item.price || 0,
                      metadata: { masterType: category, masterId: item.id, ...item },
                      sortOrder: category === 'dayItinerary' ? 0 : undefined,
                    };
                    if (category === 'dayItinerary') {
                      onApplyDayTemplate({ title: item.title, description: item.description, event: eventData });
                    } else {
                      onAddEvent(eventData);
                      toast.success(`Added ${item.title || item.name || item.vehicleType}`);
                    }
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {data?.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No {category} found for this destination</p>}
          </div>
        </>
      )}
    </div>
  );
}

function EventEditModal({ event, onClose, onSave, destId }: { event: any; onClose: () => void; onSave: (data: any) => void; destId?: string }) {
  const [form, setForm] = useState({ ...event, metadata: event.metadata || {} });
  const [accomMode, setAccomMode] = useState<'manual' | 'master'>(event.metadata?.masterId ? 'master' : 'manual');
  
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', evType.color)}><evType.icon className="w-4 h-4" /></div>
            <h2 className="font-bold text-sm">Edit {evType.label}</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div><label className="text-xs font-medium text-muted-foreground uppercase">Title</label><Input className="mt-1 h-9 rounded-lg" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase">Description</label><textarea className="mt-1 w-full min-h-[60px] px-3 py-2 border rounded-lg bg-background text-sm resize-none" value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Start Time</label><Input type="time" className="mt-1 h-9 rounded-lg" value={form.startTime || ''} onChange={e => set('startTime', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">End Time</label><Input type="time" className="mt-1 h-9 rounded-lg" value={form.endTime || ''} onChange={e => set('endTime', e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase">Cost (₹)</label><Input type="number" className="mt-1 h-9 rounded-lg" value={form.cost || ''} onChange={e => set('cost', e.target.value)} /></div>

          {/* Type-specific fields */}
          {form.type === 'accommodation' && (
            <div className="space-y-3 pt-2 border-t mt-4">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button 
                  className={cn('flex-1 text-xs py-1.5 rounded-md font-bold transition-all', accomMode === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700')}
                  onClick={() => setAccomMode('manual')}
                >
                  Manual Entry
                </button>
                <button 
                  className={cn('flex-1 text-xs py-1.5 rounded-md font-bold transition-all', accomMode === 'master' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700')}
                  onClick={() => setAccomMode('master')}
                >
                  From Master
                </button>
              </div>

              {accomMode === 'master' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Select Hotel</label>
                  {!destId ? (
                    <div className="text-xs text-red-500 mt-1">Please select a destination for this day first.</div>
                  ) : (
                    <select 
                      className="mt-1 w-full h-9 px-3 border rounded-lg text-sm bg-background"
                      value={form.metadata?.masterId || ''}
                      onChange={e => {
                        const h = hotels?.find((ht: any) => ht.id === e.target.value);
                        if (h) {
                          set('title', h.name);
                          set('cost', h.basePrice || 0);
                          setMeta('masterId', h.id);
                          setMeta('hotelName', h.name);
                          setMeta('category', h.category);
                        } else {
                          setMeta('masterId', '');
                        }
                      }}
                    >
                      <option value="">-- Choose Hotel --</option>
                      {(hotels || []).map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name} - ₹{h.basePrice}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {accomMode === 'manual' && (
                <div><label className="text-xs font-medium text-muted-foreground uppercase">Hotel Name</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.hotelName || ''} onChange={e => setMeta('hotelName', e.target.value)} /></div>
              )}
              
              <div><label className="text-xs font-medium text-muted-foreground uppercase">Room Type</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.roomType || ''} onChange={e => setMeta('roomType', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground uppercase">Meal Plan</label><Input className="mt-1 h-9 rounded-lg" placeholder="BB, HB, FB" value={form.metadata?.mealPlan || ''} onChange={e => setMeta('mealPlan', e.target.value)} /></div>
            </div>
          )}
          {form.type === 'flight' && (<>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground uppercase">Airline</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.airline || ''} onChange={e => setMeta('airline', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground uppercase">Flight No.</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.flightNumber || ''} onChange={e => setMeta('flightNumber', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground uppercase">From</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.from || ''} onChange={e => setMeta('from', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground uppercase">To</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.to || ''} onChange={e => setMeta('to', e.target.value)} /></div>
            </div>
          </>)}
          {form.type === 'transport' && (<>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Vehicle / Mode</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.vehicle || ''} onChange={e => setMeta('vehicle', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground uppercase">From</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.from || ''} onChange={e => setMeta('from', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground uppercase">To</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.to || ''} onChange={e => setMeta('to', e.target.value)} /></div>
            </div>
          </>)}
          {form.type === 'meal' && (<>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Restaurant</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.restaurant || ''} onChange={e => setMeta('restaurant', e.target.value)} /></div>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Cuisine / Type</label><Input className="mt-1 h-9 rounded-lg" value={form.metadata?.cuisine || ''} onChange={e => setMeta('cuisine', e.target.value)} /></div>
          </>)}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white rounded-b-2xl">
          <Button variant="ghost" size="sm" className="rounded-lg" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="rounded-lg font-bold" onClick={() => onSave({ title: form.title, description: form.description, startTime: form.startTime, endTime: form.endTime, cost: form.cost, metadata: form.metadata, type: form.type })}>
            <Check className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function PricingTab({ itinerary, onUpdate }: { itinerary: any; onUpdate: (data: any) => void }) {
  const allEvents = itinerary.days?.flatMap((d: any) => d.events || []) || [];
  const totalEventCost = allEvents.reduce((sum: number, ev: any) => sum + (Number(ev.cost) || 0), 0);
  const [adults, setAdults] = useState(itinerary.adults || 2);
  const [children, setChildren] = useState(itinerary.children || 0);
  const [markup, setMarkup] = useState(itinerary.markupPct || 0);
  const [perPerson, setPerPerson] = useState(itinerary.perPersonCost || 0);

  const totalWithMarkup = totalEventCost + (totalEventCost * Number(markup) / 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="rounded-2xl border-slate-200">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Cost Breakdown</h3>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>
                <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Day</th>
                <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Event</th>
                <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Type</th>
                <th className="text-right p-3 font-semibold text-xs text-muted-foreground uppercase">Cost</th>
              </tr></thead>
              <tbody>
                {itinerary.days?.map((day: any) => day.events?.filter((ev: any) => ev.cost).map((ev: any, i: number) => (
                  <tr key={ev.id} className="border-t">
                    <td className="p-3 text-xs text-muted-foreground">{i === 0 ? `Day ${day.dayNumber}` : ''}</td>
                    <td className="p-3 font-medium text-xs">{ev.title}</td>
                    <td className="p-3"><span className="text-[10px] capitalize bg-slate-100 px-2 py-0.5 rounded-full">{ev.type}</span></td>
                    <td className="p-3 text-right font-bold text-xs">₹{Number(ev.cost).toLocaleString('en-IN')}</td>
                  </tr>
                )))}
                <tr className="border-t-2 bg-slate-50"><td colSpan={3} className="p-3 font-bold text-sm">Subtotal</td><td className="p-3 text-right font-black text-sm">₹{totalEventCost.toLocaleString('en-IN')}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Adults</label><Input type="number" className="mt-1 h-10 rounded-xl" value={adults} onChange={e => setAdults(Number(e.target.value))} /></div>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Children</label><Input type="number" className="mt-1 h-10 rounded-xl" value={children} onChange={e => setChildren(Number(e.target.value))} /></div>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Markup %</label><Input type="number" className="mt-1 h-10 rounded-xl" value={markup} onChange={e => setMarkup(Number(e.target.value))} /></div>
            <div><label className="text-xs font-medium text-muted-foreground uppercase">Per Person ₹</label><Input type="number" className="mt-1 h-10 rounded-xl" value={perPerson} onChange={e => setPerPerson(Number(e.target.value))} /></div>
          </div>

          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div><p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Package</p><p className="text-2xl font-black text-blue-800">₹{totalWithMarkup.toLocaleString('en-IN')}</p></div>
            <Button className="rounded-xl font-bold" onClick={() => onUpdate({ adults, children, markupPct: markup, perPersonCost: perPerson, totalCost: totalWithMarkup })}>
              <Check className="w-4 h-4 mr-1" /> Save Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinalPreviewTab({ itinerary, onShare, onExport }: { itinerary: any; onShare: () => void; onExport: () => void }) {
  const accomEvents = itinerary.days?.flatMap((d: any) => (d.events || []).filter((e: any) => e.type === 'accommodation')) || [];
  const allDestinations = Array.from(new Set(itinerary.days?.map((d: any) => d.destination?.name).filter(Boolean))) as string[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="rounded-xl font-bold text-xs" onClick={onShare}><Share2 className="w-3.5 h-3.5 mr-1" /> Share</Button>
        <Button className="rounded-xl font-bold text-xs" onClick={onExport}><Download className="w-3.5 h-3.5 mr-1" /> Export PDF</Button>
      </div>

      {/* Hotel Summary */}
      {accomEvents.length > 0 && (
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Hotel Summary</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50"><tr>
                  <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Day</th>
                  <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Hotel</th>
                  <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Room</th>
                  <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase">Meals</th>
                  <th className="text-right p-3 font-semibold text-xs text-muted-foreground uppercase">Cost</th>
                </tr></thead>
                <tbody>
                  {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any) => (
                    <tr key={ev.id} className="border-t">
                      <td className="p-3 text-xs font-medium">Day {day.dayNumber}</td>
                      <td className="p-3 text-xs font-bold">{ev.metadata?.hotelName || ev.title}</td>
                      <td className="p-3 text-xs text-muted-foreground">{ev.metadata?.roomType || '—'}</td>
                      <td className="p-3 text-xs text-muted-foreground">{ev.metadata?.mealPlan || '—'}</td>
                      <td className="p-3 text-right font-bold text-xs">{ev.cost ? `₹${Number(ev.cost).toLocaleString('en-IN')}` : '—'}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card className="rounded-2xl border-slate-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Tour Itinerary</h3>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400" style={{ borderLeft: '2px dashed #93c5fd' }} />
            {itinerary.days?.map((day: any, idx: number) => (
              <div key={day.id} className="relative flex gap-6 mb-8 last:mb-0">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/30">
                    {day.dayNumber}
                  </div>
                </div>
                <div className={cn('flex-1 bg-white rounded-2xl border p-4', idx % 2 === 0 ? 'border-slate-200' : 'border-indigo-100 bg-indigo-50/30')}>
                  <h4 className="font-bold text-slate-900">{day.title || `Day ${day.dayNumber}`}</h4>
                  {day.destination?.name && <p className="text-xs text-blue-600 font-medium mt-0.5"><MapPin className="w-3 h-3 inline mr-0.5" />{day.destination.name}</p>}
                  {day.events?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {day.events.map((ev: any) => {
                        const evType = getEventType(ev.type);
                        return (
                          <div key={ev.id} className="flex items-center gap-2 text-xs">
                            <evType.icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium">{ev.title}</span>
                            {ev.startTime && <span className="text-muted-foreground">({ev.startTime})</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {itinerary.perPersonCost !== null && itinerary.perPersonCost !== undefined && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-white/70">Package Price Per Person</p>
          <p className="text-4xl font-black mt-1">₹{Number(itinerary.perPersonCost).toLocaleString('en-IN')}</p>
          {itinerary.totalCost && <p className="text-sm text-white/70 mt-1">Total: ₹{Number(itinerary.totalCost).toLocaleString('en-IN')}</p>}
        </div>
      )}
    </div>
  );
}
