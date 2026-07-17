'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Navigation, Utensils, 
  Calendar, ChevronRight, User, PhoneCall, Phone,
  Bed, Car, ShieldAlert, MessageSquare, Plus, CheckCircle2, Map,
  CreditCard, Download, Train, Plane, FileText, IndianRupee, Loader2,
  RefreshCw, Send, Check
} from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api.imagicaholidays.com/api/v1'
    : 'http://localhost:3001/api/v1');

export default function GuestWebApp() {
  const { tripId } = useParams();
  const router = useRouter();
  
  // ── Live data state ──────────────────────────────────────
  const [trip, setTrip] = useState<any>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);

  // Live Driver Tracking state
  const [driverTracking, setDriverTracking] = useState<any>({ active: false, data: null });
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInst = useRef<any>(null);
  const driverMarkerInst = useRef<any>(null);
  const destMarkerInst = useRef<any>(null);
  const routePolylineInst = useRef<any>(null);

  // Hotel Request form & list state
  const [hotelRequests, setHotelRequests] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [requestType, setRequestType] = useState('Toiletries');
  const [notes, setNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Load guest trip data
  const loadTripData = () => {
    const tourCode = tripId as string;
    if (!tourCode) return;

    fetch(`${API}/public/guest/${tourCode}`)
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.success) {
          setTrip(data.data);
          // Set default hotel from current day if available
          if (data.data.currentDay?.hotel) {
            setSelectedHotel(data.data.currentDay.hotel);
          }
        } else {
          toast.error('Trip data could not be loaded. Please contact support.');
        }
      })
      .catch((err) => {
        console.error('Guest portal fetch error:', err);
        toast.error('Failed to load trip data. Please try again.');
      })
      .finally(() => setLoadingTrip(false));
  };

  // Load submitted hotel requests
  const loadHotelRequests = () => {
    const tourCode = tripId as string;
    if (!tourCode) return;

    fetch(`${API}/public/guest/${tourCode}/hotel-requests`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setHotelRequests(res.data || []);
        }
      })
      .catch(err => console.error('Failed to load requests', err));
  };

  // Poll driver location
  const pollDriverLocation = () => {
    const tourCode = tripId as string;
    if (!tourCode) return;

    fetch(`${API}/public/guest/${tourCode}/driver-location`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setDriverTracking(res);
        }
      })
      .catch(err => console.error('Failed to poll driver location', err));
  };

  useEffect(() => {
    const tourCode = tripId as string;
    if (!tourCode) return;

    // Check session auth
    const storedTourCode = sessionStorage.getItem('guest_tourCode');
    if (!storedTourCode) {
      router.replace('/guest/login');
      return;
    }

    loadTripData();
    loadHotelRequests();
    pollDriverLocation();

    // Set polling intervals
    const driverInterval = setInterval(pollDriverLocation, 10000);
    const requestsInterval = setInterval(loadHotelRequests, 12000);

    return () => {
      clearInterval(driverInterval);
      clearInterval(requestsInterval);
    };
  }, [tripId, router]);

  // Leaflet CDN Dynamic Loader
  useEffect(() => {
    if (mapLoaded) return;

    // Load styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Update/Render Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Default positioning coordinates (e.g. Siliguri/Bagdogra area)
    let lat = 26.7271;
    let lng = 88.3953;

    if (driverTracking.active && driverTracking.data?.lat) {
      lat = driverTracking.data.lat;
      lng = driverTracking.data.lng;
    }

    if (!leafletMapInst.current) {
      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      leafletMapInst.current = map;
    }

    const map = leafletMapInst.current;

    // Update marker for Driver
    if (driverTracking.active && driverTracking.data?.lat) {
      const driverPos = [driverTracking.data.lat, driverTracking.data.lng];

      // Custom animated car marker icon
      const carIcon = L.divIcon({
        className: 'custom-car-marker',
        html: `
          <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white transform rotate-45 scale-110 animate-pulse">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 22l10-6 10 6L12 2z"></path>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!driverMarkerInst.current) {
        driverMarkerInst.current = L.marker(driverPos, { icon: carIcon }).addTo(map);
      } else {
        driverMarkerInst.current.setLatLng(driverPos);
      }

      // Draw route/dotted line to drop-off/hotel if we have general hotel location coordinates
      // Mock hotel coordinates slightly offset for visual appeal
      const hotelPos = [driverTracking.data.lat + 0.015, driverTracking.data.lng + 0.015];
      
      const hotelIcon = L.divIcon({
        className: 'custom-hotel-marker',
        html: `
          <div class="w-7 h-7 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
            🏨
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (!destMarkerInst.current) {
        destMarkerInst.current = L.marker(hotelPos, { icon: hotelIcon }).addTo(map);
      }

      // Polyline route
      if (!routePolylineInst.current) {
        routePolylineInst.current = L.polyline([driverPos, hotelPos], {
          color: '#3B82F6',
          weight: 4,
          dashArray: '5, 8',
          opacity: 0.8
        }).addTo(map);
      } else {
        routePolylineInst.current.setLatLngs([driverPos, hotelPos]);
      }

      // Fit bounds
      const bounds = L.latLngBounds([driverPos, hotelPos]);
      map.fitBounds(bounds, { padding: [50, 50] });

    } else {
      // Driver not active — place single marker on destination city
      const staticPos = [26.7271, 88.3953]; // Fallback coordinates
      map.setView(staticPos, 12);

      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div class="w-7 h-7 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (!destMarkerInst.current) {
        destMarkerInst.current = L.marker(staticPos, { icon: destIcon }).addTo(map);
      } else {
        destMarkerInst.current.setLatLng(staticPos);
      }

      if (driverMarkerInst.current) {
        map.removeLayer(driverMarkerInst.current);
        driverMarkerInst.current = null;
      }
      if (routePolylineInst.current) {
        map.removeLayer(routePolylineInst.current);
        routePolylineInst.current = null;
      }
    }
  }, [mapLoaded, driverTracking]);

  // Submit Hotel Service Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const tourCode = tripId as string;
    if (!tourCode) return;

    if (!selectedHotel || !roomNo || !notes) {
      toast.error('Please complete all form fields.');
      return;
    }

    try {
      setSubmittingRequest(true);
      const res = await fetch(`${API}/public/guest/${tourCode}/hotel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: selectedHotel,
          roomNo,
          requestType,
          notes,
          guestName: trip?.guestName || 'Guest'
        })
      }).then(r => r.json());

      if (res.success) {
        toast.success(`Request for ${requestType} submitted to hotel front desk!`);
        setRoomNo('');
        setNotes('');
        loadHotelRequests();
        setShowServiceMenu(false);
      } else {
        toast.error(res.message || 'Submission failed');
      }
    } catch (err) {
      toast.error('Network error. Failed to submit request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Extract unique hotels from itinerary to fill dropdown
  const uniqueHotels = Array.from(new Set(
    (trip?.itinerary || [])
      .map((day: any) => day.hotel)
      .filter((h: any) => !!h)
  ));

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

  // Derived variables
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
      
      <div className="relative w-full h-[100vh] md:max-w-[420px] md:h-[880px] md:rounded-[44px] md:border-8 md:border-black overflow-hidden bg-slate-950 shadow-2xl">
        
        {/* LEAFLET MAP BACKGROUND LAYER */}
        <motion.div 
          className="absolute inset-0 z-0 bg-slate-900"
          style={{ filter: `blur(${bgBlur}px)` }}
        >
          <div ref={mapRef} className="w-full h-full z-0" />
          
          {/* Map Live Header Tracker Overlay */}
          {driverTracking.active && (
            <div className="absolute top-[90px] left-4 right-4 bg-blue-600/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-blue-500/20 z-10 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white">
                  <Car className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Driver Heading to You</h4>
                  <p className="text-[10px] text-blue-100 mt-0.5">ETA: {driverTracking.data.etaMinutes || 15} Mins • Live Mapping</p>
                </div>
              </div>
              <a href={`tel:+91${driverTracking.data.driver.phone}`} className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-transform active:scale-90">
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          )}

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
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </header>

        {/* DRAGGABLE BOTTOM SHEET */}
        <motion.div
          drag="y"
          dragConstraints={{ top: expandedY, bottom: mapY }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ y }}
          className="absolute left-0 right-0 bottom-[-100vh] h-[200vh] bg-slate-900 rounded-t-[36px] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-20 overflow-hidden flex flex-col touch-none border-t border-white/5"
        >
          {/* Sheet Handle */}
          <div className="w-full flex justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing relative z-10">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
          </div>

          {/* Nav Tabs Inside Sheet */}
          <div className="px-3 pb-3 flex gap-1 border-b border-white/5 overflow-x-auto scrollbar-none relative z-10">
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
                  activeView === tab ? 'text-white' : 'text-gray-400 hover:text-white'
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
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${driver?.name || 'driver'}`} alt="Driver" className="w-14 h-14 rounded-full bg-blue-500/10 border-2 border-blue-500/20 shadow-inner" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Driver</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{driver?.name || 'Driver Not Yet Assigned'}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-blue-400" /> {driver ? `${driver.vehicleName} • ${driver.vehicleNo}` : 'Contact Imagica Holidays'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                      <button 
                        onClick={trackDriver}
                        className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Map className="w-4 h-4 text-blue-400" /> Live Map Tracking
                      </button>
                      <a href={driver?.phone ? `tel:+91${driver.phone}` : 'tel:+919876543210'} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-2 transition-transform active:scale-95">
                        <PhoneCall className="w-4 h-4 text-green-400" /> Call Driver
                      </a>
                    </div>
                  </div>

                  {/* Premium Hotel Card (MMT Style) */}
                  <div className="bg-white/5 backdrop-blur-md rounded-[24px] shadow-sm border border-white/5 overflow-hidden">
                    <div className="relative h-44 w-full">
                      <img src="https://images.unsplash.com/photo-1542314831-c6a4d1409a50?auto=format&fit=crop&q=80&w=1000" alt="Hotel" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm border border-white/10">
                        <span className="text-[#F59E0B] text-sm">★</span>
                        <span className="text-xs font-bold text-white">4.5</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur-md text-white font-bold px-3 py-1.5 rounded-xl text-center border border-white/10 shadow-sm animate-pulse">
                        <span className="text-[9px] block opacity-70 uppercase tracking-widest mb-0.5">Active</span>
                        <span className="text-xs">Stay</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 block">Current Stay</span>
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg tracking-tight">{hotel || 'Hotel Not Yet Assigned'}</h3>
                        <p className="text-xs text-gray-300 mt-1.5 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" /> {trip?.destination || 'Sikkim'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowServiceMenu(true)}
                          className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 py-3.5 rounded-xl text-xs font-bold text-orange-400 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-orange-500/30 cursor-pointer"
                        >
                          <Utensils className="w-4 h-4" /> Hotel Request Hub
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ITINERARY VIEW */}
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
                    <h2 className="text-2xl font-bold text-white tracking-tight">Trip Timeline</h2>
                    <button onClick={() => toast.success("Downloading vouchers...")} className="bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white/10">
                      <Download className="w-3.5 h-3.5 text-blue-400" /> Vouchers
                    </button>
                  </div>

                  <div className="relative border-l-2 border-gray-700 ml-4 pl-6 space-y-6">
                    {(trip?.itinerary || []).length > 0 ? (
                      (trip.itinerary as any[]).map((day: any) => (
                        <div key={day.dayNumber} className="relative">
                          <div className="absolute -left-[33px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900" />
                          <div className="bg-white/5 p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{day.date}</span>
                            <h3 className="font-bold text-white text-base mt-1">{day.title}</h3>
                            {day.hotel && (
                              <p className="text-xs text-orange-400 font-semibold mt-1.5 flex items-center gap-1">
                                🏨 {day.hotel}
                              </p>
                            )}
                            {day.description && <p className="text-xs text-gray-400 mt-2">{day.description}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="relative">
                        <div className="absolute -left-[33px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900" />
                        <div className="bg-white/5 p-4 rounded-2xl shadow-sm border border-white/5">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Day 1</span>
                          <h3 className="font-bold text-white text-base mt-1">Arrival & Hotel Check-in</h3>
                          <p className="text-xs text-gray-400 mt-2">Welcome to your Himalayan vacation!</p>
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
                  <h2 className="text-2xl font-bold text-white tracking-tight">Financials</h2>
                  
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center border border-red-500/20">
                          <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Balance</span>
                          <h3 className="text-2xl font-bold text-white mt-0.5">₹ {Number(balance).toLocaleString('en-IN')}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => toast.info("Redirecting to Payment Gateway...")} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-600/25 cursor-pointer">
                      <CreditCard className="w-5 h-5" /> Pay Balance
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-6 mb-2">Invoices</h3>
                  <div className="bg-white/5 rounded-2xl border border-white/5 divide-y divide-white/5">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Advance Payment Invoice</h4>
                          <p className="text-xs text-gray-400">Paid successfully</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success("Downloading Invoice...")} className="w-8 h-8 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors">
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
                  <h2 className="text-2xl font-bold text-white tracking-tight">Concierge Support</h2>
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-5 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <MessageSquare className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="font-bold text-lg text-white">WhatsApp Escalation</h3>
                    <p className="text-xs text-gray-400 mt-2 mb-6 px-4">
                      Chat directly with the Imagica Operations Desk via WhatsApp for rapid route changes or SOS support.
                    </p>
                    <button onClick={() => window.open('https://wa.me/919999988888')} className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-green-500/20 cursor-pointer">
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end justify-center"
            >
              <motion.div 
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full bg-slate-900 border-t border-white/10 rounded-t-[32px] p-6 pb-10 space-y-4 max-w-[420px]"
              >
                <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Emergency Hub</h3>
                
                <div className="space-y-3">
                  <button onClick={handleSOS} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/25">
                    🚨 Send SOS to Operations Team
                  </button>
                  <a href="tel:+919999988888" className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10">
                    <Phone className="w-5 h-5 text-blue-400" /> Imagica Escalation Line
                  </a>
                  {driver?.phone && (
                    <a href={`tel:+91${driver.phone}`} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10">
                      <Car className="w-5 h-5 text-orange-400" /> Call Driver ({driver.name})
                    </a>
                  )}
                </div>

                <button 
                  onClick={() => setShowSOSModal(false)}
                  className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl mt-4 active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOTEL SERVICE REQUEST HUB (Replaces simple room service menu) */}
        <AnimatePresence>
          {showServiceMenu && (
             <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end justify-center"
           >
             <motion.div 
               initial={{ y: 300 }}
               animate={{ y: 0 }}
               exit={{ y: 300 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full bg-slate-900 border-t border-white/10 rounded-t-[32px] p-6 pb-10 space-y-4 max-w-[420px] overflow-y-auto max-h-[85vh] scrollbar-none"
             >
               <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />
               <h3 className="text-xl font-bold text-white mb-1">Hotel Service Request Hub</h3>
               <p className="text-xs text-gray-400">Request services directly from your hotel front desk.</p>

               <form onSubmit={handleSubmitRequest} className="space-y-3.5 pt-2">
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Select Hotel</label>
                   <select 
                     value={selectedHotel}
                     onChange={(e) => setSelectedHotel(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                     required
                   >
                     <option value="" className="bg-slate-900 text-gray-400">-- Choose Hotel --</option>
                     {uniqueHotels.map((h: any) => (
                       <option key={h} value={h} className="bg-slate-900 text-white">{h}</option>
                     ))}
                   </select>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Room No.</label>
                     <input 
                       type="text" 
                       value={roomNo}
                       onChange={(e) => setRoomNo(e.target.value)}
                       placeholder="e.g. 302"
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                       required
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Request Type</label>
                     <select 
                       value={requestType}
                       onChange={(e) => setRequestType(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                       required
                     >
                       {['Toiletries', 'Housekeeping', 'In-Room Dining', 'Luggage Assistance', 'Maintenance', 'Other'].map(type => (
                         <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Items / Notes</label>
                   <textarea 
                     rows={2}
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="e.g. 2 water bottles and an extra towel please."
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                     required
                   />
                 </div>

                 <button 
                   type="submit" 
                   disabled={submittingRequest}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform disabled:opacity-50"
                 >
                   {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Request
                 </button>
               </form>

               {/* RECENT REQUESTS */}
               <div className="pt-4 border-t border-white/5 space-y-3">
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider">Your Active Requests ({hotelRequests.length})</h4>
                 {hotelRequests.length === 0 ? (
                   <p className="text-[10px] text-gray-500 italic">No request history found.</p>
                 ) : (
                   <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-none pr-1">
                     {hotelRequests.map((r: any) => (
                       <div key={r.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-start">
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-white">{r.requestType}</span>
                             <span className="text-[9px] text-gray-400">Room {r.roomNo}</span>
                           </div>
                           <p className="text-[10px] text-gray-400 mt-1">{r.notes}</p>
                         </div>
                         <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                           r.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                           r.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                           'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                         }`}>
                           {r.status}
                         </span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               <button 
                 onClick={() => setShowServiceMenu(false)}
                 className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl mt-4 active:scale-95 transition-transform"
               >
                 Close Hub
               </button>
             </motion.div>
           </motion.div>
           )}
        </AnimatePresence>

        {/* APPLE-STYLE FLOATING GLASS BOTTOM NAV */}
        <nav className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-3xl shadow-2xl flex justify-between items-center z-30 pointer-events-auto">
          <button onClick={() => setActiveView('home')} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'home' ? 'text-blue-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
            <Map className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">Trip Map</span>
          </button>
          
          <button onClick={() => setActiveView('itinerary')} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'itinerary' ? 'text-blue-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
            <Calendar className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">Itinerary</span>
          </button>

          <button onClick={() => setActiveView('finance')} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'finance' ? 'text-blue-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
            <IndianRupee className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">Finance</span>
          </button>

          <button onClick={() => setActiveView('support')} className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'support' ? 'text-blue-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
            <MessageSquare className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">Concierge</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
