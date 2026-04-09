'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Hotel, Utensils, Car, Plane, Sun, Mountain, Compass, LogIn, LogOut, Loader2, Shield, CheckCircle, XCircle, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { api } from '@/lib/api';

const EVENT_ICONS: Record<string, any> = {
  accommodation: Hotel, sightseeing: Mountain, activity: Compass, transport: Car,
  flight: Plane, meal: Utensils, checkin: LogIn, checkout: LogOut, freeTime: Sun,
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function SharePage() {
  const { slug } = useParams();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnboxed, setIsUnboxed] = useState(false);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);

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
          document.title = `${res.data.data.title} | Exclusive Journey`;
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

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#fafafa]"><Loader2 className="w-8 h-8 animate-spin text-slate-800" /></div>;
  if (error || !itinerary) return (
    <div className="flex h-screen items-center justify-center bg-[#fafafa] text-center p-4">
      <div className="max-w-sm">
        <Compass className="w-8 h-8 mx-auto text-slate-300 mb-6" />
        <h1 className="text-xl font-serif text-slate-900 tracking-wide uppercase">Journey Not Found</h1>
        <p className="text-xs tracking-widest uppercase text-slate-400 mt-4 leading-loose">The requested dossier has expired or is unavailable.</p>
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
            exit={{ opacity: 0, transition: { duration: 1.5 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fafafa] overflow-hidden"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative max-w-lg w-full px-8 flex flex-col items-center text-center"
            >
              <h2 className="font-serif text-2xl md:text-3xl text-slate-900 mb-6 tracking-wide leading-relaxed">
                Your Exclusive Dossier<br />Is Ready For Viewing
              </h2>
              <div className="w-12 h-[1px] bg-slate-300 mb-8" />
              <p className="text-slate-400 font-sans tracking-[0.3em] uppercase text-[9px] mb-16 leading-loose">
                Prepared by Imagica Holidays<br />For {itinerary.title}
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUnboxed(true)}
                className="group flex flex-col items-center gap-4 transition-all"
              >
                <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-800 transition-colors duration-700">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors duration-700" strokeWidth={1} />
                </div>
                <span className="font-sans text-slate-500 tracking-[0.2em] text-[10px] uppercase group-hover:text-slate-900 transition-colors duration-700">Enter The Journey</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen bg-[#fafafa] text-slate-800 selection:bg-slate-200 selection:text-slate-900 ${!isUnboxed ? 'h-screen overflow-hidden' : ''}`}>
        
        {/* PARALLAX HERO - EDGE TO EDGE */}
        <div className="relative h-screen w-full overflow-hidden flex items-end">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            <img src={itinerary.coverPhotoUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'} alt="Cover" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent" />
          </motion.div>
          
          <div className="relative z-10 w-full px-6 md:px-16 pb-16 md:pb-24">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 1 }}>
              <div className="flex items-center gap-6 mb-8">
                <span className="h-[1px] w-12 bg-slate-400" />
                <span className="text-slate-100 uppercase tracking-[0.4em] text-[9px] font-bold">Curated Expedition</span>
              </div>
              <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-serif text-slate-900 tracking-tighter leading-[0.9] drop-shadow-sm max-w-6xl">{itinerary.title}</h1>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 space-y-32 pb-32">
          
          {/* SYNOPSIS & METRICS */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start -mt-16"
          >
            <div className="lg:col-span-8">
              {itinerary.description && (
                <p className="text-xl md:text-3xl font-serif leading-relaxed text-slate-600">
                  {itinerary.description}
                </p>
              )}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-12">
              <div className="border-t border-slate-200 pt-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-3">Duration</p>
                <p className="text-2xl font-serif text-slate-900">{itinerary.days?.length || 0} Distinct Days</p>
              </div>
              <div className="border-t border-slate-200 pt-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-3">Destinations</p>
                <p className="text-xl font-serif text-slate-900 leading-snug">{destinations.join(' — ') || 'Custom Traverse'}</p>
              </div>
            </div>
          </motion.div>

          {/* MINIMAL ACCOMMODATION LIST */}
          {itinerary.days?.some((d: any) => d.events?.some((e: any) => e.type === 'accommodation')) && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
              <div className="mb-16">
                <h2 className="font-serif text-4xl md:text-6xl text-slate-900">Residences</h2>
                <div className="h-[1px] w-24 bg-slate-900 mt-8" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any, idx: number) => (
                  <motion.div key={ev.id ?? `day-${day.dayNumber}-accom-${idx}`} className="group cursor-default">
                    <span className="inline-block text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Day {day.dayNumber}</span>
                    <h3 className="font-serif text-2xl text-slate-900 mb-2 leading-tight group-hover:text-slate-500 transition-colors duration-500">{ev.metadata?.hotelName || ev.title}</h3>
                    <p className="text-slate-500 font-serif italic mb-6">{ev.metadata?.roomType || 'Standard Comfort'}</p>
                    
                    <ul className="space-y-3 pt-6 border-t border-slate-200">
                      {ev.metadata?.mealPlan && (
                        <li className="flex items-center gap-4 text-xs text-slate-500"><Utensils className="w-3 h-3 text-slate-400" /> <span className="tracking-wide">{ev.metadata.mealPlan}</span></li>
                      )}
                      {(ev.metadata?.checkInDate || ev.metadata?.checkInTime) && (
                        <li className="flex items-center gap-4 text-xs text-slate-500"><LogIn className="w-3 h-3 text-slate-400" /> <span className="tracking-wide uppercase text-[10px]">{ev.metadata.checkInDate} — {ev.metadata.checkInTime}</span></li>
                      )}
                    </ul>
                  </motion.div>
                )))}
              </div>
            </motion.div>
          )}

          {/* THE CHRONICLE (Days Timeline) */}
          <div className="pt-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-24">
              <h2 className="font-serif text-4xl md:text-6xl text-slate-900">The Itinerary</h2>
              <div className="h-[1px] w-24 bg-slate-900 mt-8" />
            </motion.div>

            <div className="space-y-0">
              {itinerary.days?.map((day: any, idx: number) => {
                const eventImages = day.events?.filter((e: any) => e.imageUrl).map((e:any) => e.imageUrl) || [];
                
                return (
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    key={day.dayNumber}
                    className="py-16 md:py-24 border-t border-slate-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
                      
                      {/* Left: Day & Image Focus */}
                      <div className="lg:col-span-5 flex flex-col">
                        <div className="flex items-baseline gap-4 mb-8">
                          <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400">Chapter</span>
                          <span className="font-serif text-6xl text-slate-900 leading-none">{day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}</span>
                        </div>
                        
                        {eventImages.length > 0 && (
                          <div className="w-full aspect-[4/5] overflow-hidden mt-auto">
                             <img src={eventImages[0]} alt="" className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105 filter grayscale-[0.2]" />
                          </div>
                        )}
                      </div>

                      {/* Right: Narrative & Events */}
                      <div className="lg:col-span-7 pt-4">
                        <h3 className="font-serif text-4xl leading-tight text-slate-900 mb-6">{day.title || 'A day of discovery'}</h3>
                        
                        {day.destination?.name && (
                           <div className="flex items-center gap-3 text-slate-500 font-sans text-[9px] uppercase tracking-[0.3em] mb-12">
                             <MapPin className="w-3 h-3" /> {day.destination.name}
                           </div>
                        )}

                        {day.description && (
                           <p className="text-slate-500 text-lg md:text-xl font-serif italic leading-loose mb-16">
                             {day.description}
                           </p>
                        )}
                        
                        {/* Event Flow */}
                        {day.events?.length > 0 && (
                          <div className="space-y-12">
                            {day.events.map((ev: any, evIdx: number) => { 
                              if (ev.type === 'accommodation') return null; // Displayed above

                              return (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                  key={ev.id ?? evIdx} 
                                  className="group"
                                >
                                  <div className="flex items-baseline gap-4 mb-2">
                                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400 w-24 shrink-0">
                                      {ev.startTime ? ev.startTime : EVENT_ICONS[ev.type] ? ev.type : 'Event'}
                                    </span>
                                    <h4 className="text-2xl font-serif text-slate-900 group-hover:text-slate-500 transition-colors">{ev.title}</h4>
                                  </div>

                                  <div className="ml-28">
                                    {ev.metadata?.vehicleType && <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2">{ev.metadata.vehicleType}</p>}
                                    {ev.description && <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{ev.description}</p>}
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

          {/* GALLERY - HIGH FASHION MASONRY */}
          {itinerary.galleryImages?.length > 0 && (
             <div className="pt-16 pb-16">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-20 text-center">
                  <h2 className="font-serif text-5xl md:text-7xl text-slate-900 mb-6">Visuals</h2>
                  <div className="h-[1px] w-12 bg-slate-400 mx-auto" />
                </motion.div>
                
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {itinerary.galleryImages.map((img: any, idx: number) => (
                    <motion.div key={img.id ?? idx} variants={fadeUp} className="break-inside-avoid relative group overflow-hidden">
                      <div className="relative w-full h-full">
                        <img src={img.imageUrl} alt={img.caption || ''} className="w-full h-auto object-cover transition-transform duration-[3s] ease-out group-hover:scale-105" />
                      </div>
                      {img.caption && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-8">
                          <p className="text-[9px] text-white font-sans uppercase tracking-[0.3em] font-bold">{img.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
             </div>
          )}

          {/* INVESTMENT / PRICING */}
          {itinerary.perPersonCost && (
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
              className="py-32 border-y border-slate-200 text-center"
            >
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 block mb-8">The Investment</span>
              <p className="text-6xl md:text-[8rem] font-serif tracking-tighter text-slate-900 leading-none">
                {(() => {
                  try {
                    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.perPersonCost));
                  } catch (e) {
                    return `${itinerary.currency || 'INR'} ${Number(itinerary.perPersonCost).toLocaleString('en-IN')}`;
                  }
                })()}
              </p>
              <p className="text-xs text-slate-500 mt-12 font-serif italic">Per individual explorer</p>
              
              {itinerary.totalCost && (
                <div className="mt-16 flex flex-col items-center">
                  <span className="text-3xl font-serif text-slate-800">
                    {(() => {
                      try {
                        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.totalCost));
                      } catch (e) {
                        return `${itinerary.currency || 'INR'} ${Number(itinerary.totalCost).toLocaleString('en-IN')}`;
                      }
                    })()}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400 mt-4">
                    Total voyage value for {itinerary.adults} Adults {itinerary.children > 0 && `& ${itinerary.children} Children`}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* POLICIES */}
          {(itinerary.inclusionsHtml || itinerary.exclusionsHtml || itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
             <div className="pt-16">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-20">
                  <h2 className="font-serif text-4xl text-slate-900">Provisions & Terms</h2>
                  <div className="h-[1px] w-24 bg-slate-900 mt-8" />
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                  {itinerary.inclusionsHtml && (
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                      <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-slate-900 mb-8 pb-4 border-b border-slate-200">Included</h4>
                      <div className="text-sm text-slate-600 leading-loose prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.inclusionsHtml) }} />
                    </motion.div>
                  )}
                  {itinerary.exclusionsHtml && (
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                      <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-8 pb-4 border-b border-slate-200">Excluded</h4>
                      <div className="text-sm text-slate-500 leading-loose prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.exclusionsHtml) }} />
                    </motion.div>
                  )}
                </div>

                {(itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-24 mt-24 border-t border-slate-200">
                    {itinerary.paymentPolicyHtml && (
                      <div>
                        <h4 className="font-sans text-[9px] uppercase tracking-[0.3em] font-bold text-slate-900 mb-6 flex items-center gap-2"><CreditCard className="w-3 h-3 text-slate-400" /> Payment Policy</h4>
                        <div className="text-[11px] text-slate-500 leading-loose" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.paymentPolicyHtml) }} />
                      </div>
                    )}
                    {itinerary.cancellationPolicyHtml && (
                      <div>
                        <h4 className="font-sans text-[9px] uppercase tracking-[0.3em] font-bold text-slate-900 mb-6 flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-slate-400" /> Cancellation Policy</h4>
                        <div className="text-[11px] text-slate-500 leading-loose" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.cancellationPolicyHtml) }} />
                      </div>
                    )}
                    {itinerary.termsHtml && (
                      <div>
                        <h4 className="font-sans text-[9px] uppercase tracking-[0.3em] font-bold text-slate-900 mb-6 flex items-center gap-2"><Shield className="w-3 h-3 text-slate-400" /> Terms</h4>
                        <div className="text-[11px] text-slate-500 leading-loose" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.termsHtml) }} />
                      </div>
                    )}
                  </motion.div>
                )}
             </div>
          )}

          {/* SIGNATURE */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center pt-32 pb-16">
            <p className="font-serif text-2xl md:text-3xl text-slate-400 italic">Anticipate the extraordinary.</p>
            <div className="h-[1px] w-12 bg-slate-300 mx-auto my-8" />
            <p className="text-[9px] text-slate-900 font-sans uppercase tracking-[0.4em] font-bold">Imagica Holidays Elite</p>
          </motion.div>

        </div>
      </div>
    </>
  );
}
