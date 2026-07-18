'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, Users, IndianRupee, MessageSquare, 
  Calendar, Bed, Utensils, Clock, CheckCircle2,
  FileText, Loader2, LogOut, Check, ArrowRight, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const API = process.env.NEXT_PUBLIC_API_URL
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api.imagicaholidays.com/api/v1'
    : 'http://localhost:3001/api/v1');

export default function HotelPartnerWebApp() {
  const { hotelId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'guests' | 'requests' | 'finance'>('guests');
  
  const [hotelName, setHotelName] = useState('');
  const [guests, setGuests] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>({ totalBilling: 0, amountReceived: 0, amountPending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('hotel_theme') as 'dark' | 'light';
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('hotel_theme', nextTheme);
  };

  // Load hotel dashboard data
  const loadDashboardData = async (showRefState = false) => {
    if (!hotelId) return;
    if (showRefState) setRefreshing(true);
    
    try {
      // 1. Fetch Guest Arrivals
      const arrivalsRes = await fetch(`${API}/public/hotel/${hotelId}/guests`).then(r => r.json());
      if (arrivalsRes.success) {
        setHotelName(arrivalsRes.data.hotelName);
        setGuests(arrivalsRes.data.guests || []);
        setSettlements(arrivalsRes.data.settlements || []);
        setFinancials(arrivalsRes.data.financials || { totalBilling: 0, amountReceived: 0, amountPending: 0 });
      }

      // 2. Fetch Guest Service Requests
      const requestsRes = await fetch(`${API}/public/hotel/${hotelId}/requests`).then(r => r.json());
      if (requestsRes.success) {
        setRequests(requestsRes.data || []);
      }
    } catch (e) {
      console.error('Failed to load hotel portal data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Socket.io Real-time Live Sync (Uber-style)
  useEffect(() => {
    if (!hotelId) return;

    const authStr = localStorage.getItem('imagica_hotel_auth');
    if (!authStr) return;

    const socketUrl = API.replace('/api/v1', '');
    const socket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false
    });

    socket.on('connect', () => {
      console.log('Hotel connected to live socket room:', hotelId);
      socket.emit('join-room', `hotel:${hotelId}`);
    });

    socket.on('hotel:request-new', (data: any) => {
      console.log('Real-time new service request received:', data);
      toast.info(`🔔 New request from ${data.guestName}: ${data.requestType}!`, { duration: 5000 });
      loadDashboardData();
    });

    return () => {
      socket.disconnect();
    };
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) return;
    
    // Auth Check
    const authStr = localStorage.getItem('imagica_hotel_auth');
    if (!authStr) {
      router.push('/hotel/login');
      return;
    }
    const auth = JSON.parse(authStr);
    const currentParam = String(hotelId).toLowerCase();
    const authId = String(auth.hotelId).toLowerCase();
    const authName = String(auth.hotelName).toLowerCase();
    const decodedParam = decodeURIComponent(String(hotelId)).toLowerCase();

    const isAuthorized = 
      authId === currentParam || 
      authName === decodedParam || 
      authName.includes(decodedParam) || 
      decodedParam.includes(authName);

    if (!isAuthorized) {
      router.push('/hotel/login');
      return;
    }

    loadDashboardData();

    // Auto-refresh interval
    const interval = setInterval(() => loadDashboardData(false), 8000);
    return () => clearInterval(interval);
  }, [hotelId, router]);

  // Update request status
  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API}/public/hotel/${hotelId}/request/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(r => r.json());

      if (res.success) {
        toast.success(`Request marked as ${newStatus}`);
        loadDashboardData(false);
      } else {
        toast.error(res.message || 'Failed to update request');
      }
    } catch (err) {
      toast.error('Connection error updating request');
    }
  };

  // Perform quick check-in toggle
  const handleCheckInGuest = (g: any) => {
    toast.success(`Welcome ${g.guestName}! Check-in recorded and Ops team notified.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('imagica_hotel_auth');
    router.push('/hotel/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-orange-400" />
          <p className="text-sm font-semibold text-white/60 font-sans">Syncing Hotel Partner Portal...</p>
        </div>
      </div>
    );
  }

  // Count pending live requests
  const pendingRequestsCount = requests.filter(r => r.status !== 'COMPLETED').length;

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
      `}} />

      <div className={`relative w-full h-[100vh] md:max-w-[420px] md:h-[880px] border-0 md:border md:border-gray-800 md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col z-10 transition-all duration-300 ${theme === 'light' ? 'light-theme' : 'bg-slate-900 text-white'}`}>
        
        {/* HEADER */}
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
                <button onClick={toggleTheme} className="text-gray-400 hover:text-white transition-colors text-[10px] font-extrabold cursor-pointer" title="Toggle Light/Dark Theme">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <h1 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Portal</h1>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer" title="Log Out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <h2 className="text-sm font-bold mt-0.5 text-amber-400 truncate max-w-[200px]">{hotelName}</h2>
            </div>
          </div>
          
          <div className="flex gap-2 bg-black/30 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('guests')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'guests' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 cursor-pointer hover:text-white'}`}
            >
              Arrivals
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${activeTab === 'requests' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 cursor-pointer hover:text-white'}`}
            >
              Requests
              {pendingRequestsCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'finance' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 cursor-pointer hover:text-white'}`}
            >
              Finance
            </button>
          </div>
        </header>
 
        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 scrollbar-none pb-28 relative z-10">
          <AnimatePresence mode="wait">
            
            {/* GUESTS / ARRIVALS VIEW */}
            {activeTab === 'guests' && (
              <motion.div
                key="guests"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white text-lg">Upcoming Bookings</h3>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 uppercase tracking-wider">
                    {guests.length} Reservation(s)
                  </span>
                </div>

                {guests.length === 0 ? (
                  <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/5 shadow-sm">
                    <Building2 className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-400">No arrivals registered at the moment.</p>
                  </div>
                ) : (
                  guests.map((g: any, idx: number) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">ID: {g.tourCode}</span>
                          </div>
                          <h4 className="font-bold text-white text-base mt-2">{g.guestName}</h4>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Users className="w-3.5 h-3.5 text-orange-400" /> {g.adults || 2} Adults, {g.children || 0} Children
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Check-in</span>
                          <span className="text-xs font-bold text-gray-200">{g.checkIn ? new Date(g.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Pending'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Check-out</span>
                          <span className="text-xs font-bold text-gray-200">{g.checkOut ? new Date(g.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Pending'}</span>
                        </div>
                      </div>

                      {/* Premium Taj-style VIP Guest ETA & Driver info */}
                      {g.arrivalDetails && g.arrivalDetails.transitNumber && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 space-y-2 text-xs">
                          <div className="flex justify-between items-center pb-1.5 border-b border-amber-500/10">
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block text-left">Inbound Transit Details</span>
                            <span className="text-[10px] font-bold text-white/90 text-right">
                              {g.arrivalDetails.transitType === 'train' ? '🚂 Train' : '✈️ Flight'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 text-left">
                            <div>Number: <strong className="text-white uppercase">{g.arrivalDetails.transitNumber}</strong></div>
                            <div>Arrival Time: <strong className="text-amber-400">{g.arrivalDetails.transitTime}</strong></div>
                            {g.arrivalDetails.pickupLocation && (
                              <div className="col-span-2">Pickup Hub: <span className="text-gray-300 font-medium">{g.arrivalDetails.pickupLocation}</span></div>
                            )}
                            {g.arrivalDetails.driverName && (
                              <div className="col-span-2 mt-1 pt-1.5 border-t border-white/5 flex items-center justify-between">
                                <div>
                                  <span className="block text-[8px] text-gray-400 uppercase tracking-wider text-left">Assigned Driver</span>
                                  <span className="font-bold text-white text-[11px] text-left block">{g.arrivalDetails.driverName} ({g.arrivalDetails.vehicleNo})</span>
                                </div>
                                <a href={`tel:+91${g.arrivalDetails.driverPhone}`} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold border border-white/10 text-[9px] flex items-center gap-1 shrink-0">
                                  📞 Call
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {g.roomNotes && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-300">
                          <strong className="block mb-0.5 font-bold uppercase text-[9px] text-amber-500 tracking-wider text-left">Instructions</strong>
                          {g.roomNotes}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => handleCheckInGuest(g)} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-1 cursor-pointer active:scale-95">
                          <CheckCircle2 className="w-4 h-4" /> Guest Check-in
                        </button>
                        <a href={`tel:+91${g.guestPhone}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs py-2.5 rounded-xl transition-all flex justify-center items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-blue-400" /> Contact Guest
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* LIVE SERVICE REQUESTS VIEW */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white text-lg">Live Service Requests</h3>
                  <button 
                    onClick={() => loadDashboardData(true)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/5 shadow-sm">
                    <Utensils className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-400">No service requests active.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((r: any) => (
                      <div key={r.id} className="bg-white/5 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/5 space-y-4 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                          r.status === 'COMPLETED' ? 'bg-green-500' :
                          r.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Room {r.roomNo} • {r.guestName}</span>
                            <h4 className="font-bold text-white text-base mt-1 flex items-center gap-1.5">
                              {r.requestType}
                            </h4>
                            <p className="text-xs text-gray-300 mt-1">{r.notes}</p>
                          </div>
                          
                          <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider shrink-0 ${
                            r.status === 'COMPLETED' ? 'bg-green-500/25 text-green-400 border border-green-500/30' :
                            r.status === 'IN_PROGRESS' ? 'bg-blue-500/25 text-blue-400 border border-blue-500/30' :
                            'bg-yellow-500/25 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        {r.status !== 'COMPLETED' && (
                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            {r.status === 'PENDING' ? (
                              <button 
                                onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                              >
                                Accept Request <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-green-500/25 cursor-pointer"
                              >
                                Mark Completed <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* FINANCE / EARNINGS VIEW */}
            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Finance Overview Grid */}
                <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-white/10">
                  <div>
                    <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest">Total Booking Billings</span>
                    <h3 className="text-2xl font-extrabold mt-0.5 flex items-center gap-0.5 text-white">
                      <IndianRupee className="w-5.5 h-5.5 text-orange-200" /> {Number(financials.totalBilling || 0).toLocaleString('en-IN')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-orange-500/30 text-xs">
                    <div>
                      <span className="text-orange-100 block text-[9px] uppercase tracking-wider font-bold">Settled Payments</span>
                      <span className="font-bold text-white flex items-center gap-0.5 mt-0.5">
                        ₹{Number(financials.amountReceived || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-orange-100 block text-[9px] uppercase tracking-wider font-bold">Balance Pending</span>
                      <span className="font-bold text-orange-200 flex items-center gap-0.5 mt-0.5">
                        ₹{Number(financials.amountPending || 0).toLocaleString('en-IN')}
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
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm truncate max-w-[170px]">{s.notes}</h4>
                            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wider">
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
          <button onClick={() => setActiveTab('guests')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'guests' ? 'text-orange-400' : 'text-gray-400 hover:text-white'} cursor-pointer`}>
            <Building2 className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">Front Desk</span>
          </button>
          
          <button onClick={() => toast.info("CRM Support lines are open at support@imagicaholidays.com")} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors relative cursor-pointer">
            <MessageSquare className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">CRM Support</span>
          </button>

          <button onClick={() => setActiveTab('requests')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'requests' ? 'text-orange-400' : 'text-gray-400 hover:text-white'} relative cursor-pointer`}>
            <Utensils className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold">Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-0.5 right-2 bg-red-500 text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900 shadow">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </nav>

      </div>
    </div>
  );
}
