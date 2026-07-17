'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, PhoneCall, CheckCircle2, User, Car, 
  IndianRupee, Plane, Train, MessageSquare, Clock, Loader2, LogOut,
  Navigation, Check, X, Compass, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api.imagicaholidays.com/api/v1'
    : 'http://localhost:3001/api/v1');

export default function DriverWebApp() {
  const { driverId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'trips' | 'earnings'>('trips');
  
  const [driver, setDriver] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>({ totalEarnings: 0, payoutReceived: 0, payoutPending: 0 });
  const [loading, setLoading] = useState(true);

  // Active tracking state
  const [activeRide, setActiveRide] = useState<any>(null);
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInst = useRef<any>(null);
  const markerInst = useRef<any>(null);

  // Load portal data
  const loadPortalData = () => {
    fetch(`${API}/public/driver/${driverId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setDriver(res.data.driver);
          const allTrips = res.data.trips || [];
          setTrips(allTrips);
          setSettlements(res.data.settlements || []);
          setFinancials(res.data.financials || { totalEarnings: 0, payoutReceived: 0, payoutPending: 0 });

          // Auto-resume active ride if backend says it has STARTED
          const running = allTrips.find((t: any) => t.rideStatus === 'STARTED');
          if (running) {
            setActiveRide(running);
          }
        }
      })
      .catch(() => toast.error('Failed to load driver portal data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!driverId) return;
    
    const authStr = localStorage.getItem('imagica_driver_auth');
    if (!authStr) {
      router.push('/driver/login');
      return;
    }
    const auth = JSON.parse(authStr);
    const currentParam = String(driverId).toLowerCase();
    const authId = String(auth.driverId).toLowerCase();
    const authName = String(auth.driverName || '').toLowerCase();
    const decodedParam = decodeURIComponent(String(driverId)).toLowerCase();

    const isAuthorized = 
      authId === currentParam || 
      authName === decodedParam || 
      authName.includes(decodedParam) || 
      decodedParam.includes(authName);

    if (!isAuthorized) {
      router.push('/driver/login');
      return;
    }

    loadPortalData();
  }, [driverId, router]);

  // Leaflet Dynamic Loader
  useEffect(() => {
    if (!activeRide || !mapRef.current || mapLoaded) return;

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

    return () => {
      // Clean up scripts & link if necessary
    };
  }, [activeRide]);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !activeRide) return;

    const L = (window as any).L;
    if (!L) return;

    // Initial positioning (e.g. Siliguri or current driver coords)
    const initialLat = driverCoords?.lat || 26.7271;
    const initialLng = driverCoords?.lng || 88.3953;

    if (!leafletMapInst.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([initialLat, initialLng], 14);

      L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      leafletMapInst.current = map;

      // Custom high-end car marker icon
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

      markerInst.current = L.marker([initialLat, initialLng], { icon: carIcon }).addTo(map);
    }
  }, [mapLoaded, activeRide]);

  // Geolocation updates & Streaming coordinates to database
  useEffect(() => {
    if (!activeRide) return;

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverCoords({ lat: latitude, lng: longitude });

          // Update Map marker
          const L = (window as any).L;
          if (leafletMapInst.current && markerInst.current && L) {
            markerInst.current.setLatLng([latitude, longitude]);
            leafletMapInst.current.panTo([latitude, longitude]);
          }

          // Stream coordinates to backend
          fetch(`${API}/public/driver/${driverId}/ride/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tourId: activeRide.tourId,
              dayNumber: activeRide.dayNumber,
              lat: latitude,
              lng: longitude,
              etaMinutes: 15 // Mock ETA minutes
            })
          }).catch(err => console.error('Streaming position failed', err));
        },
        (err) => console.error('Geolocation watcher failed', err),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeRide]);

  // Start active ride
  const handleStartRide = async (trip: any) => {
    try {
      setLoading(true);
      // Grab current position for starting
      let lat = 26.7271;
      let lng = 88.3953;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        });
      }

      const res = await fetch(`${API}/public/driver/${driverId}/ride/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: trip.tourId,
          dayNumber: trip.dayNumber,
          pickupLocation: 'Bagdogra Airport (IXB) / NJP Station',
          destinationLocation: trip.hotel || 'Partner Hotel',
          lat,
          lng
        })
      }).then(r => r.json());

      if (res.success) {
        toast.success('Duty started! Guest has been notified via WhatsApp with live tracking link.');
        setActiveRide({ ...trip, rideStatus: 'STARTED' });
        loadPortalData();
      } else {
        toast.error(res.message || 'Failed to start ride');
      }
    } catch (e) {
      toast.error('Connection error starting ride');
    } finally {
      setLoading(false);
    }
  };

  // Complete active ride
  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/public/driver/${driverId}/ride/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: activeRide.tourId,
          dayNumber: activeRide.dayNumber
        })
      }).then(r => r.json());

      if (res.success) {
        toast.success('Excellent job! Trip completed successfully.');
        setActiveRide(null);
        setMapLoaded(false);
        leafletMapInst.current = null;
        markerInst.current = null;
        loadPortalData();
      } else {
        toast.error(res.message || 'Failed to complete ride');
      }
    } catch (e) {
      toast.error('Connection error completing ride');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('imagica_driver_auth');
    router.push('/driver/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-sm font-semibold text-white/60 font-sans">Syncing Driver Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-150 flex justify-center items-center font-sans antialiased text-gray-900 md:p-6">
      
      <div className="relative w-full h-[100vh] md:max-w-[420px] md:h-[880px] bg-slate-900 border-0 md:border md:border-gray-800 md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col z-10">
        
        {/* Active Ride/Duty view replaces standard tabs */}
        {activeRide ? (
          <div className="w-full h-full flex flex-col relative bg-gray-950">
            {/* FULL SCREEN MAP CONTAINER */}
            <div ref={mapRef} className="absolute inset-0 z-0 w-full h-[65%]" />
            
            {/* GRADIENT OVERLAYS */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
            <div className="absolute top-[60%] left-0 w-full h-[10%] bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-10" />

            {/* TOP GLASS HEADER BAR */}
            <div className="absolute top-8 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-lg z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Duty Day {activeRide.dayNumber} Active</h4>
                  <p className="text-[10px] text-gray-300">Live coordinates streaming...</p>
                </div>
              </div>
              <button 
                onClick={loadPortalData}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all active:scale-90"
                title="Refresh Portal Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* APPLE-STYLE FLOATING GLASS BOTTOM SHEET */}
            <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl space-y-4 flex flex-col z-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">
                    Transit Status: Active
                  </span>
                  <h3 className="font-bold text-white text-base mt-1.5">{activeRide.guestName}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Tour Reference: {activeRide.tourCode}</p>
                </div>
                <a href={`tel:+91${activeRide.guestPhone}`} className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-transform active:scale-90 shadow-md">
                  <PhoneCall className="w-5 h-5" />
                </a>
              </div>

              {/* RIDE POINTS */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 shadow-lg shadow-blue-500/50" />
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Pickup Address</span>
                    <span className="text-xs text-gray-200 mt-0.5 block font-medium">Bagdogra Airport (IXB) / NJP Station</span>
                  </div>
                </div>
                <div className="w-px h-4 bg-white/10 ml-1.25" />
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0 shadow-lg shadow-orange-500/50" />
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Destination Drop-off</span>
                    <span className="text-xs text-gray-200 mt-0.5 block font-medium">{activeRide.hotel || 'Partner Hotel'}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={handleCompleteRide}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5" /> Complete Duty & Close Map
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER (IMAGICA BRANDING) */}
            <header className="bg-slate-900/90 backdrop-blur-md text-white px-5 pt-12 pb-6 border-b border-white/5 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 backdrop-blur-lg px-3 py-2 rounded-2xl shadow-lg border border-white/10 flex flex-col items-center">
                  <img 
                      src="/logo.jpg" 
                      alt="Imagica Holidays" 
                      className="h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                  />
                  <span className="hidden font-serif font-bold text-lg tracking-wider mt-1">
                    <span className="text-[#3B82F6]">I</span>
                    <span className="text-[#8B5CF6]">M</span>
                    <span className="text-[#F97316]">A</span>
                    <span className="text-[#EF4444]">G</span>
                    <span className="text-[#F97316]">I</span>
                    <span className="text-[#8B5CF6]">C</span>
                    <span className="text-[#3B82F6]">A</span>
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver Portal</h1>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors" title="Log Out">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h2 className="text-sm font-bold mt-0.5 text-blue-400 max-w-[160px] truncate">{driver?.name}</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">{driver?.vehicleNo} • {driver?.vehicleName}</p>
                </div>
              </div>
              
              <div className="flex gap-2 bg-black/30 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setActiveTab('trips')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'trips' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 cursor-pointer hover:text-white'}`}
                >
                  Active Duty
                </button>
                <button 
                  onClick={() => setActiveTab('earnings')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'earnings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 cursor-pointer hover:text-white'}`}
                >
                  Earnings & Payouts
                </button>
              </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-5 scrollbar-none pb-28 relative z-10">
              <AnimatePresence mode="wait">
                
                {/* TRIPS VIEW */}
                {activeTab === 'trips' && (
                  <motion.div
                    key="trips"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-white text-lg">Your Assignments</h3>
                      <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-500/30 uppercase tracking-wider">
                        {trips.length} Duty Day(s)
                      </span>
                    </div>

                    {trips.length === 0 ? (
                      <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/5 shadow-sm">
                        <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-400">No upcoming duties assigned.</p>
                      </div>
                    ) : (
                      trips.map((trip: any, idx: number) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white text-base">{trip.guestName}</h4>
                                <span className="text-[9px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">ID: {trip.tourCode}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">Day {trip.dayNumber} duty • {new Date(trip.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>

                          <div className="space-y-4 relative before:absolute before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                            <div className="relative flex items-center justify-between group">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-900 bg-blue-50 text-white shadow shrink-0">
                                <Plane className="w-3.5 h-3.5" />
                              </div>
                              <div className="w-[calc(100%-2.5rem)] p-3.5 rounded-2xl border border-white/5 bg-white/5 shadow-inner">
                                <span className="font-bold text-[9px] text-blue-400 uppercase tracking-wider block">Service Detail</span>
                                <p className="text-xs text-gray-200 mt-0.5 font-medium">Sightseeing / Pick-up Duty</p>
                              </div>
                            </div>

                            {trip.hotel && (
                              <div className="relative flex items-center justify-between group">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-900 bg-orange-500 text-white shadow shrink-0">
                                  <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div className="w-[calc(100%-2.5rem)] p-3.5 rounded-2xl border border-white/5 bg-white/5 shadow-inner">
                                  <span className="font-bold text-[9px] text-orange-400 uppercase tracking-wider block">Assigned Drop-off Hotel</span>
                                  <p className="text-xs text-gray-200 mt-0.5 font-medium">{trip.hotel}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <a href={`tel:+91${trip.guestPhone}`} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                              <PhoneCall className="w-4 h-4 text-green-400" /> Call Guest
                            </a>
                            <button 
                              onClick={() => handleStartRide(trip)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                            >
                              <Car className="w-4 h-4" /> Start Duty
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* EARNINGS / PAYMENTS VIEW */}
                {activeTab === 'earnings' && (
                  <motion.div
                    key="earnings"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    {/* Earnings Overview Grid */}
                    <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-white/10">
                      <div>
                        <span className="text-[10px] font-bold text-green-100 uppercase tracking-widest">Total Transport Billings</span>
                        <h3 className="text-2xl font-extrabold mt-0.5 flex items-center gap-0.5 text-white">
                          <IndianRupee className="w-5.5 h-5.5 text-green-200" /> {Number(financials.totalEarnings || 0).toLocaleString('en-IN')}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-500/30 text-xs">
                        <div>
                          <span className="text-green-100 block text-[9px] uppercase tracking-wider font-bold">Settled Payouts</span>
                          <span className="font-bold text-white flex items-center gap-0.5 mt-0.5">
                            ₹{Number(financials.payoutReceived || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-100 block text-[9px] uppercase tracking-wider font-bold">Pending Settlements</span>
                          <span className="font-bold text-green-200 flex items-center gap-0.5 mt-0.5">
                            ₹{Number(financials.payoutPending || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-lg mt-6">Imagica Payout Settlements</h3>
                    
                    {settlements.length === 0 ? (
                      <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/5 shadow-sm">
                        <IndianRupee className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-400">No payout records found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {settlements.map((s: any) => (
                          <div key={s.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm truncate max-w-[170px]">{s.notes}</h4>
                                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                                  {s.mode} • {s.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-white">₹{Number(s.amount || 0).toLocaleString('en-IN')}</span>
                              <span className="block text-[10px] text-gray-400 mt-0.5">{new Date(s.paymentDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </main>

            {/* APPLE-STYLE FLOATING GLASS BOTTOM NAV */}
            <nav className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-3xl shadow-2xl flex justify-between items-center z-20">
              <button onClick={() => setActiveTab('trips')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'trips' ? 'text-blue-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
                <Car className="w-5.5 h-5.5" />
                <span className="text-[9px] font-bold">Duty Logs</span>
              </button>
              
              <button onClick={() => toast.info("CRM Support lines are open at support@imagicaholidays.com")} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors relative cursor-pointer">
                <MessageSquare className="w-5.5 h-5.5" />
                <span className="text-[9px] font-bold">CRM Chat</span>
              </button>

              <button onClick={() => setActiveTab('earnings')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'earnings' ? 'text-blue-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
                <IndianRupee className="w-5.5 h-5.5" />
                <span className="text-[9px] font-bold">Earnings</span>
              </button>
            </nav>
          </>
        )}

      </div>
    </div>
  );
}
