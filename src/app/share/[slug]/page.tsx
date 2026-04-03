'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Hotel, Utensils, Car, Plane, Sun, Mountain, Compass, LogIn, LogOut, CalendarRange, Loader2, Shield, CheckCircle, XCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import DOMPurify from 'dompurify';
import { api } from '@/lib/api';

const EVENT_ICONS: Record<string, any> = {
  accommodation: Hotel, sightseeing: Mountain, activity: Compass, transport: Car,
  flight: Plane, meal: Utensils, checkin: LogIn, checkout: LogOut, freeTime: Sun,
};

function ExpandableText({ text, limit = 400, className = "" }: { text: string; limit?: number; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= limit) return <p className={className}>{text}</p>;

  return (
    <div className="space-y-4">
      <p className={className}>
        {expanded ? text : `${text.slice(0, limit)}...`}
      </p>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="font-handwriting text-2xl text-blue-400 hover:text-blue-500 transition-colors flex items-center gap-2 group"
      >
        <span className="w-8 h-px bg-blue-300/30 group-hover:w-12 transition-all" />
        {expanded ? 'Read less of the story' : 'Read the full story'}
      </button>
    </div>
  );
}

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

    const loadData = async () => {
      try {
        const res = await api.get(`/itineraries/share/${slug}`);
        if (res.data.success) {
          setItinerary(res.data.data);
          // Set page title dynamically
          document.title = `${res.data.data.title} | Travel Itinerary`;
        } else {
          setError('Itinerary not found');
        }
      } catch (err: any) {
        console.error('Share Load Error:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  if (error || !itinerary) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-center p-4">
      <div className="bg-white p-12 rounded-[40px] shadow-sm sketchy-border max-w-sm">
        <CalendarRange className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-handwriting text-slate-800">Itinerary Not Found</h1>
        <p className="text-sm text-slate-500 mt-4">This link may have expired or is invalid.</p>
        <div className="mt-8 pt-8 border-t border-dashed border-slate-100">
          <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">TravelCRM Artisanal System</p>
        </div>
      </div>
    </div>
  );

  const destinations = Array.from(new Set(itinerary.days?.map((d: any) => d.destination?.name).filter(Boolean))) as string[];

  const sanitize = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html);
  };

  return (
    <div className="min-h-screen paper-texture pb-20 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Handcrafted Header Ornament */}
      <div className="h-2 w-full bg-gradient-to-r from-transparent via-blue-200/30 to-transparent absolute top-0 z-50 pointer-events-none" />

      {/* Hero */}
      <div className="relative bg-slate-900 text-white overflow-hidden min-h-[70vh] flex items-center">
        {itinerary.coverPhotoUrl && (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            src={itinerary.coverPhotoUrl} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-4 w-full z-10 py-24">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[60px] p-8 md:p-16 shadow-2xl max-w-4xl relative overflow-hidden">
            {/* SVG Botanical Ornament */}
            <div className="absolute top-8 right-8 text-white/20 pointer-events-none hidden md:block">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 C60 20 80 30 100 30 Q80 50 100 70 C80 70 70 90 50 100 Q30 80 0 70 Q20 50 0 30 C20 30 40 20 50 0" />
              </svg>
            </div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <p className="font-handwriting text-3xl text-blue-300 mb-6 flex items-center gap-4">
                <span className="h-px w-12 bg-blue-300/30" />
                Crafted specifically for you
                <span className="h-px w-12 bg-blue-300/30" />
              </p>
              <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none mb-8 drop-shadow-lg">{itinerary.title}</h1>
              {itinerary.description && (
                <div className="relative mt-8 group/intro">
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-400/50 rounded-full group-hover/intro:h-20 transition-all duration-700" />
                  
                  {/* Decorative Hand-drawn Bird Icon */}
                  <div className="absolute -top-12 -right-6 text-blue-200/40 pointer-events-none group-hover/intro:rotate-12 transition-transform duration-1000">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 7c-1.5 0-3-1-3-3s1.5-2 3-2 3 1 3 3-1.5 3-3 3zM2 17c0-3 3-4 5-4s5 1 5 4v3H2v-3z" />
                      <path d="M7 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                      <path d="M12 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                    </svg>
                  </div>

                  <ExpandableText 
                    text={itinerary.description} 
                    limit={300} 
                    className="text-white/90 max-w-2xl text-xl leading-relaxed font-medium italic pl-4"
                  />
                </div>
              )}
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-8 mt-12 p-6 bg-white/5 rounded-3xl w-fit flex-wrap border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30"><CalendarRange className="w-5 h-5 text-blue-400" /></div>
                <div><p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Duration</p><p className="font-bold text-lg">{itinerary.days?.length || 0} Enchanting Days</p></div>
              </div>
              {destinations.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30"><MapPin className="w-5 h-5 text-emerald-400" /></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Regions</p><p className="font-bold text-lg">{destinations.join(' • ')}</p></div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-24">
        
        {/* Handcrafted Intro Scroll */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-1 bg-slate-200 mx-auto mb-8 rounded-full" />
          <h2 className="font-handwriting text-5xl text-slate-800 mb-4 italic leading-tight">Every mile a story, every day a memory in the making.</h2>
          <div className="w-20 h-1 bg-slate-200 mx-auto mt-8 rounded-full" />
        </div>

        {/* Hotel Summary */}
        {itinerary.days?.some((d: any) => d.events?.some((e: any) => e.type === 'accommodation')) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[50px] shadow-xl border-none sketchy-border overflow-hidden relative group">
            <div className="washi-tape washi-tape-top-right bg-blue-400/40 w-24 h-10 -rotate-12" />
            <div className="washi-tape washi-tape-bottom-left bg-emerald-400/40 w-24 h-10 rotate-12" />
            
            <div className="px-12 py-10 border-b border-dashed border-slate-200 bg-slate-50/50">
              <h2 className="font-handwriting text-5xl text-slate-900 flex items-center justify-center gap-4">
                <Hotel className="w-10 h-10 text-blue-600 drop-shadow-sm" /> Residential Sanctuary
              </h2>
            </div>
            
            <div className="overflow-x-auto p-8">
              <table className="w-full">
                <thead><tr className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black border-b border-slate-100">
                  <th className="text-left py-6 px-4">Timeline</th>
                  <th className="text-left py-6 px-4">The Retreat</th>
                  <th className="text-left py-6 px-4">Accommodations</th>
                  <th className="text-right py-6 px-4">Dining Experience</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any, idx: number) => (
                    <tr key={ev.id ?? `day-${day.dayNumber}-accom-${idx}`} className="hover:bg-slate-50/70 transition-all duration-300 group/row">
                      <td className="py-8 px-4"><span className="bg-slate-100 px-4 py-2 rounded-2xl font-black text-xs text-slate-500">Day {day.dayNumber}</span></td>
                      <td className="py-8 px-4 font-black text-xl text-slate-800 flex items-center gap-3">
                         {ev.metadata?.hotelName || ev.title}
                      </td>
                      <td className="py-8 px-4 text-slate-600 font-bold font-handwriting text-2xl drop-shadow-sm">{ev.metadata?.roomType || 'Standard Comfort'}</td>
                      <td className="py-8 px-4 text-right">
                        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-xs border border-blue-100">
                          <Utensils className="w-3 h-3" /> {ev.metadata?.mealPlan || 'Plan Included'}
                        </span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="relative pt-12">
          <div className="flex flex-col items-center mb-24">
            <h2 className="font-handwriting text-8xl text-slate-900 mb-4 drop-shadow-sm leading-none">Journal Entry</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 bg-blue-50 px-8 py-3 rounded-full border border-blue-100">Chronological Progression</p>
          </div>
          
          <div ref={containerRef} className="relative max-w-4xl mx-auto">
            {/* Artistic Scroll Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-300 shrink-0 -translate-x-1/2 hidden md:block" />
            <div className="absolute left-6 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-300 shrink-0 -translate-x-1/2 md:hidden" />
            
            {/* Moving Ink Compass */}
            <motion.div 
              className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white border-2 border-slate-900 flex items-center justify-center shadow-xl rotate-12 rounded-3xl overflow-hidden"
              style={{ top: carY }}
            >
              <div className="absolute inset-0 bg-paper-texture opacity-30" />
              <Compass className="w-8 h-8 text-slate-900 relative z-10 animate-spin-slow" />
            </motion.div>

            {itinerary.days?.map((day: any, idx: number) => {
              const eventImages = day.events?.filter((e: any) => e.imageUrl).map((e:any) => e.imageUrl) || [];
              const isEven = idx % 2 === 0;

              return (
                <motion.div 
                  key={day.id ?? `day-${idx}`} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className={`relative flex md:w-1/2 mb-20 clear-both ${isEven ? 'md:float-left md:pr-16 md:text-right' : 'md:float-right md:pl-16 md:text-left'} pl-16 md:pl-0`}
                >
                  <div className={`absolute top-8 w-12 h-12 rounded-full bg-slate-900 border-4 border-white shadow-lg z-10 flex items-center justify-center text-white font-black text-sm hidden md:flex ${isEven ? 'right-[-24px]' : 'left-[-24px]'} rotate-[-5deg]`}>
                    D{day.dayNumber}
                  </div>

                  <div className="bg-white hover:shadow-2xl transition-all duration-500 rounded-[50px] shadow-sm border-none sketchy-border overflow-hidden w-full group relative">
                    <div className={`washi-tape ${idx % 3 === 0 ? 'bg-amber-400/30' : idx % 3 === 1 ? 'bg-rose-400/30' : 'bg-blue-400/30'} washi-tape-top-right w-16 h-8`} />
                    
                    {eventImages.length > 0 && (
                      <div className="relative h-64 w-full overflow-hidden">
                        <img src={eventImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 saturate-[0.8] contrast-[1.1]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                        <div className={`absolute bottom-6 ${isEven ? 'md:right-8 left-8' : 'left-8'}`}>
                           <p className="font-handwriting text-3xl text-white drop-shadow-md">Captured Moment</p>
                        </div>
                      </div>
                    )}

                    <div className="p-10">
                      <h3 className="font-handwriting text-5xl text-slate-900 leading-tight mb-2">{day.title || `Chapter ${day.dayNumber}`}</h3>
                      {day.destination?.name && (
                        <div className={`flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 ${isEven ? 'justify-end' : ''}`}>
                          <MapPin className="w-3 h-3" /> {day.destination.name}
                        </div>
                      )}
                      
                      {day.description && (
                         <div className="relative mt-6">
                            <div className={`absolute top-0 bottom-0 w-0.5 bg-slate-100 rounded-full transition-all group-hover:bg-blue-200/50 ${isEven ? 'md:-right-6 md:left-auto -left-6' : '-left-6'}`} />
                            <ExpandableText 
                              text={day.description} 
                              limit={250} 
                              className="text-slate-600 text-base leading-[1.8] font-medium italic"
                            />
                         </div>
                      )}

                      {day.events?.length > 0 && (
                        <div className={`mt-10 space-y-6 pt-10 border-t border-dashed border-slate-100`}>
                          {day.events.map((ev: any, evIdx: number) => { 
                            const Icon = EVENT_ICONS[ev.type] || MapPin; 
                            return (
                              <div key={ev.id ?? `event-${evIdx}`} className={`flex items-start gap-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                  <Icon className="w-5 h-5 text-slate-900" />
                                </div>
                                <div className={`flex-1 ${isEven ? 'md:text-right' : ''}`}>
                                  <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{ev.title}</p>
                                  {ev.description && <p className="text-xs text-slate-500 mt-1 font-medium">{ev.description}</p>}
                                  {ev.startTime && <p className="font-handwriting text-lg text-blue-400 mt-2">{ev.startTime}{ev.endTime && ` — ${ev.endTime}`}</p>}
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
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[60px] shadow-2xl border-none p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="flex flex-col items-center mb-12">
               <h2 className="font-handwriting text-6xl text-slate-900 mb-2">Artistic Album</h2>
               <div className="h-1 w-24 bg-slate-200 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {itinerary.galleryImages.map((img: any, idx: number) => (
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 3 : -3 }}
                  key={img.id ?? img.imageUrl ?? idx} 
                  className="relative group overflow-hidden rounded-[30px] aspect-[4/5] shadow-lg border-2 border-white"
                >
                   <img src={img.imageUrl} alt={img.caption || ''} className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                   {img.caption && (
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-[10px] text-white font-bold text-center uppercase tracking-widest">{img.caption}</p>
                     </div>
                   )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pricing */}
        {itinerary.perPersonCost && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-slate-900 rounded-[60px] p-12 md:p-20 text-white text-center shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <span className="font-handwriting text-4xl text-blue-300 block mb-6 italic underline underline-offset-8 decoration-blue-500/30">Investment for Experience</span>
              <p className="text-6xl md:text-8xl font-black mt-8 tracking-tighter drop-shadow-2xl">
                {(() => {
                  try {
                    return new Intl.NumberFormat(undefined, { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.perPersonCost));
                  } catch (e) {
                    return `${itinerary.currency || 'INR'} ${Number(itinerary.perPersonCost).toLocaleString('en-IN')}`;
                  }
                })()}
              </p>
              <p className="text-xs text-white/40 mt-4 font-black uppercase tracking-[0.5em]">Reserved per individual</p>
              
              {itinerary.totalCost && (
                <div className="mt-12 pt-12 border-t border-white/10 w-full max-w-md mx-auto">
                  <div className="flex justify-between items-center bg-white/5 py-4 px-8 rounded-3xl border border-white/5">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Total Voyage Cost</span>
                    <span className="text-3xl font-black text-white italic">
                    {(() => {
                      try {
                        return new Intl.NumberFormat(undefined, { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.totalCost));
                      } catch (e) {
                        return `${itinerary.currency || 'INR'} ${Number(itinerary.totalCost).toLocaleString('en-IN')}`;
                      }
                    })()}
                    </span>
                  </div>
                  <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-[10px] text-white/30 mt-6 font-bold tracking-[0.2em] uppercase">
                    Including {itinerary.adults} Adults {itinerary.children > 0 && `& ${itinerary.children} Children`}
                  </motion.p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Package Policies */}
        {(itinerary.inclusionsHtml || itinerary.exclusionsHtml || itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[60px] shadow-sm border-none p-16 space-y-16 relative">
            <div className="absolute top-10 left-10 text-slate-100 pointer-events-none">
              <Shield className="w-32 h-32 opacity-20" />
            </div>
            
            <div className="text-center relative z-10">
              <h2 className="font-handwriting text-6xl text-slate-900 mb-2 italic">Provisions & Promises</h2>
              <div className="h-1 w-20 bg-slate-100 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              {itinerary.inclusionsHtml && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm"><CheckCircle className="w-6 h-6" /></div>
                    <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Included Essence</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed pl-2 prose prose-slate max-w-none whitespace-pre-wrap font-medium font-handwriting text-2xl" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.inclusionsHtml) }} />
                </div>
              )}
              {itinerary.exclusionsHtml && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm"><XCircle className="w-6 h-6" /></div>
                    <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Personal Responsibility</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed pl-2 prose prose-slate max-w-none whitespace-pre-wrap font-medium italic opacity-70" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.exclusionsHtml) }} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-dashed border-slate-100 relative z-10">
              {itinerary.paymentPolicyHtml && (
                <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100/50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 text-blue-600 mb-6"><CreditCard className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Financial Protocol</span></div>
                  <div className="text-xs text-slate-500 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.paymentPolicyHtml) }} />
                </div>
              )}
              {itinerary.cancellationPolicyHtml && (
                <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100/50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 text-amber-600 mb-6"><AlertTriangle className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Change Policy</span></div>
                  <div className="text-xs text-slate-500 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.cancellationPolicyHtml) }} />
                </div>
              )}
              {itinerary.termsHtml && (
                <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100/50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 text-slate-600 mb-6"><Shield className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Formal Terms</span></div>
                  <div className="text-xs text-slate-500 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.termsHtml) }} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Handcrafted Signature */}
        <div className="text-center pt-20">
          <div className="inline-block relative">
             <div className="absolute -top-12 -right-12 text-blue-500/10 rotate-12 pointer-events-none">
                <Compass className="w-24 h-24" />
             </div>
             <p className="font-handwriting text-4xl text-slate-900 relative z-10 italic">Your journey, curated with passion.</p>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-6">Handcrafted by TravelCRM Elite</p>
          </div>
        </div>

      </div>
    </div>
  );
}

