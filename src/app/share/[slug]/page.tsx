'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock, Hotel, Utensils, Car, Plane, Sun, Mountain, Compass, LogIn, LogOut, CalendarRange, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

const EVENT_ICONS: Record<string, any> = {
  accommodation: Hotel, sightseeing: Mountain, activity: Compass, transport: Car,
  flight: Plane, meal: Utensils, checkin: LogIn, checkout: LogOut, freeTime: Sun,
};

export default function SharePage() {
  const { slug } = useParams();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug || Array.isArray(slug)) {
      setError('Itinerary not found');
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch(`${API_URL}/itineraries/share/${slug}`, { signal: controller.signal })
      .then(async r => {
        if (!r.ok) throw new Error('Failed to load itinerary');
        return r.json();
      })
      .then(data => { 
        if (controller.signal.aborted) return;
        if (data.success) setItinerary(data.data); else setError('Itinerary not found'); 
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError('Failed to load');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  if (error || !itinerary) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-center p-4">
      <div><CalendarRange className="w-12 h-12 mx-auto text-slate-300 mb-4" /><h1 className="text-xl font-bold text-slate-800">Itinerary Not Found</h1><p className="text-sm text-slate-500 mt-2">This link may have expired or is invalid.</p></div>
    </div>
  );

  const destinations = Array.from(new Set(itinerary.days?.map((d: any) => d.destination?.name).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-slate-50">
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); body { font-family: 'Inter', sans-serif; }`}</style>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {itinerary.coverPhotoUrl && <img src={itinerary.coverPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-3">Travel Itinerary</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{itinerary.title}</h1>
            {itinerary.description && <p className="mt-3 text-white/70 max-w-xl mx-auto">{itinerary.description}</p>}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/60 flex-wrap">
              <span className="flex items-center gap-1.5"><CalendarRange className="w-4 h-4" />{itinerary.days?.length || 0} Days</span>
              {destinations.length > 0 && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{destinations.join(', ')}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Hotel Summary */}
        {itinerary.days?.some((d: any) => d.events?.some((e: any) => e.type === 'accommodation')) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50"><h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Hotel className="w-5 h-5 text-blue-600" /> Hotel Details</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground uppercase">
                  <th className="text-left p-4 font-semibold">Day</th><th className="text-left p-4 font-semibold">Hotel</th><th className="text-left p-4 font-semibold">Room</th><th className="text-left p-4 font-semibold">Meals</th>
                </tr></thead>
                <tbody>
                  {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any, idx: number) => (
                    <tr key={ev.id ?? `day-${day.dayNumber}-accom-${idx}`} className="border-b last:border-0">
                      <td className="p-4 font-medium">Day {day.dayNumber}</td>
                      <td className="p-4 font-bold text-slate-900">{ev.metadata?.hotelName || ev.title}</td>
                      <td className="p-4 text-muted-foreground">{ev.metadata?.roomType || '—'}</td>
                      <td className="p-4 text-muted-foreground">{ev.metadata?.mealPlan || '—'}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="font-bold text-lg text-slate-900 mb-8">Tour Itinerary</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0" style={{ borderLeft: '2px dashed #93c5fd' }} />
            {itinerary.days?.map((day: any, idx: number) => {
              const hasImage = day.events?.some((e: any) => e.imageUrl);
              const firstImage = day.events?.find((e: any) => e.imageUrl)?.imageUrl;
              return (
                <div key={day.id ?? `day-${idx}`} className="relative flex gap-4 md:gap-6 mb-10 last:mb-0">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">{day.dayNumber}</div>
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-2xl border p-5 ${idx % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-base">{day.title || `Day ${day.dayNumber}`}</h3>
                          {day.destination?.name && <p className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{day.destination.name}</p>}
                          {day.events?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {day.events.map((ev: any, evIdx: number) => { const Icon = EVENT_ICONS[ev.type] || MapPin; return (
                                <div key={ev.id ?? `event-${evIdx}`} className="flex items-start gap-2">
                                  <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">{ev.title}</p>
                                    {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                                    {ev.startTime && <p className="text-[10px] text-slate-400 mt-0.5"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{ev.startTime}{ev.endTime && ` – ${ev.endTime}`}</p>}
                                  </div>
                                </div>
                              ); })}
                            </div>
                          )}
                        </div>
                        {firstImage && <img src={firstImage} alt="" className="w-28 h-20 md:w-36 md:h-24 rounded-xl object-cover flex-shrink-0 shadow-sm" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gallery */}
        {itinerary.galleryImages?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-bold text-lg text-slate-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {itinerary.galleryImages.map((img: any, idx: number) => (
                <img key={img.id ?? img.imageUrl ?? idx} src={img.imageUrl} alt={img.caption || ''} className="w-full aspect-[4/3] rounded-xl object-cover shadow-sm" />
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {itinerary.perPersonCost && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center shadow-xl shadow-blue-600/20">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-white/60">Package Price Per Person</p>
            <p className="text-4xl md:text-5xl font-black mt-2">
              {(() => {
                try {
                  return new Intl.NumberFormat(undefined, { style: 'currency', currency: itinerary.currency || 'INR' }).format(Number(itinerary.perPersonCost));
                } catch (e) {
                  return `${itinerary.currency || 'INR'} ${Number(itinerary.perPersonCost).toLocaleString('en-IN')}`;
                }
              })()}
            </p>
            {itinerary.totalCost && (
              <p className="text-sm text-white/60 mt-2">
                Total Package: {(() => {
                  try {
                    return new Intl.NumberFormat(undefined, { style: 'currency', currency: itinerary.currency || 'INR' }).format(Number(itinerary.totalCost));
                  } catch (e) {
                    return `${itinerary.currency || 'INR'} ${Number(itinerary.totalCost).toLocaleString('en-IN')}`;
                  }
                })()}
              </p>
            )}
            <p className="text-xs text-white/40 mt-3">{itinerary.adults} Adults{itinerary.children ? `, ${itinerary.children} Children` : ''} • {itinerary.currency || 'INR'}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-6 border-t">
          <p>Generated with TravelCRM • Thank you for choosing us!</p>
        </div>
      </div>
    </div>
  );
}
