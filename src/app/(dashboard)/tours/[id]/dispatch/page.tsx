'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import {
  ArrowLeft, Car, Building2, KeyRound, Copy, Check,
  ChevronDown, Loader2, UserPlus, Link2, AlertTriangle, CheckCircle2,
  MessageSquare, Mail, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────
interface Driver { id: string; name: string; vehicleName: string; vehicleNo: string; phone: string; }
interface DayPlan {
  dayNumber: number; date: string; itineraryTitle: string;
  driver: { id: string; name: string; vehicleName: string; vehicleNo: string } | null;
  hotel: { id: string; name: string } | null;
}

// ─── Hotel Assign Modal (MakeMyTrip Style Popup) ──────────────
function HotelAssignModal({
  open, onClose, dayNumber, currentHotelName, hotels, onAssign, isPending
}: {
  open: boolean; onClose: () => void; dayNumber: number; currentHotelName: string;
  hotels: any[]; onAssign: (hotelName: string) => void; isPending: boolean;
}) {
  const [hotelName, setHotelName] = useState(currentHotelName);
  const [mode, setMode] = useState<'select' | 'manual'>('select');

  // Sync state if currentHotelName changes
  useState(() => {
    setHotelName(currentHotelName);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-[28px] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-800">Assign Hotel - Day {dayNumber}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">Choose a hotel from your master inventory or enter it manually.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              type="button"
              className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-all", mode === 'select' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
              onClick={() => setMode('select')}
            >
              Master Inventory
            </button>
            <button 
              type="button"
              className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-all", mode === 'manual' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
              onClick={() => setMode('manual')}
            >
              Manual Entry
            </button>
          </div>

          {mode === 'select' ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Select Hotel</label>
              <select
                className="w-full h-11 px-4 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:border-blue-400 focus:ring-0 outline-none font-bold text-slate-700"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
              >
                <option value="">-- Select Hotel --</option>
                {hotels.map((h: any) => (
                  <option key={h.id} value={h.name}>{h.name} ({h.destination?.name || 'No Destination'})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Hotel Name</label>
              <Input
                placeholder="Enter hotel name..."
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="h-11 rounded-2xl border-slate-200"
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-2xl font-bold h-11" onClick={onClose}>Cancel</Button>
          <Button 
            className="flex-1 rounded-2xl font-bold h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" 
            disabled={isPending || !hotelName.trim()} 
            onClick={() => onAssign(hotelName.trim())}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Driver Select Dropdown ───────────────────────────────────
function DriverSelect({
  dayNumber, currentDriver, drivers, onAssign, onAddNew
}: {
  dayNumber: number; currentDriver: DayPlan['driver'];
  drivers: Driver[]; onAssign: (driverId: string, days: number[]) => void; onAddNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
          currentDriver
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
        }`}
      >
        <span className="flex items-center gap-2">
          <Car className="w-4 h-4 shrink-0" />
          {currentDriver ? `${currentDriver.name} • ${currentDriver.vehicleNo}` : 'Assign Driver'}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-1 max-h-52 overflow-y-auto">
            {drivers.map(d => (
              <button
                key={d.id}
                onClick={() => { onAssign(d.id, [dayNumber]); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-blue-50 text-sm flex justify-between items-center transition-colors"
              >
                <span className="font-semibold text-gray-900">{d.name}</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">{d.vehicleName} • {d.vehicleNo}</span>
              </button>
            ))}
          </div>
          <div className="border-t p-1 bg-slate-50">
            <button
              onClick={() => { setOpen(false); onAddNew(); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white text-sm text-blue-600 font-bold flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" /> + Add New Driver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Driver Modal ─────────────────────────────────────────
function AddDriverModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (d: Driver) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', vehicleName: '', vehicleNo: '' });
  const mut = useMutation({
    mutationFn: () => api.post('/drivers', form).then(r => r.data.data),
    onSuccess: (driver) => { toast.success('Driver added!'); onCreated(driver); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add driver'),
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>This driver will be saved to your Driver Master list.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Full Name *" value={form.name} onChange={set('name')} />
          <Input placeholder="Phone Number *" value={form.phone} onChange={set('phone')} />
          <Input placeholder="Vehicle Type (e.g. Innova Crysta) *" value={form.vehicleName} onChange={set('vehicleName')} />
          <Input placeholder="Registration Number (e.g. SK-01-D-1234) *" value={form.vehicleNo} onChange={set('vehicleNo')} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={mut.isPending || !form.name || !form.phone || !form.vehicleName || !form.vehicleNo} onClick={() => mut.mutate()}>
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Driver
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TourDispatchPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddDriver, setShowAddDriver] = useState(false);
  const [hotelEditingDay, setHotelEditingDay] = useState<{ dayNumber: number; currentHotelName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Sharing Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareType, setShareType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [waMessage, setWaMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [waRecipient, setWaRecipient] = useState('');

  // ── Fetch dispatch data ──
  const { data: dispatch, isLoading } = useQuery({
    queryKey: ['dispatch', id],
    queryFn: () => api.get(`/tours/${id}/dispatch`).then(r => r.data.data),
  });

  // ── Fetch driver master ──
  const { data: drivers = [], refetch: refetchDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: () => api.get('/drivers').then(r => r.data.data),
  });

  // ── Fetch hotels master ──
  const { data: hotels = [] } = useQuery({
    queryKey: ['dispatch-hotels-master'],
    queryFn: () => api.get('/masters/hotels').then(r => r.data.data),
  });

  // ── Mutations ──
  const assignDriverMut = useMutation({
    mutationFn: (body: { driverId: string; days?: number[]; allDays?: boolean }) =>
      api.post(`/tours/${id}/dispatch/driver`, body),
    onSuccess: () => {
      toast.success('Driver assigned!');
      queryClient.invalidateQueries({ queryKey: ['dispatch', id] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to assign driver'),
  });

  const assignHotelMut = useMutation({
    mutationFn: (body: { dayNumber: number; hotelName: string }) =>
      api.post(`/tours/${id}/dispatch/hotel`, body),
    onSuccess: () => {
      toast.success('Hotel assigned!');
      setHotelEditingDay(null);
      queryClient.invalidateQueries({ queryKey: ['dispatch', id] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to assign hotel'),
  });

  const generateCredsMut = useMutation({
    mutationFn: () => api.post(`/tours/${id}/guest-credentials`).then(r => r.data.data),
    onSuccess: (data) => {
      if (data.pin) {
        toast.success(`Credentials generated! PIN: ${data.pin}`, { duration: 10000 });
      }
      queryClient.invalidateQueries({ queryKey: ['dispatch', id] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to generate credentials'),
  });

  const resetCredsMut = useMutation({
    mutationFn: () => api.post(`/tours/${id}/guest-credentials`, { force: true }).then(r => r.data.data),
    onSuccess: (data) => {
      if (data.pin) {
        toast.success(`Credentials regenerated! New PIN: ${data.pin}`, { duration: 10000 });
      }
      queryClient.invalidateQueries({ queryKey: ['dispatch', id] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to regenerate credentials'),
  });

  const sendEmailMut = useMutation({
    mutationFn: (data: { to: string, subject: string, body: string }) => 
      api.post(`/tours/${id}/send-email`, data),
    onSuccess: () => {
      toast.success('Credentials email sent successfully!');
      setIsShareModalOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send email via backend'),
  });

  const openShareModal = (type: 'whatsapp' | 'email') => {
    setShareType(type);
    
    const plainPin = dispatch?.guestPin || '';
    const cleanPin = (plainPin.startsWith('$2a$') || plainPin.startsWith('$2b$')) ? 'Regenerate PIN first' : plainPin;
    const guestUrl = `https://guest.imagicaholidays.com/${dispatch?.tourCode}`;

    setWaRecipient(dispatch?.guestPhone || '');
    setEmailRecipient(dispatch?.guestEmail || '');
    
    setWaMessage(
      `Hello ${dispatch?.guestName || 'Guest'},\n\nHere are your access credentials for the Imagica Holidays Guest Portal:\n\n🔗 Link: ${guestUrl}\n👤 Username: ${dispatch?.guestUsername}\n🔑 Password/PIN: ${cleanPin}\n\nHave a safe and wonderful trip! ✈️`
    );
    
    setEmailSubject(`Your Imagica Holidays Guest Portal Credentials - Tour ${dispatch?.tourCode}`);
    
    setEmailBody(
      `Hello ${dispatch?.guestName || 'Guest'},\n\nHere are your access credentials for the Imagica Holidays Guest Portal:\n\nLink: ${guestUrl}\nUsername: ${dispatch?.guestUsername}\nPassword/PIN: ${cleanPin}\n\nHave a safe and wonderful trip!\n\nBest regards,\nImagica Holidays`
    );
    
    setIsShareModalOpen(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-40" /></div>;
  if (!dispatch) return <p className="text-center text-red-500 mt-20">Tour not found.</p>;

  const guestLink = `https://guest.imagicaholidays.com/${dispatch.tourCode}`;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/tours/${id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dispatch: {dispatch.tourCode}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{dispatch.guestName} • {dispatch.days?.length} Day Trip</p>
        </div>
      </div>

      {/* ── Guest Credentials Panel ── */}
      <div className={`rounded-2xl border-2 p-6 ${dispatch.guestCredentialsGenerated ? 'border-emerald-200 bg-emerald-50/40' : 'border-dashed border-amber-300 bg-amber-50/40'}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dispatch.guestCredentialsGenerated ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Guest Portal Access</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dispatch.guestCredentialsGenerated
                  ? 'Credentials generated. Share the link and PIN with the guest.'
                  : 'Generate login credentials for the Guest Portal.'}
              </p>
            </div>
          </div>
          {!dispatch.guestCredentialsGenerated && (
            <Button onClick={() => generateCredsMut.mutate()} disabled={generateCredsMut.isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
              {generateCredsMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Generate Credentials
            </Button>
          )}
        </div>

        {dispatch.guestCredentialsGenerated && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Username / Login ID</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-gray-900">{dispatch.guestUsername}</code>
                <button onClick={() => handleCopy(dispatch.guestUsername)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password / PIN</p>
              <div className="flex items-center justify-between">
                <code className={cn(
                  "text-sm font-bold truncate max-w-[170px]", 
                  (dispatch.guestPin?.startsWith('$2a$') || dispatch.guestPin?.startsWith('$2b$')) ? "text-red-500 text-xs font-mono" : "text-gray-900"
                )}>
                  {(dispatch.guestPin?.startsWith('$2a$') || dispatch.guestPin?.startsWith('$2b$')) ? 'Hashed PIN (Regenerate)' : (dispatch.guestPin || '—')}
                </code>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleCopy(dispatch.guestPin || '')} className="text-gray-400 hover:text-gray-700 transition-colors" disabled={!dispatch.guestPin || dispatch.guestPin.startsWith('$2a$') || dispatch.guestPin.startsWith('$2b$')}>
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => resetCredsMut.mutate()} 
                    disabled={resetCredsMut.isPending}
                    title="Regenerate/Reset PIN"
                    className="text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    {resetCredsMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Guest Portal Link</p>
              <div className="flex items-center justify-between">
                <a href={guestLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 underline underline-offset-2 truncate">{guestLink}</a>
                <button onClick={() => handleCopy(guestLink)} className="text-gray-400 hover:text-gray-700 transition-colors ml-2 shrink-0">
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {dispatch.guestCredentialsGenerated && (
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => openShareModal('whatsapp')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Send to WhatsApp
            </button>
            <button
              onClick={() => openShareModal('email')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" /> Send to Email
            </button>
          </div>
        )}
      </div>

      {/* ── Day-by-Day Dispatch Grid ── */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Day-by-Day Operations</h2>
          {dispatch.days?.length > 0 && drivers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Same driver for all days:</span>
              <select
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium bg-white shadow-sm"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    assignDriverMut.mutate({ driverId: e.target.value, allDays: true });
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Select & Apply All</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} • {d.vehicleNo}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {dispatch.days?.map((day: DayPlan) => (
            <div key={day.dayNumber} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  D{day.dayNumber}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{day.itineraryTitle}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(day.date), 'EEEE, MMM d, yyyy')}</p>
                </div>
                {day.driver && day.hotel && (
                  <div className="ml-auto">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Fully Dispatched
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Driver Assignment */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Driver</p>
                  <DriverSelect
                    dayNumber={day.dayNumber}
                    currentDriver={day.driver}
                    drivers={drivers}
                    onAssign={(driverId, days) => assignDriverMut.mutate({ driverId, days })}
                    onAddNew={() => setShowAddDriver(true)}
                  />
                </div>

                {/* Hotel Assignment */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Hotel</p>
                  <button
                    onClick={() => setHotelEditingDay({ dayNumber: day.dayNumber, currentHotelName: day.hotel?.name || '' })}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left ${
                      day.hotel
                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    {day.hotel?.name || 'Assign Hotel'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add New Driver Modal ── */}
      <AddDriverModal
        open={showAddDriver}
        onClose={() => setShowAddDriver(false)}
        onCreated={() => refetchDrivers()}
      />

      {/* ── Hotel Assign Modal (MMT Style Popup) ── */}
      {hotelEditingDay && (
        <HotelAssignModal
          open={!!hotelEditingDay}
          onClose={() => setHotelEditingDay(null)}
          dayNumber={hotelEditingDay.dayNumber}
          currentHotelName={hotelEditingDay.currentHotelName}
          hotels={hotels}
          onAssign={(hotelName) => assignHotelMut.mutate({ dayNumber: hotelEditingDay.dayNumber, hotelName })}
          isPending={assignHotelMut.isPending}
        />
      )}

      {/* ── Share Credentials Modal ── */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {shareType === 'whatsapp' ? <MessageSquare className="text-emerald-500 w-5 h-5" /> : <Mail className="text-blue-500 w-5 h-5" />}
              {shareType === 'whatsapp' ? 'Share via WhatsApp' : 'Share via Email'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Review and edit the template message before sending it to the client.
            </DialogDescription>
          </DialogHeader>

          {shareType === 'whatsapp' && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient Phone Number</label>
                <Input 
                  value={waRecipient} 
                  onChange={(e) => setWaRecipient(e.target.value)} 
                  placeholder="Enter phone with country code (e.g. 919876543210)"
                  className="font-medium text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Body</label>
                <textarea 
                  value={waMessage} 
                  onChange={(e) => setWaMessage(e.target.value)} 
                  className="w-full text-xs font-sans p-3 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <Button 
                onClick={() => {
                  const phone = waRecipient.replace(/\D/g, '');
                  window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(waMessage)}`, '_blank');
                  setIsShareModalOpen(false);
                }} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
              >
                Open in WhatsApp
              </Button>
            </div>
          )}

          {shareType === 'email' && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient Email</label>
                <Input 
                  value={emailRecipient} 
                  onChange={(e) => setEmailRecipient(e.target.value)} 
                  placeholder="enter.email@domain.com"
                  type="email"
                  className="font-medium text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                <Input 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  placeholder="Email Subject"
                  className="font-medium text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Body</label>
                <textarea 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  className="w-full text-xs font-sans p-3 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button 
                onClick={() => sendEmailMut.mutate({ to: emailRecipient, subject: emailSubject, body: emailBody })} 
                disabled={sendEmailMut.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs"
              >
                {sendEmailMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send via System Emailer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
