'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Navigation, Utensils, 
  Calendar, ChevronRight, User, PhoneCall,
  Bed, Car, ShieldAlert, MessageSquare, Plus, CheckCircle2, Map,
  CreditCard, Download, Train, Plane, FileText, IndianRupee, Loader2
} from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function GuestWebApp() {
  const { tripId } = useParams();
  const router = useRouter();
  
  // ── Live data state ──────────────────────────────────────
  const [trip, setTrip] = useState<any>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);

  useEffect(() => {
    const tourCode = tripId as string;
    if (!tourCode) return;

    // Check if user came through the login flow
    const storedTourCode = sessionStorage.getItem('guest_tourCode');
    if (!storedTourCode) {
      // No session at all — user navigated directly without logging in
      router.replace('/guest/login');
      return;
    }

    fetch(`${API}/public/guest/${tourCode}`)
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.success) setTrip(data.data);
        else {
          // API returned success:false but user IS authenticated — show error, don't redirect
          toast.error('Trip data could not be loaded. Please contact support.');
        }
      })
      .catch((err) => {
        console.error('Guest portal fetch error:', err);
        toast.error('Failed to load trip data. Please try again.');
      })
      .finally(() => setLoadingTrip(false));
  }, [tripId, router]);

  // ── Sheet drag state ──────────────────────────────────────
  const sheetHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const y = useMotionValue(0);
  const controls = useAnimation();
  const [sheetState, setSheetState] = useState<'collapsed' | 'expanded'>('collapsed');
  
  const collapsedY = sheetHeight * 0.45;
  const expandedY = 40;
  const mapY = sheetHeight * 0.85;
  
  const [activeView, setActiveView] = useState<'home' | 'itinerary' | 'support' | 'finance'>('home');
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [transitMode, setTransitMode] = useState<'train' | 'flight'>('flight');

  const transportName = trip?.currentDay?.transport?.serviceName;
  const isAirportOrRailway = transportName && (
    /airport|bagdogra|ixb|njp|railway|station/i.test(transportName)
  );
  
  const mapQuery = isAirportOrRailway 
    ? `${transportName}, ${trip?.destination || 'Sikkim'}`
    : (trip?.currentDay?.hotel 
      ? `${trip.currentDay.hotel}, ${trip?.destination || 'Sikkim'}` 
      : (trip?.destination || 'Sikkim')
    );

  useEffect(() => {
    controls.start({ y: collapsedY, transition: { type: 'spring', damping: 25, stiffness: 200 } });
  }, [controls, collapsedY]);



  const handleDragEnd = (event: any, info: any) => {
    const currentY = y.get();
    const velocityY = info.velocity.y;
    
    if (velocityY > 500 || currentY > collapsedY + 100) {
      setSheetState('collapsed');
      setIsTracking(true);
      controls.start({ y: mapY, transition: { type: 'spring', damping: 25, stiffness: 200 } });
    } else if (velocityY < -500 || (velocityY <= 0 && currentY < collapsedY * 0.7)) {
      setSheetState('expanded');
      setIsTracking(false);
      controls.start({ y: expandedY, transition: { type: 'spring', damping: 25, stiffness: 200 } });
    } else {
      setSheetState('collapsed');
      setIsTracking(false);
      controls.start({ y: collapsedY, transition: { type: 'spring', damping: 25, stiffness: 200 } });
    }
  };

  const trackDriver = () => {
    setIsTracking(true);
    controls.start({ y: mapY, transition: { type: 'spring', damping: 20, stiffness: 150 } });
  };

  const searchBarOpacity = useTransform(y, [expandedY, collapsedY], [1, 0.9]);
  const searchBarY = useTransform(y, [expandedY, collapsedY], [0, -10]);
  const bgBlur = useTransform(y, [expandedY, collapsedY, mapY], [8, 0, 0]);

  // ── Derived live data (fallback to demo if API not ready) ──
  const driver = trip?.currentDay?.driver;
  const hotel = trip?.currentDay?.hotel;
  const balance = trip?.finance?.balanceDue ?? 5000;
  const guestName = trip?.guestName ?? 'Traveller';
  const destination = trip?.destination ?? 'Your Destination';

  const handleSOS = async () => {
    try {
      await fetch(`${API}/public/guest/${tripId}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Emergency help needed' }),
      });
      toast.error('🚨 SOS Sent! Imagica Holidays ops team & your driver have been alerted.', { duration: 6000 });
    } catch {
      toast.error('SOS failed to send. Please call directly.');
    }
    setShowSOSModal(false);
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-sm font-semibold text-white/60">Loading your trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans antialiased text-gray-900 md:flex md:items-center md:justify-center">
      
      <div className="relative w-full h-[100vh] md:max-w-[420px] md:h-[880px] md:rounded-[44px] md:border-8 md:border-black overflow-hidden bg-white shadow-2xl">
        
        {/* BACKGROUND MAP/IMAGE LAYER */}
        <motion.div 
          className="absolute inset-0 z-0 bg-gray-200"
          style={{ filter: `blur(${bgBlur}px)` }}
        >
          <AnimatePresence mode="wait">
            {!isTracking ? (
              <motion.img 
                key="scenery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src="/pelling_sikkim_scenery.jpg" 
                alt="Pelling" 
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full bg-[#E5E9EA] relative overflow-hidden"
              >
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(mapQuery)}`}
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  />
                )}
                {/* Overlay driver info banner over the map */}
                <div className="absolute top-[80px] left-4 right-4 bg-gray-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                      <Car className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-200">
                        {isAirportOrRailway ? 'Airport/Station Transfer' : 'Live Driver Tracking'}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{trip?.currentDay?.driver?.name || 'Assigned Driver'} • {trip?.currentDay?.driver?.vehicleNo || 'Sikkim Sightseeing'}</p>
                    </div>
                  </div>
                  <a href={`tel:+91${trip?.currentDay?.driver?.phone || ''}`} className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors">
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/30 pointer-events-none" />
        </motion.div>

        {/* NATIVE HEADER */}
        <header className="absolute top-0 left-0 right-0 z-10 px-5 pt-12 pb-4 flex justify-between items-start pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg pointer-events-auto border border-white/20">
            <img 
                src="/logo.jpg" 
                alt="Imagica Holidays" 
                className="h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
            />
            <span className="hidden font-serif font-bold text-lg tracking-wider text-gray-900 mt-1">
              <span className="text-[#3B82F6]">I</span>
              <span className="text-[#8B5CF6]">M</span>
              <span className="text-[#F97316]">A</span>
              <span className="text-[#EF4444]">G</span>
              <span className="text-[#F97316]">I</span>
              <span className="text-[#8B5CF6]">C</span>
              <span className="text-[#3B82F6]">A</span>
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                 setIsTracking(false);
                 controls.start({ y: collapsedY, transition: { type: 'spring', damping: 25, stiffness: 200 } });
              }}
              className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-700 pointer-events-auto active:scale-90 transition-transform"
            >
              <Map className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowSOSModal(true)}
              className="w-11 h-11 bg-red-50 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-red-500 pointer-events-auto active:scale-90 transition-transform border border-red-100"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* CONTEXTUAL LIVE PILL */}
        <motion.div 
          style={{ opacity: searchBarOpacity, y: searchBarY }}
          className="absolute top-[110px] left-5 right-5 z-10"
        >
          <div className="bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl border border-white/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <span className="absolute w-full h-full rounded-full bg-blue-400 animate-ping opacity-40" />
                {transitMode === 'flight' ? (
                  <Plane className="w-4 h-4 text-blue-600" />
                ) : (
                  <Train className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Next Arrival</h3>
                <p className="text-sm font-semibold text-blue-600 mt-0.5">Pickup at Bagdogra Airport</p>
              </div>
            </div>
            <a href="tel:+919876543210" className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all">
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* DRAGGABLE BOTTOM SHEET */}
        <motion.div
          drag="y"
          dragConstraints={{ top: expandedY, bottom: mapY }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ y }}
          className="absolute left-0 right-0 bottom-[-100vh] h-[200vh] bg-[#F5F7FA] rounded-t-[36px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-20 overflow-hidden flex flex-col touch-none"
        >
          {/* WATERMARK BACKGROUND (Inside Sheet) */}
          <div className="absolute inset-0 z-0 flex items-start pt-32 justify-center pointer-events-none overflow-hidden mix-blend-multiply">
            <img 
              src="/logo.jpg" 
              alt="Watermark" 
              className="w-80 opacity-[0.04] grayscale rotate-12 scale-150"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          </div>

          {/* Sheet Handle */}
          <div className="w-full flex justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing relative z-10">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Nav Tabs Inside Sheet */}
          <div className="px-3 pb-3 flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-none relative z-10">
            {['home', 'itinerary', 'finance', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveView(tab as any);
                  if (y.get() > collapsedY) {
                    controls.start({ y: collapsedY, transition: { type: 'spring' } });
                  }
                }}
                className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-colors relative ${
                  activeView === tab ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {activeView === tab && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-md shadow-blue-600/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div 
            className="flex-1 overflow-y-auto px-5 pt-4 pb-[50vh] scrollbar-none"
            onPointerDownCapture={(e) => {
              if (e.currentTarget.scrollTop > 0) e.stopPropagation();
            }}
          >
            <AnimatePresence mode="wait">
              
              {/* HOME VIEW */}
              {activeView === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Driver Card */}
                  <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${driver?.name || 'driver'}`} alt="Driver" className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 shadow-inner" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Driver</span>
                        <h3 className="text-base font-bold text-gray-900 mt-0.5">{driver?.name || 'Driver Not Yet Assigned'}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-blue-500" /> {driver ? `${driver.vehicleName} • ${driver.vehicleNo}` : 'Contact Imagica Holidays'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                      <button 
                        onClick={trackDriver}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 py-3 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                        <Map className="w-4 h-4" /> Live Map Tracking
                      </button>
                      <a href={driver?.phone ? `tel:+91${driver.phone}` : 'tel:+919876543210'} className="flex-1 bg-blue-50 hover:bg-blue-100 py-3 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-2 transition-transform active:scale-95">
                        <PhoneCall className="w-4 h-4" /> Call Driver
                      </a>
                    </div>
                  </div>

                  {/* Premium Hotel Card (MakeMyTrip Style) */}
                  <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="relative h-44 w-full">
                      <img src="https://images.unsplash.com/photo-1542314831-c6a4d1409a50?auto=format&fit=crop&q=80&w=1000" alt="Hotel" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm border border-white/20">
                        <span className="text-[#F59E0B] text-sm">★</span>
                        <span className="text-xs font-bold text-gray-900">4.5</span>
                        <span className="text-[10px] text-gray-500 font-semibold">(120)</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md text-white font-bold px-3 py-1.5 rounded-xl text-center border border-white/20 shadow-sm">
                        <span className="text-[9px] block opacity-70 uppercase tracking-widest mb-0.5">Room</span>
                        <span className="text-sm">502</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 block">Current Stay</span>
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg tracking-tight">{hotel || 'Hotel Not Yet Assigned'}</h3>
                        <p className="text-xs text-gray-300 mt-1.5 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" /> {trip?.destination || 'Sikkim'} • 
                          {hotel ? (
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotel + ', ' + (trip?.destination || 'Sikkim'))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline decoration-gray-400 cursor-pointer hover:text-white transition-colors"
                            >
                              Get Directions
                            </a>
                          ) : (
                            <span className="text-gray-400">View Map</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white">
                      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-none pb-1">
                        <span className="flex-none bg-green-50 border border-green-100/50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-green-700 flex items-center gap-1"><span className="text-green-500">✓</span> Free Breakfast</span>
                        <span className="flex-none bg-blue-50 border border-blue-100/50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-700 flex items-center gap-1"><span className="text-blue-500">✓</span> Free WiFi</span>
                        <span className="flex-none bg-purple-50 border border-purple-100/50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-purple-700 flex items-center gap-1"><span className="text-purple-500">✓</span> Valley View</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowServiceMenu(true)}
                          className="flex-1 bg-orange-50 hover:bg-orange-100 py-3.5 rounded-xl text-xs font-bold text-orange-700 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm border border-orange-100/50"
                        >
                          <Utensils className="w-4 h-4" /> Room Service
                        </button>
                        <button 
                          onClick={() => toast.success("Housekeeping requested.")}
                          className="flex-1 bg-purple-50 hover:bg-purple-100 py-3.5 rounded-xl text-xs font-bold text-purple-700 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm border border-purple-100/50"
                        >
                          <Bed className="w-4 h-4" /> Housekeeping
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ITINERARY VIEW (With Vouchers) */}
              {activeView === 'itinerary' && (
                <motion.div
                  key="itinerary"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trip Timeline</h2>
                    <button onClick={() => toast.success("Downloading all vouchers...")} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Vouchers
                    </button>
                  </div>
                  

                  {/* Itinerary days from live API */}
                  <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-6">
                    {(trip?.itinerary || []).length > 0 ? (
                      (trip.itinerary as any[]).map((day: any) => (
                        <div key={day.dayNumber} className="relative">
                          <div className="absolute -left-[33px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#F5F7FA]" />
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{day.date}</span>
                            <h3 className="font-bold text-gray-900 text-base mt-1">{day.title}</h3>
                            {day.hotel && (
                              <p className="text-xs text-orange-600 font-semibold mt-1.5 flex items-center gap-1">
                                🏨 {day.hotel}
                              </p>
                            )}
                            {day.description && <p className="text-xs text-gray-500 mt-2">{day.description}</p>}
                            {(day.events || []).map((ev: any, i: number) => (
                              <p key={i} className="text-xs text-gray-600 mt-1.5 flex items-start gap-1.5">
                                <span className="text-gray-400 mt-0.5">•</span> {ev.title}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback single day card
                      <div className="relative">
                        <div className="absolute -left-[33px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#F5F7FA]" />
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Today, 09:00 AM</span>
                          <h3 className="font-bold text-gray-900 text-base mt-1">Driver Pickup</h3>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            {transitMode === 'flight' ? <Plane className="w-3 h-3" /> : <Train className="w-3 h-3" />}
                            {transitMode === 'flight' ? 'Bagdogra Airport' : 'NJP Railway Station'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* FINANCE / INVOICE VIEW */}
              {activeView === 'finance' && (
                <motion.div
                  key="finance"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Financials</h2>
                  
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Balance</span>
                          <h3 className="text-2xl font-bold text-gray-900 mt-0.5">₹ {Number(balance).toLocaleString('en-IN')}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => toast.info("Redirecting to Payment Gateway...")} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      <CreditCard className="w-5 h-5" /> Pay Pending Balance
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mt-6 mb-2">Invoices</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Advance Payment Invoice</h4>
                          <p className="text-xs text-gray-500">Paid on 01 Jun 2026</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success("Downloading Invoice...")} className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SUPPORT VIEW */}
              {activeView === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Concierge</h2>
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">WhatsApp Bridge</h3>
                    <p className="text-xs text-gray-500 mt-2 mb-6 px-4">
                      Chat directly with your driver or the hotel front desk via WhatsApp. Everything is synced.
                    </p>
                    <button className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-green-500/30">
                      <MessageSquare className="w-5 h-5" /> Open WhatsApp
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        {/* SOS Modal */}
        <AnimatePresence>
          {showSOSModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-40 flex items-end justify-center"
            >
              <motion.div 
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full bg-white rounded-t-[32px] p-6 pb-10 space-y-4 max-w-[420px]"
              >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Hub</h3>
                
                <div className="space-y-3">
                  <a href="tel:+919999999999" className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-red-100">
                    <Phone className="w-5 h-5" /> Imagica Escalation Line
                  </a>
                  <a href="tel:+919876543210" className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-gray-200">
                    <Car className="w-5 h-5" /> Call Driver (Ramesh)
                  </a>
                </div>

                <button 
                  onClick={() => setShowSOSModal(false)}
                  className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl mt-4 active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room Service / Hotel Action Modal */}
        <AnimatePresence>
          {showServiceMenu && (
             <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-40 flex items-end justify-center"
           >
             <motion.div 
               initial={{ y: 300 }}
               animate={{ y: 0 }}
               exit={{ y: 300 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full bg-white rounded-t-[32px] p-6 pb-10 space-y-4 max-w-[420px]"
             >
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-900 mb-2">Request Room Service</h3>
               
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { name: 'Water Bottles', icon: Utensils, color: 'text-blue-500', bg: 'bg-blue-50' },
                   { name: 'Extra Towels', icon: Bed, color: 'text-purple-500', bg: 'bg-purple-50' },
                   { name: 'Tea / Coffee', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
                   { name: 'Other Item', icon: Plus, color: 'text-gray-500', bg: 'bg-gray-100' },
                 ].map((item) => (
                   <button 
                     key={item.name}
                     onClick={() => {
                        setShowServiceMenu(false);
                        toast.success(`${item.name} requested! Hotel front desk notified.`);
                     }}
                     className={`${item.bg} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform border border-transparent hover:border-gray-200`}
                   >
                     <item.icon className={`w-6 h-6 ${item.color}`} />
                     <span className="text-xs font-bold text-gray-800">{item.name}</span>
                   </button>
                 ))}
               </div>

               <button 
                 onClick={() => setShowServiceMenu(false)}
                 className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl mt-4 active:scale-95 transition-transform"
               >
                 Cancel
               </button>
             </motion.div>
           </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
