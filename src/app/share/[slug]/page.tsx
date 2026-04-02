'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock, Hotel, Utensils, Car, Plane, Sun, Mountain, Compass, LogIn, LogOut, CalendarRange, Loader2, Shield, CheckCircle, XCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import DOMPurify from 'dompurify';

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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const carY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

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

  const sanitize = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); body { font-family: 'Inter', sans-serif; }`}</style>

      {/* Hero */}
      <div className="relative bg-slate-900 text-white overflow-hidden min-h-[60vh] flex items-center">
        {itinerary.coverPhotoUrl && <img src={itinerary.coverPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 w-full z-10 pt-20 pb-12">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300 mb-3">Travel Proposal</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black tracking-tight leading-tight">{itinerary.title}</motion.h1>
            {itinerary.description && <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-white/80 max-w-xl text-lg leading-relaxed">{itinerary.description}</motion.p>}
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-6 mt-8 p-4 bg-black/20 rounded-2xl w-fit flex-wrap">
              <span className="flex items-center gap-2 font-medium"><CalendarRange className="w-5 h-5 text-blue-400" />{itinerary.days?.length || 0} Days</span>
              {destinations.length > 0 && <span className="flex items-center gap-2 font-medium"><MapPin className="w-5 h-5 text-blue-400" />{destinations.join(', ')}</span>}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
        {/* Hotel Summary */}
        {itinerary.days?.some((d: any) => d.events?.some((e: any) => e.type === 'accommodation')) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b bg-slate-50/50"><h2 className="font-black text-xl text-slate-900 flex items-center gap-2"><Hotel className="w-6 h-6 text-blue-600" /> Accommodation Overview</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground uppercase tracking-widest bg-slate-50">
                  <th className="text-left p-4 font-bold">Day</th><th className="text-left p-4 font-bold">Hotel</th><th className="text-left p-4 font-bold">Room</th><th className="text-left p-4 font-bold">Meals</th>
                </tr></thead>
                <tbody>
                  {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any, idx: number) => (
                    <tr key={ev.id ?? `day-${day.dayNumber}-accom-${idx}`} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-500">Day {day.dayNumber}</td>
                      <td className="p-4 font-black text-slate-900">{ev.metadata?.hotelName || ev.title}</td>
                      <td className="p-4 text-slate-600 font-medium">{ev.metadata?.roomType || '—'}</td>
                      <td className="p-4 text-slate-600 font-medium">{ev.metadata?.mealPlan || '—'}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="relative">
          <h2 className="font-black text-3xl text-slate-900 mb-12 text-center">Your Journey</h2>
          
          <div ref={containerRef} className="relative max-w-3xl mx-auto">
            {/* Scroll Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 rounded-full shrink-0 -translate-x-1/2 hidden md:block" />
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200 rounded-full shrink-0 -translate-x-1/2 md:hidden" />
            
            {/* Moving Car */}
            <motion.div 
              className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"
              style={{ top: carY }}
            >
              <Car className="w-4 h-4 text-blue-600" />
            </motion.div>

            {itinerary.days?.map((day: any, idx: number) => {
              const hasImage = day.events?.some((e: any) => e.imageUrl);
              const eventImages = day.events?.filter((e: any) => e.imageUrl).map((e:any) => e.imageUrl) || [];
              const isEven = idx % 2 === 0;

              return (
                <motion.div 
                  key={day.id ?? `day-${idx}`} 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex md:w-1/2 mb-16 clear-both ${isEven ? 'md:float-left md:pr-12 md:text-right' : 'md:float-right md:pl-12 md:text-left'} pl-16 md:pl-0`}
                >
                  {/* Mobile Day Number dot */}
                  <div className="absolute left-6 top-6 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-md z-10 md:hidden" />
                  
                  {/* Desktop Day Number dot */}
                  <div className={`absolute top-6 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-md z-10 hidden md:block ${isEven ? 'right-[2px]' : 'left-0'}`} />

                  <div className="bg-white hover:bg-blue-50/30 transition-colors rounded-3xl shadow-sm border border-slate-200 overflow-hidden w-full group">
                    {/* Day Cards Header Image */}
                    {eventImages.length > 0 && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img src={eventImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className={`absolute bottom-4 ${isEven ? 'md:right-4 left-4' : 'left-4'}`}>
                          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold text-xs">
                            Day {day.dayNumber}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {!eventImages.length && (
                        <div className={`mb-4 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs`}>
                          Day {day.dayNumber}
                        </div>
                      )}
                      
                      <h3 className="font-black text-slate-900 text-xl">{day.title || `Day ${day.dayNumber}`}</h3>
                      {day.destination?.name && <p className={`text-sm text-blue-600 font-bold mt-1 max-w-fit ${isEven ? 'md:ml-auto' : ''}`}>{day.destination.name}</p>}
                      
                      {day.description && (
                        <div className={`mt-4 text-slate-600 text-sm leading-relaxed ${isEven ? 'md:text-right' : 'text-left'}`}>
                          <p>{day.description}</p>
                        </div>
                      )}

                      {day.events?.length > 0 && (
                        <div className={`mt-6 space-y-3 border-t pt-4 border-slate-100`}>
                          {day.events.map((ev: any, evIdx: number) => { 
                            const Icon = EVENT_ICONS[ev.type] || MapPin; 
                            return (
                              <div key={ev.id ?? `event-${evIdx}`} className={`flex items-start gap-3 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                <div className="p-2 bg-slate-50 rounded-xl flex-shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className={`flex-1 ${isEven ? 'md:text-right' : ''}`}>
                                  <p className="text-sm font-bold text-slate-800">{ev.title}</p>
                                  {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                                  {ev.startTime && <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{ev.startTime}{ev.endTime && ` – ${ev.endTime}`}</p>}
                                </div>
                              </div>
                            ); 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div className="clear-both" />
          </div>
        </div>

        {/* Gallery */}
        {itinerary.galleryImages?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="font-black text-2xl text-slate-900 mb-6 text-center">Visual Storyboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {itinerary.galleryImages.map((img: any, idx: number) => (
                <div key={img.id ?? img.imageUrl ?? idx} className="relative group overflow-hidden rounded-2xl aspect-square">
                   <img src={img.imageUrl} alt={img.caption || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pricing */}
        {itinerary.perPersonCost && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Package Proposal</p>
              <p className="text-5xl md:text-7xl font-black mt-4 tracking-tighter">
                {(() => {
                  try {
                    return new Intl.NumberFormat(undefined, { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.perPersonCost));
                  } catch (e) {
                    return `${itinerary.currency || 'INR'} ${Number(itinerary.perPersonCost).toLocaleString('en-IN')}`;
                  }
                })()}
              </p>
              <p className="text-sm text-white/50 mt-2 font-medium tracking-wide uppercase">Per Person</p>
              
              {itinerary.totalCost && (
                <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-sm mx-auto">
                  <p className="text-sm text-white/60 mb-1">Total Package Cost</p>
                  <p className="text-2xl font-bold text-white/90">
                  {(() => {
                    try {
                      return new Intl.NumberFormat(undefined, { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.totalCost));
                    } catch (e) {
                      return `${itinerary.currency || 'INR'} ${Number(itinerary.totalCost).toLocaleString('en-IN')}`;
                    }
                  })()}
                  </p>
                  <p className="text-xs text-white/40 mt-2 font-medium">{itinerary.adults} Adults{itinerary.children ? `, ${itinerary.children} Children` : ''} • {itinerary.currency || 'INR'}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Package Policies */}
        {(itinerary.inclusionsHtml || itinerary.exclusionsHtml || itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-10">
            <h2 className="font-black text-2xl text-slate-900 mb-2 flex items-center gap-2 italic"><Shield className="w-7 h-7 text-blue-600" /> Package Policies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {itinerary.inclusionsHtml && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><CheckCircle className="w-5 h-5" /></div>
                    <span className="font-black text-xs uppercase tracking-widest text-slate-700">Inclusions</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed pl-1 prose prose-slate max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.inclusionsHtml) }} />
                </div>
              )}
              {itinerary.exclusionsHtml && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100"><XCircle className="w-5 h-5" /></div>
                    <span className="font-black text-xs uppercase tracking-widest text-slate-700">Exclusions</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed pl-1 prose prose-slate max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.exclusionsHtml) }} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
              {itinerary.paymentPolicyHtml && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1"><CreditCard className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Payment Policy</span></div>
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.paymentPolicyHtml) }} />
                </div>
              )}
              {itinerary.cancellationPolicyHtml && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 mb-1"><AlertTriangle className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Cancellation</span></div>
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.cancellationPolicyHtml) }} />
                </div>
              )}
              {itinerary.termsHtml && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600 mb-1"><Shield className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Security Terms</span></div>
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.termsHtml) }} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-xs font-medium text-slate-400 py-8">
          <p>This itinerary preview was beautifully crafted with TravelCRM.</p>
        </div>
      </div>
    </div>
  );
}
