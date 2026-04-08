'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Hotel, Utensils, Car, Plane, Sun, Mountain, Compass, LogIn, LogOut, CalendarRange, Loader2, Shield, CheckCircle, XCircle, CreditCard, AlertTriangle, Mail, ChevronDown, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { api } from '@/lib/api';

const EVENT_ICONS: Record<string, any> = {
  accommodation: Hotel, sightseeing: Mountain, activity: Compass, transport: Car,
  flight: Plane, meal: Utensils, checkin: LogIn, checkout: LogOut, freeTime: Sun,
};

// Elegant Unfold Component for reducing text fatigue
function UnfoldableContent({ children, label = "Unfold Chapter", className = "" }: { children: React.ReactNode; label?: string; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div layout className={`mt-8 ${className}`}>
      <motion.button 
        layout
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-[#d4af37] font-serif uppercase tracking-[0.2em] text-xs hover:text-[#b49127] transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        {isOpen ? 'Close Chapter' : label}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown className="w-4 h-4" /></motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mt-8"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SharePage() {
  const { slug } = useParams();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnboxed, setIsUnboxed] = useState(false);
  
  // Parallax Scroll Tracking
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 350]);
  const heroOpacity = useTransform(scrollY, [0, 600], [0.8, 0]);

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

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>;
  if (error || !itinerary) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-center p-4">
      <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] shadow-2xl max-w-sm backdrop-blur-xl">
        <Compass className="w-12 h-12 mx-auto text-slate-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-handwriting text-[#d4af37]">Journey Not Found</h1>
        <p className="text-sm text-slate-400 mt-4">The path you seek has expired or vanished.</p>
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
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)", transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f12] overflow-hidden"
          >
            <div className="absolute inset-0 paper-texture opacity-10 mix-blend-overlay"></div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative max-w-md w-full px-6 flex flex-col items-center text-center"
            >
              <motion.div 
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05, transition: { duration: 0.5 } }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 rounded-full bg-[#111820] border border-[#d4af37]/30 flex items-center justify-center mb-8 shadow-[0_0_50px_-10px_rgba(212,175,55,0.3)] relative cursor-pointer"
                onClick={() => setIsUnboxed(true)}
              >
                <Mail className="w-10 h-10 text-[#d4af37]" strokeWidth={1} />
              </motion.div>
              
              <h2 className="font-handwriting text-5xl text-[#d4af37] mb-4 tracking-wide drop-shadow-2xl">{itinerary.title || 'A Handcrafted Journey'}</h2>
              <p className="text-white/40 font-serif tracking-widest uppercase text-xs mb-12 decoration-[#d4af37]/30 underline underline-offset-8">Curated By Imagica Holidays</p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUnboxed(true)}
                className="group relative px-10 py-5 bg-transparent border border-[#d4af37]/30 rounded-full overflow-hidden transition-all duration-700 hover:border-[#d4af37]/80 hover:shadow-[0_0_40px_-5px_rgba(212,175,55,0.2)]"
              >
                <div className="absolute inset-0 bg-[#d4af37]/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 ease-[0.16,1,0.3,1]"></div>
                <span className="relative z-10 flex items-center justify-center gap-3 font-serif text-[#d4af37] tracking-widest text-sm uppercase">
                  Break the Seal <span className="font-handwriting text-2xl lowercase italic text-[#f4d068] ml-2">to unveil</span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen bg-[#06090a] pb-32 text-slate-200 selection:bg-[#d4af37]/30 selection:text-white ${!isUnboxed ? 'h-screen overflow-hidden' : ''}`}>
        
        {/* PARALLAX HERO */}
        <div className="relative h-[85vh] w-full overflow-hidden flex items-end pb-24">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 w-full h-full">
            <img src={itinerary.coverPhotoUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'} alt="Cover" className="w-full h-[120%] object-cover object-center grayscale-[0.2]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-[#06090a]/60 to-transparent" />
          </motion.div>
          
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }}>
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px w-16 bg-[#d4af37]/50" />
                <span className="text-[#d4af37] font-serif uppercase tracking-[0.3em] text-[10px] font-bold">The Artisanal Collection</span>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">{itinerary.title}</h1>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-32">
          
          {/* FLOATING INFO METRICS */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.3 }}
            className="flex flex-wrap gap-6 -mt-12 relative z-20"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex-1 min-w-[200px]">
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Duration</p>
              <p className="text-2xl font-serif text-[#d4af37]">{itinerary.days?.length || 0} Enchanting Days</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex-1 min-w-[200px]">
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Destinations</p>
              <p className="text-2xl font-serif text-[#d4af37] truncate">{destinations.join(' — ') || 'Custom Traverse'}</p>
            </div>
          </motion.div>

          {/* INTRO DESCRIPTION (MINIMIZED) */}
          {itinerary.description && (
             <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="max-w-3xl">
                <div className="border-l-2 border-[#d4af37]/30 pl-8">
                  <p className="text-xl md:text-2xl font-serif italic text-white/80 leading-relaxed font-light">
                    {itinerary.description}
                  </p>
                </div>
             </motion.div>
          )}

          {/* HORIZONTAL ACCOMMODATION CARDS (Replacing Table) */}
          {itinerary.days?.some((d: any) => d.events?.some((e: any) => e.type === 'accommodation')) && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="font-handwriting text-5xl md:text-7xl text-white mb-2">Sanctuaries & Stays</h2>
                  <p className="text-[#d4af37] font-serif uppercase tracking-[0.2em] text-[10px]">Your refined accommodations</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto pb-10 gap-6 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:-mx-12 md:px-12">
                {itinerary.days?.map((day: any) => day.events?.filter((e: any) => e.type === 'accommodation').map((ev: any, idx: number) => (
                  <motion.div 
                    whileHover={{ y: -10 }}
                    key={ev.id ?? `day-${day.dayNumber}-accom-${idx}`} 
                    className="snap-center shrink-0 w-[85vw] md:w-[400px] bg-white/5 border border-white/10 rounded-[30px] p-8 backdrop-blur-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Hotel className="w-24 h-24 text-white" /></div>
                    
                    <div className="relative z-10 box-border h-full flex flex-col justify-between">
                      <div>
                        <span className="inline-block bg-[#d4af37]/20 text-[#d4af37] font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                           Day {day.dayNumber}
                        </span>
                        <h3 className="font-serif text-3xl text-white mb-4 leading-tight">{ev.metadata?.hotelName || ev.title}</h3>
                        <p className="font-handwriting text-2xl text-white/60 mb-8">{ev.metadata?.roomType || 'Standard Comfort'}</p>
                      </div>
                      
                      <div className="space-y-4 pt-6 border-t border-white/10 mt-auto">
                        {ev.metadata?.mealPlan && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Utensils className="w-4 h-4 text-white/50" /></div>
                            <span className="text-white/80 font-medium text-sm">{ev.metadata.mealPlan}</span>
                          </div>
                        )}
                        {(ev.metadata?.checkInDate || ev.metadata?.checkInTime) && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><LogIn className="w-4 h-4 text-white/50" /></div>
                            <span className="text-white/80 font-medium text-sm">{ev.metadata.checkInDate} {ev.metadata.checkInTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )))}
              </div>
            </motion.div>
          )}

          {/* THE CHRONICLE (Days Timeline with Unfold) */}
          <div className="relative pt-20">
            <div className="mb-24">
              <h2 className="font-handwriting text-6xl md:text-8xl text-white mb-2">The Chronicle</h2>
              <div className="w-24 h-px bg-[#d4af37]/50 mt-6" />
            </div>

            <div className="space-y-16">
              {itinerary.days?.map((day: any, idx: number) => {
                const eventImages = day.events?.filter((e: any) => e.imageUrl).map((e:any) => e.imageUrl) || [];
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    key={day.dayNumber}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start"
                  >
                    {/* Day Number Marker */}
                    <div className="lg:col-span-2 pt-4">
                      <div className="font-serif text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-bold mb-2">Chapter</div>
                      <div className="font-black text-6xl text-white/20 leading-none">0{day.dayNumber}</div>
                    </div>

                    {/* Content Block */}
                    <div className="lg:col-span-10 bg-white/5 backdrop-blur-sm border border-white/5 rounded-[40px] p-8 md:p-12">
                      <h3 className="font-handwriting text-4xl md:text-5xl text-white mb-6">{day.title || 'In search of wonder'}</h3>
                      
                      {day.destination?.name && (
                         <div className="flex items-center gap-2 text-[#d4af37] font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
                           <MapPin className="w-3 h-3" /> {day.destination.name}
                         </div>
                      )}

                      {eventImages.length > 0 && (
                        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-8 relative group">
                           <img src={eventImages[0]} alt="" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 filter grayscale-[0.2]" />
                        </div>
                      )}

                      {/* Unfoldable Core Content */}
                      <UnfoldableContent>
                        {day.description && (
                          <p className="text-white/70 text-lg md:text-xl font-serif italic leading-relaxed mb-10">
                            {day.description}
                          </p>
                        )}
                        
                        {day.events?.length > 0 && (
                          <div className="space-y-8 pl-4 border-l border-white/10">
                            {day.events.map((ev: any, evIdx: number) => { 
                              const Icon = EVENT_ICONS[ev.type] || MapPin; 
                              if (ev.type === 'accommodation') return null; // We showed hotels above
                              
                              return (
                                <motion.div 
                                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: evIdx * 0.1 }}
                                  key={ev.id ?? evIdx} className="relative pl-8"
                                >
                                  <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-[#111820] border border-white/20 flex items-center justify-center">
                                    <Icon className="w-3 h-3 text-[#d4af37]" />
                                  </div>
                                  <h4 className="text-lg font-bold text-white tracking-tight uppercase">{ev.title}</h4>
                                  <div className="flex items-center gap-4 mt-2">
                                     {ev.startTime && <span className="font-serif text-[#d4af37] text-sm">{ev.startTime}{ev.endTime && ` — ${ev.endTime}`}</span>}
                                     {ev.metadata?.vehicleType && <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white/50">{ev.metadata.vehicleType}</span>}
                                  </div>
                                  {ev.description && <p className="text-sm text-white/60 mt-3 font-medium leading-relaxed">{ev.description}</p>}
                                </motion.div>
                              ); 
                            })}
                          </div>
                        )}
                      </UnfoldableContent>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* STAGGERED GALLERY */}
          {itinerary.galleryImages?.length > 0 && (
             <div className="pt-20">
                <div className="text-center mb-16">
                  <h2 className="font-handwriting text-6xl text-white mb-4">Visual Essence</h2>
                  <p className="text-[#d4af37] font-serif uppercase tracking-[0.2em] text-[10px]">Glimpses of what awaits</p>
                </div>
                
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {itinerary.galleryImages.map((img: any, idx: number) => (
                    <motion.div 
                      key={img.id ?? idx}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.8, delay: (idx % 3) * 0.2 }}
                      className="break-inside-avoid relative group rounded-[30px] overflow-hidden"
                    >
                      <div className="relative w-full h-full">
                        <img src={img.imageUrl} alt={img.caption || ''} className="w-full h-auto object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03] grayscale-[0.3] hover:grayscale-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06090a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                      {img.caption && (
                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">{img.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
             </div>
          )}

          {/* GLOWING PRICING SHEET */}
          {itinerary.perPersonCost && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} 
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
              viewport={{ once: true }} 
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[60px] p-12 md:p-24 text-center overflow-hidden border border-[#d4af37]/20"
            >
              <div className="absolute inset-0 bg-[#0a0f12] z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-[#0a0f12]/0 to-[#0a0f12] z-0" />
              
              <div className="relative z-10">
                <span className="font-handwriting text-4xl text-[#d4af37] block mb-8">The Investment</span>
                <p className="text-7xl md:text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                  {(() => {
                    try {
                      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.perPersonCost));
                    } catch (e) {
                      return `${itinerary.currency || 'INR'} ${Number(itinerary.perPersonCost).toLocaleString('en-IN')}`;
                    }
                  })()}
                </p>
                <p className="text-[10px] text-white/50 mt-6 font-bold uppercase tracking-[0.5em]">Extracted Per Explorer</p>
                
                {itinerary.totalCost && (
                  <div className="mt-16 pt-12 border-t border-white/5 w-full max-w-lg mx-auto flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">Total Voyage Value</span>
                    <span className="text-3xl font-serif text-white/90 italic">
                      {(() => {
                        try {
                          return new Intl.NumberFormat('en-IN', { style: 'currency', currency: itinerary.currency || 'INR', maximumFractionDigits: 0 }).format(Number(itinerary.totalCost));
                        } catch (e) {
                          return `${itinerary.currency || 'INR'} ${Number(itinerary.totalCost).toLocaleString('en-IN')}`;
                        }
                      })()}
                    </span>
                    <p className="text-[10px] text-white/20 mt-4 font-bold tracking-[0.2em] uppercase">
                      Curated for {itinerary.adults} Adults {itinerary.children > 0 && `& ${itinerary.children} Children`}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REFINED POLICIES */}
          {(itinerary.inclusionsHtml || itinerary.exclusionsHtml || itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
             <div className="pt-20">
                <div className="mb-16">
                  <h2 className="font-handwriting text-5xl md:text-7xl text-white mb-2">Provisions</h2>
                  <div className="h-px w-20 bg-[#d4af37]/30 mt-6" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {itinerary.inclusionsHtml && (
                    <div className="bg-white/5 border border-white/5 p-10 rounded-[40px] backdrop-blur-sm">
                      <h4 className="font-serif text-xl text-[#d4af37] mb-6 flex items-center gap-3"><CheckCircle className="w-5 h-5" /> Included Essence</h4>
                      <div className="text-sm text-white/70 leading-[2] pl-2 prose prose-invert prose-p:font-light font-sans max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.inclusionsHtml) }} />
                    </div>
                  )}
                  {itinerary.exclusionsHtml && (
                    <div className="bg-white/5 border border-white/5 p-10 rounded-[40px] backdrop-blur-sm">
                      <h4 className="font-serif text-xl text-[#d4af37]/60 mb-6 flex items-center gap-3"><XCircle className="w-5 h-5" /> Independent Obligations</h4>
                      <div className="text-sm text-white/50 leading-[2] pl-2 prose prose-invert prose-p:font-light font-sans max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.exclusionsHtml) }} />
                    </div>
                  )}
                </div>

                {(itinerary.paymentPolicyHtml || itinerary.cancellationPolicyHtml || itinerary.termsHtml) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
                    {itinerary.paymentPolicyHtml && (
                      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/5 transition-all duration-500">
                        <div className="flex items-center gap-3 text-white/40 mb-6"><CreditCard className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Financial Protocol</span></div>
                        <div className="text-xs text-white/60 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.paymentPolicyHtml) }} />
                      </div>
                    )}
                    {itinerary.cancellationPolicyHtml && (
                      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/5 transition-all duration-500">
                        <div className="flex items-center gap-3 text-white/40 mb-6"><AlertTriangle className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Amendment Policy</span></div>
                        <div className="text-xs text-white/60 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.cancellationPolicyHtml) }} />
                      </div>
                    )}
                    {itinerary.termsHtml && (
                      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/5 transition-all duration-500">
                        <div className="flex items-center gap-3 text-white/40 mb-6"><Shield className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Formal Terms</span></div>
                        <div className="text-xs text-white/60 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: sanitize(itinerary.termsHtml) }} />
                      </div>
                    )}
                  </div>
                )}
             </div>
          )}

          {/* SIGNATURE */}
          <div className="text-center pt-32 pb-12">
            <Compass className="w-8 h-8 text-[#d4af37]/20 mx-auto mb-6" />
            <p className="font-handwriting text-3xl md:text-5xl text-white/80 italic">Curated with untethered passion.</p>
            <p className="text-[9px] text-[#d4af37]/50 font-black uppercase tracking-[0.5em] mt-8">Imagica Holidays Elite</p>
          </div>

        </div>
      </div>
    </>
  );
}
