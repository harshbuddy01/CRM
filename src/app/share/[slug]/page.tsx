'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Hotel, Utensils, Car, Plane, Sun, Mountain, Compass, LogIn, LogOut, Loader2, Shield, CheckCircle, XCircle, CreditCard, AlertTriangle, ArrowRight, CalendarRange, Clock } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { api } from '@/lib/api';

const EVENT_ICONS: Record<string, any> = {
  accommodation: Hotel, sightseeing: Mountain, activity: Compass, transport: Car,
  flight: Plane, meal: Utensils, checkin: LogIn, checkout: LogOut, freeTime: Sun,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

function ExpandableText({ text, limit = 400, className = "" }: { text: string; limit?: number; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > limit;

  return (
    <motion.div layout className="space-y-2">
      <motion.div layout initial={false} animate={{ height: "auto" }} className="overflow-hidden">
        <p className={className}>
          {expanded || !isLong ? text : `${text.slice(0, limit)}...`}
        </p>
      </motion.div>
      {isLong && (
        <motion.button 
          layout
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-2 group mt-2"
        >
          <span className="w-6 h-px bg-blue-200 group-hover:w-10 transition-all" />
          {expanded ? 'Read less' : 'Read full description'}
        </motion.button>
      )}
    </motion.div>
  );
}

export default function SharePage() {
  const { slug } = useParams();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnboxed, setIsUnboxed] = useState(false);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 250]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 1.1]);

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
          document.title = `${res.data.data.title} | Imagica Holidays`;
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

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (error || !itinerary) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-center p-4">
      <div className="bg-white p-10 rounded-[32px] shadow-sm max-w-sm border border-slate-100">
        <AlertTriangle className="w-12 h-12 mx-auto text-rose-300 mb-6" />
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Proposal Not Found</h1>
        <p className="text-sm text-slate-500 mt-2">This link may have expired or is invalid.</p>
      </div>
    </div>
  );

  const destinations = Array.from(new Set(itinerary.days?.map((d: any) => d.destination?.name).filter(Boolean))) as string[];

  const sanitize = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html);
  };

  return (
    <>
      <AnimatePresence>
        {!isUnboxed && itinerary && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)", transition: { duration: 1, ease: "easeOut" } }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 overflow-hidden"
          >
            {/* Background Image with heavy blur */}
            {itinerary.coverPhotoUrl && (
              <img src={itinerary.coverPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-110" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative max-w-md w-full px-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                 <Compass className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                {itinerary.title}
              </h2>
              <p className="text-blue-200 font-medium mb-12 tracking-wide uppercase text-xs">
                Your Exclusive Proposal
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUnboxed(true)}
                className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-50 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  View Proposal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 ${!isUnboxed ? 'h-screen overflow-hidden' : ''}`}>
        
        {/* PARALLAX HERO OVERLAY */}
        <div className="relative h-[85vh] w-full overflow-hidden flex items-end">
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 w-full h-[120%] -top-[10%] origin-bottom">
            <img src={itinerary.coverPhotoUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent" />
          </motion.div>
          
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pb-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-xl">
                 Imagica Holidays
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-xl mb-6 max-w-4xl">{itinerary.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium">
                 {itinerary.days?.length > 0 && (
                   <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                     <CalendarRange className="w-4 h-4 text-blue-300" /> {itinerary.days.length} Days
                   </div>
                 )}
                 {destinations.length > 0 && (
                   <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                     <MapPin className="w-4 h-4 text-emerald-300" /> {destinations.join(' • ')}
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-12 space-y-32 pb-32 -mt-10 relative z-20">
          
          {/* OVERVIEW CARD (GLASS) */}
          {itinerary.description && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full">
                 <h2 className="text-slate-800 text-2xl font-bold mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Compass className="w-4 h-4" /></div>
                   Trip Overview
                 </h2>
                 <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
                   {itinerary.description}
                 </p>
              </div>
            </motion.div>
          )}

          {/* HORIZONTAL GLASS HOTEL CARDS ("Use UI/UX") */}
          {itinerary.days?.some((d: any) => d.events?.some((e: any) => e.type === 'accommodation')) && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-100">
                  <Hotel className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Accommodations</h2>
              </div>
              
              <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any, idx: number) => (
                  <motion.div 
                    key={ev.id ?? `day-${day.dayNumber}-accom-${idx}`} 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="flex-none w-[340px] snap-center bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-lg border border-white/80 group overflow-hidden relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Day {day.dayNumber}</span>
                      
                      <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{ev.metadata?.hotelName || ev.title}</h3>
                      <p className="text-slate-500 font-medium text-sm mb-8">{ev.metadata?.roomType || 'Standard Room'}</p>
                      
                      <div className="space-y-4 pt-6 border-t border-slate-100/80">
                        {ev.metadata?.mealPlan && (
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-white shadow-sm rounded-xl px-4 py-3 border border-slate-50">
                            <Utensils className="w-4 h-4 text-emerald-500" /> {ev.metadata.mealPlan}
                          </div>
                        )}
                        {(ev.metadata?.checkInDate || ev.metadata?.checkInTime) && (
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-white shadow-sm rounded-xl px-4 py-3 border border-slate-50">
                            <LogIn className="w-4 h-4 text-blue-500" /> 
                            <span>{ev.metadata.checkInDate} <span className="text-slate-400 mx-1">•</span> {ev.metadata.checkInTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )))}
              </div>
            </motion.div>
          )}

          {/* THE ITINERARY JOURNEY (Fix missing photos) */}
          <div className="pt-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 flex items-center gap-4">
               <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-100">
                  <Compass className="w-6 h-6 text-rose-500" />
                </div>
              <h2 className="text-4xl font-bold text-slate-800 tracking-tight">The Journey</h2>
            </motion.div>

            <div className="space-y-12">
              {itinerary.days?.map((day: any, idx: number) => {
                // Find all unique event images in the day
                const rawImages = day.events?.filter((e: any) => e.imageUrl).map((e:any) => e.imageUrl) || [];
                const dayImages = Array.from(new Set(rawImages)) as string[];
                
                return (
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    key={day.dayNumber}
                  >
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden relative">
                      {/* Day Header */}
                      <div className="bg-slate-50 border-b border-slate-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center shrink-0">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Day</span>
                             <span className="text-2xl font-black text-slate-800 leading-none mt-1">{day.dayNumber}</span>
                           </div>
                           <div>
                             <h3 className="text-2xl font-bold text-slate-800 leading-tight">{day.title || `Day ${day.dayNumber}`}</h3>
                             {day.destination?.name && (
                               <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wide mt-1">
                                 <MapPin className="w-3 h-3" /> {day.destination.name}
                               </div>
                             )}
                           </div>
                         </div>
                      </div>

                      {/* Day Body */}
                      <div className="p-6 md:p-8">
                        {day.description && (
                           <div className="mb-10 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                             <ExpandableText text={day.description} limit={300} className="text-slate-600 text-base leading-relaxed font-medium" />
                           </div>
                        )}
                        
                        {/* Render all photos for the day to solve "Missing Photos" */}
                        {dayImages.length > 0 && (
                           <div className="mb-10 flex overflow-x-auto hide-scrollbar gap-4 -mx-6 px-6 md:mx-0 md:px-0">
                             {dayImages.map((img: string, imgIdx: number) => (
                               <div key={imgIdx} className="flex-none w-64 md:w-80 aspect-[4/3] rounded-2xl overflow-hidden shadow-sm shrink-0">
                                 <img src={img} alt="Day highlight" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                               </div>
                             ))}
                           </div>
                        )}

                        {/* Events List */}
                        {day.events?.length > 0 && (
                          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {day.events.map((ev: any, evIdx: number) => { 
                              if (ev.type === 'accommodation') return null; // Displayed in cards
                              const Icon = EVENT_ICONS[ev.type] || Compass;

                              return (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * evIdx }}
                                  key={ev.id ?? evIdx} 
                                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                >
                                  {/* Timeline dot */}
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform z-10">
                                    <Icon className="w-4 h-4" />
                                  </div>

                                  {/* Event Card */}
                                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                       <h4 className="text-xl font-bold text-slate-800">{ev.title}</h4>
                                       {ev.startTime && <span className="bg-slate-50 text-slate-500 text-xs font-bold px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {ev.startTime}</span>}
                                    </div>
                                    
                                    {ev.description && <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-3">{ev.description}</p>}
                                    
                                    {/* Fix: Render individual event metadata/images if necessary */}
                                    {ev.imageUrl && dayImages.length === 0 && (
                                       <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-slate-100">
                                         <img src={ev.imageUrl} className="w-full h-full object-cover" alt="" />
                                       </div>
                                    )}
                                  </div>
                                </motion.div>
                              ); 
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* GALLERY - MASONRY/GRID ANIMATED */}
          {itinerary.galleryImages?.length > 0 && (
             <div className="pt-16">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-100">
                    <Sun className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Gallery</h2>
                </motion.div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {itinerary.galleryImages.map((img: any, idx: number) => (
                    <motion.div 
                      key={img.id ?? idx} 
                      initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="relative group overflow-hidden rounded-2xl md:rounded-[2rem] shadow-sm aspect-square"
                    >
                      <img src={img.imageUrl} alt={img.caption || ''} className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" />
                      {img.caption && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <p className="text-sm font-bold text-white tracking-wide">{img.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
             </div>
          )}

          {/* PRICING CARD - UI/UX GLASS */}
          {itinerary.perPersonCost && (
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
              className="py-12"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                 {/* Decorative elements */}
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-white/10 rotate-12 blur-3xl rounded-full" />
                    <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] bg-blue-400/20 -rotate-12 blur-3xl rounded-full" />
                 </div>

                 <div className="relative z-10">
                   <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-blue-50 mb-8 border border-white/10 shadow-sm">Your Investment</span>
                   <p className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 drop-shadow-lg">
                     {(() => {
                       try {
                         return new Intl.NumberFormat('en-IN', { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.perPersonCost));
                       } catch (e) {
                         return `${itinerary.currency || 'INR'} ${Number(itinerary.perPersonCost).toLocaleString('en-IN')}`;
                       }
                     })()}
                   </p>
                   <p className="text-sm text-blue-200 font-medium">Per individual explorer</p>
                   
                   {itinerary.totalCost && (
                     <div className="mt-12 pt-12 border-t border-white/10 flex flex-col items-center">
                       <span className="text-2xl md:text-3xl font-bold mb-2">
                         {(() => {
                           try {
                             return new Intl.NumberFormat('en-IN', { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.totalCost));
                           } catch (e) {
                             return `${itinerary.currency || 'INR'} ${Number(itinerary.totalCost).toLocaleString('en-IN')}`;
                           }
                         })()}
                       </span>
                       <span className="text-[10px] uppercase tracking-widest font-bold text-blue-300">
                         Total package for {itinerary.adults} Adults {itinerary.children > 0 && `& ${itinerary.children} Children`}
                       </span>
                     </div>
                   )}
                 </div>
              </div>
            </motion.div>
          )}

          {/* POLICIES / TERMS - CLEAN UI GRIDS */}
          {(itinerary.inclusionsHtml || itinerary.exclusionsHtml || itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
             <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8">
                <div className="mb-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-100">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Provisions & Terms</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {itinerary.inclusionsHtml && (
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                      <h4 className="text-sm uppercase tracking-widest font-black text-emerald-600 mb-6 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Included</h4>
                      <div className="text-sm text-slate-600 leading-loose prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.inclusionsHtml) }} />
                    </div>
                  )}
                  {itinerary.exclusionsHtml && (
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                      <h4 className="text-sm uppercase tracking-widest font-black text-rose-500 mb-6 flex items-center gap-2"><XCircle className="w-4 h-4" /> Excluded</h4>
                      <div className="text-sm text-slate-500 leading-loose prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.exclusionsHtml) }} />
                    </div>
                  )}
                </div>

                {(itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    {itinerary.paymentPolicyHtml && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" /> Payment Policy</h4>
                        <div className="text-xs text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.paymentPolicyHtml) }} />
                      </div>
                    )}
                    {itinerary.cancellationPolicyHtml && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Cancellation</h4>
                        <div className="text-xs text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.cancellationPolicyHtml) }} />
                      </div>
                    )}
                    {itinerary.termsHtml && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> Terms</h4>
                        <div className="text-xs text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.termsHtml) }} />
                      </div>
                    )}
                  </div>
                )}
             </motion.div>
          )}

          {/* SIGNATURE */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center pt-24 pb-12">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
               <span className="text-white font-black text-xl">IH</span>
            </div>
            <p className="font-bold text-xl text-slate-800 mb-2">Imagica Holidays</p>
            <p className="text-sm text-slate-500 font-medium">Extraordinary journeys crafted with care.</p>
          </motion.div>

        </div>
      </div>
    </>
  );
}
