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
import { io } from 'socket.io-client';

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
  const destMarkerInst = useRef<any>(null);
  const routePolylineInst = useRef<any>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<string>('');
  const [durationRemaining, setDurationRemaining] = useState<string>('');
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);
  const isFollowModeRef = useRef<boolean>(true);
  isFollowModeRef.current = isFollowMode;

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('driver_theme') as 'dark' | 'light';
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('driver_theme', nextTheme);
  };

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

          // Auto-resume active ride if backend says it has STARTED, EN_ROUTE, ARRIVED, or IN_TRANSIT
          const running = allTrips.find((t: any) => ['STARTED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'].includes(t.rideStatus));
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

  // Socket.io Real-time Live Sync (Uber-style)
  useEffect(() => {
    if (!activeRide) return;

    const socketUrl = API.replace('/api/v1', '');
    const socket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false
    });

    socket.on('connect', () => {
      console.log('Driver connected to live socket room:', activeRide.tourCode);
      socket.emit('join-room', `tour:${activeRide.tourCode}`);
    });

    socket.on('guest:transit-update', (data: any) => {
      console.log('Real-time guest transit details update received:', data);
      toast.info('🔔 Guest has updated their arrival transit details!', { duration: 5000 });
      loadPortalData();
    });

    return () => {
      socket.disconnect();
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

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: 'Map data © Google'
      }).addTo(map);

      leafletMapInst.current = map;

      map.on('dragstart', () => setIsFollowMode(false));
      map.on('zoomstart', () => setIsFollowMode(false));

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

          // Update Map marker and route polyline (dynamic routing for driver)
          const L = (window as any).L;
          if (leafletMapInst.current && markerInst.current && L) {
            markerInst.current.setLatLng([latitude, longitude]);

            // Resolve target position dynamically based on Ride Status
            const status = activeRide.rideStatus;
            let destPos = [latitude + 0.015, longitude + 0.015];
            let destIconHtml = '🏨';
            let markerColor = 'bg-orange-500';

            if (status === 'EN_ROUTE' || status === 'ARRIVED') {
              if (activeRide.pickupLat && activeRide.pickupLng) {
                destPos = [activeRide.pickupLat, activeRide.pickupLng];
              }
              destIconHtml = activeRide.transitType === 'train' ? '🚂' : '✈️';
              markerColor = 'bg-emerald-500 animate-bounce';
            } else {
              if (activeRide.destinationLat && activeRide.destinationLng) {
                destPos = [activeRide.destinationLat, activeRide.destinationLng];
              }
            }

            const destIcon = L.divIcon({
              className: 'custom-destination-marker',
              html: `
                <div class="w-8 h-8 rounded-full ${markerColor} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                  ${destIconHtml}
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            if (!destMarkerInst.current) {
              destMarkerInst.current = L.marker(destPos, { icon: destIcon }).addTo(leafletMapInst.current);
            } else {
              destMarkerInst.current.setLatLng(destPos);
              destMarkerInst.current.setIcon(destIcon);
            }

            const fetchAndDrawRoute = async () => {
              let routeLatLngs = [[latitude, longitude], destPos];
              let trueEta = 15;
              try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${destPos[1]},${destPos[0]}?overview=full&geometries=geojson`)
                  .then(r => r.json());
                if (res.routes && res.routes[0]) {
                  routeLatLngs = res.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                  
                  const dist = (res.routes[0].distance / 1000).toFixed(1);
                  const dur = Math.round(res.routes[0].duration / 60);
                  trueEta = dur;
                  setDistanceRemaining(`${dist} km`);
                  setDurationRemaining(`${dur} mins`);
                }
              } catch (e) {
                console.error("OSRM driving route lookup failed", e);
              }

              if (!routePolylineInst.current) {
                routePolylineInst.current = L.polyline(routeLatLngs, {
                  color: '#3B82F6',
                  weight: 6,
                  opacity: 0.9,
                  lineJoin: 'round'
                }).addTo(leafletMapInst.current);
              } else {
                routePolylineInst.current.setLatLngs(routeLatLngs);
              }

              // Adjust bounds or follow driver dynamically
              if (isFollowModeRef.current) {
                leafletMapInst.current.setView([latitude, longitude], 17);
              } else {
                const bounds = L.latLngBounds(routeLatLngs);
                leafletMapInst.current.fitBounds(bounds, { padding: [50, 50] });
              }

              // Stream coordinates to backend with TRUE ETA!
              fetch(`${API}/public/driver/${driverId}/ride/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tourId: activeRide.tourId,
                  dayNumber: activeRide.dayNumber,
                  lat: latitude,
                  lng: longitude,
                  etaMinutes: trueEta
                })
              }).catch(err => console.error('Streaming position failed', err));
            };
            fetchAndDrawRoute();
          }
        },
        (err) => console.error('Geolocation watcher failed', err),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeRide]);

  // Update ride status dynamically (Uber flow)
  const handleUpdateRideStatus = async (trip: any, nextStatus: string) => {
    try {
      setLoading(true);
      
      // Grab current position
      let lat = 26.7271;
      let lng = 88.3953;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve(null);
            },
            () => resolve(null),
            { timeout: 4000 }
          );
        });
      }

      const res = await fetch(`${API}/public/driver/${driverId}/ride/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: trip.tourId,
          dayNumber: trip.dayNumber,
          status: nextStatus,
          lat,
          lng
        })
      }).then(r => r.json());

      if (res.success) {
        if (nextStatus === 'COMPLETED') {
          toast.success('Excellent job! Trip completed successfully.');
          setActiveRide(null);
          setMapLoaded(false);
          leafletMapInst.current = null;
          markerInst.current = null;
        } else {
          toast.success(`Duty status updated to ${nextStatus}`);
          setActiveRide({ ...trip, rideStatus: nextStatus });
        }
        loadPortalData();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (e) {
      toast.error('Connection error updating status');
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
      <style dangerouslySetInnerHTML={{ __html: `
        .light-theme {
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
        .light-theme .bg-slate-900,
        .light-theme .bg-slate-950,
        .light-theme .bg-slate-900\\/80,
        .light-theme .bg-gray-900\\/80,
        .light-theme .bg-gray-950,
        .light-theme .bg-black {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #e2e8f0 !important;
        }
        .light-theme .bg-white\\/5,
        .light-theme .bg-white\\/10,
        .light-theme .bg-black\\/35 {
          background-color: #f1f5f9 !important;
          border-color: #e2e8f0 !important;
          color: #0f172a !important;
        }
        .light-theme .text-white,
        .light-theme .text-gray-100,
        .light-theme .text-gray-200,
        .light-theme .text-gray-300 {
          color: #0f172a !important;
        }
        .light-theme .text-gray-400 {
          color: #64748b !important;
        }
        .light-theme .border-white\\/5,
        .light-theme .border-white\\/10 {
          border-color: #e2e8f0 !important;
        }
        .light-theme input,
        .light-theme select,
        .light-theme textarea {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .light-theme .divide-white\\/5 > * {
          border-color: #e2e8f0 !important;
        }
        .light-theme .custom-car-marker svg {
          stroke: #1e3a8a !important;
        }
      `}} />

      <div className={`relative w-full h-[100vh] md:max-w-[420px] md:h-[880px] border-0 md:border md:border-gray-800 md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col z-10 transition-all duration-300 ${theme === 'light' ? 'light-theme' : 'bg-slate-900 text-white'}`}>
        
        {/* Active Ride/Duty view replaces standard tabs */}
        {activeRide ? (
          <div className="w-full h-full flex flex-col relative bg-gray-950">
            {/* FULL SCREEN MAP CONTAINER */}
            <div ref={mapRef} className="absolute inset-0 z-0 w-full h-[65%]" />

            {/* FLOATING RECENTER ACTION BUTTON */}
            {!isFollowMode && (
              <button 
                onClick={() => {
                  setIsFollowMode(true);
                  if (driverCoords) {
                    leafletMapInst.current?.setView([driverCoords.lat, driverCoords.lng], 17);
                  }
                }}
                className="absolute top-32 right-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11.5px] px-3.5 py-2.5 rounded-full shadow-2xl z-20 flex items-center gap-1.5 active:scale-95 transition-all border border-blue-400/20"
              >
                🎯 Recenter
              </button>
            )}
            
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
                  <p className="text-[10px] text-blue-400 font-bold mt-0.5">
                    {distanceRemaining ? `Remaining: ${distanceRemaining} • ${durationRemaining}` : 'Calculating route...'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white text-[11px] transition-all active:scale-90 font-sans font-extrabold"
                  title="Toggle Light/Dark Theme"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button 
                  onClick={loadPortalData}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all active:scale-90"
                  title="Refresh Portal Status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* APPLE-STYLE FLOATING GLASS BOTTOM SHEET */}
            <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl space-y-4 flex flex-col z-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-widest ${
                    activeRide.rideStatus === 'ARRIVED' ? 'bg-amber-500/25 text-amber-400 border-amber-500/30' :
                    activeRide.rideStatus === 'IN_TRANSIT' ? 'bg-indigo-500/25 text-indigo-400 border-indigo-500/30' :
                    'bg-blue-500/25 text-blue-400 border-blue-500/30'
                  }`}>
                    Status: {
                      activeRide.rideStatus === 'STARTED' || activeRide.rideStatus === 'EN_ROUTE' ? 'EN ROUTE' :
                      activeRide.rideStatus === 'ARRIVED' ? 'ARRIVED AT PICKUP' :
                      activeRide.rideStatus === 'IN_TRANSIT' ? 'IN TRANSIT' : activeRide.rideStatus
                    }
                  </span>
                  <h3 className="font-bold text-white text-base mt-2.5">{activeRide.guestName}</h3>
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
                    <span className="text-xs text-gray-200 mt-0.5 block font-medium">
                      {activeRide.pickupLocation || 'Bagdogra Airport (IXB) / NJP Station'}
                    </span>
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

              {/* Dynamic Transit Info & Action Button */}
              <div className="pt-1">
                {activeRide.transitNumber && (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 mb-3 text-xs text-white/90">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Guest Arrival Schedule</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-sans font-medium text-gray-300">
                      <div>Type: <span className="text-white font-bold uppercase">{activeRide.transitType || 'flight'}</span></div>
                      <div>ID/No: <span className="text-white font-bold uppercase">{activeRide.transitNumber}</span></div>
                      <div>ETA: <span className="text-white font-bold">{activeRide.transitTime}</span></div>
                      {activeRide.transitDetails && <div className="col-span-2">Details: <span className="text-white font-bold">{activeRide.transitDetails}</span></div>}
                    </div>
                  </div>
                )}
                
                {/* GOOGLE MAPS EXTERNAL NAVIGATION BUTTON */}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&origin=${driverCoords?.lat || 26.7271},${driverCoords?.lng || 88.3953}&destination=${
                    (activeRide.rideStatus === 'EN_ROUTE' || activeRide.rideStatus === 'ARRIVED') 
                      ? (activeRide.pickupLat || 26.6812) 
                      : (activeRide.destinationLat || 26.7271)
                  },${
                    (activeRide.rideStatus === 'EN_ROUTE' || activeRide.rideStatus === 'ARRIVED') 
                      ? (activeRide.pickupLng || 88.3286) 
                      : (activeRide.destinationLng || 88.3953)
                  }&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer mb-3.5"
                >
                  🗺️ Navigate in Google Maps
                </a>

                {/* ACTION BUTTON */}
                {activeRide.rideStatus === 'STARTED' || activeRide.rideStatus === 'EN_ROUTE' ? (
                  <button 
                    onClick={() => handleUpdateRideStatus(activeRide, 'ARRIVED')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-slate-950 font-black text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    I Have Arrived at Pickup
                  </button>
                ) : activeRide.rideStatus === 'ARRIVED' ? (
                  <button 
                    onClick={() => handleUpdateRideStatus(activeRide, 'IN_TRANSIT')}
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Start Trip to Hotel
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateRideStatus(activeRide, 'COMPLETED')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Complete Duty & Drop Guest
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER (IMAGICA BRANDING) */}
            <header className="bg-slate-900/90 backdrop-blur-md text-white px-5 pt-12 pb-6 border-b border-white/5 relative z-10">
              {/* Centered Large Branding Logo */}
              <div className="w-full flex justify-center mb-5">
                <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/20 flex items-center justify-center">
                  <img 
                      src="/logo.png" 
                      alt="Imagica Holidays" 
                      className="h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                      }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver Portal</h1>
                    <button 
                      onClick={toggleTheme}
                      className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-[10px] transition-all cursor-pointer font-sans font-extrabold"
                      title="Toggle Light/Dark Theme"
                    >
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer" title="Log Out">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h2 className="text-sm font-bold mt-0.5 text-blue-400 max-w-[200px] truncate">{driver?.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-200 font-bold uppercase tracking-wider">{driver?.vehicleName || 'Vehicle'}</p>
                  <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">{driver?.vehicleNo || 'MH-KP-8909'}</p>
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
                              onClick={() => handleUpdateRideStatus(trip, 'EN_ROUTE')} 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                            >
                              <Car className="w-4 h-4" /> Head to Pickup
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
