'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, PhoneCall, CheckCircle2, User, Car, 
  IndianRupee, Plane, Train, MessageSquare, Clock, Loader2, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DriverWebApp() {
  const { driverId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'trips' | 'earnings'>('trips');
  
  const [driver, setDriver] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>({ totalEarnings: 0, payoutReceived: 0, payoutPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driverId) return;
    
    const authStr = localStorage.getItem('imagica_driver_auth');
    if (!authStr) {
      router.push('/driver/login');
      return;
    }
    const auth = JSON.parse(authStr);
    if (auth.driverId !== driverId) {
      router.push('/driver/login');
      return;
    }

    fetch(`${API}/public/driver/${driverId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setDriver(res.data.driver);
          setTrips(res.data.trips || []);
          setSettlements(res.data.settlements || []);
          setFinancials(res.data.financials || { totalEarnings: 0, payoutReceived: 0, payoutPending: 0 });
        }
      })
      .catch(() => toast.error('Failed to load driver portal data'))
      .finally(() => setLoading(false));
  }, [driverId, router]);

  const handleLogout = () => {
    localStorage.removeItem('imagica_driver_auth');
    router.push('/driver/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-sm font-semibold text-white/60 font-sans">Loading Driver Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans antialiased text-gray-900 md:p-6">
      
      <div className="relative w-full h-[100vh] md:max-w-[420px] md:h-[880px] bg-gray-50 border-0 md:border md:border-gray-200 md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col z-10">
        
        {/* WATERMARK BACKGROUND */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden mix-blend-multiply">
          <img 
            src="/logo.jpg" 
            alt="Watermark" 
            className="w-80 opacity-[0.04] grayscale rotate-12 scale-150"
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
          />
        </div>

        {/* HEADER (IMAGICA BRANDING) */}
        <header className="bg-gray-900 text-white px-5 pt-12 pb-6 shadow-md relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center">
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
          
          <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('trips')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'trips' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 cursor-pointer'}`}
            >
              Active Duty
            </button>
            <button 
              onClick={() => setActiveTab('earnings')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'earnings' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 cursor-pointer'}`}
            >
              Earnings & Payouts
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 scrollbar-none pb-24 relative z-10">
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
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-lg">Your Assignments</h3>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {trips.length} Duty Day(s)
                  </span>
                </div>

                {trips.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-gray-150 shadow-sm">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-500">No upcoming duties assigned.</p>
                  </div>
                ) : (
                  trips.map((trip: any, idx: number) => (
                    <div key={idx} className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-base">{trip.guestName}</h4>
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-255">ID: {trip.tourCode}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Day {trip.dayNumber} duty • {new Date(trip.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="space-y-4 relative before:absolute before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        <div className="relative flex items-center justify-between group">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0">
                            <Plane className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-[calc(100%-2.5rem)] p-3 rounded-xl border border-gray-100 bg-gray-50/80 shadow-sm">
                            <span className="font-bold text-[10px] text-blue-600 uppercase">Service Detail</span>
                            <p className="text-xs text-gray-700 mt-1">Sightseeing / Pick-up Duty</p>
                          </div>
                        </div>

                        {trip.hotel && (
                          <div className="relative flex items-center justify-between group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-orange-500 text-white shadow shrink-0">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="w-[calc(100%-2.5rem)] p-3 rounded-xl border border-gray-100 bg-gray-50/80 shadow-sm">
                              <span className="font-bold text-[10px] text-orange-600 uppercase">Assigned Drop-off Hotel</span>
                              <p className="text-xs text-gray-700 mt-1">{trip.hotel}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <a href={`tel:+91${trip.guestPhone}`} className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                          <PhoneCall className="w-4 h-4" /> Call Guest
                        </a>
                        <button onClick={() => toast.success("Duty started! Stay safe!")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer">
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
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-6 text-white shadow-lg space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-green-100 uppercase tracking-widest">Total Transport Billings</span>
                    <h3 className="text-2xl font-extrabold mt-0.5 flex items-center gap-0.5 text-white">
                      <IndianRupee className="w-5.5 h-5.5 text-green-200" /> {Number(financials.totalEarnings || 0).toLocaleString('en-IN')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-500/50 text-xs">
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

                <h3 className="font-bold text-gray-900 text-lg mt-6">Imagica Payout Settlements</h3>
                
                {settlements.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-gray-150 shadow-sm">
                    <IndianRupee className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-500">No payout records found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {settlements.map((s: any) => (
                      <div key={s.id} className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm truncate max-w-[170px]">{s.notes}</h4>
                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                              {s.mode} • {s.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-gray-900">₹{Number(s.amount || 0).toLocaleString('en-IN')}</span>
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

        {/* BOTTOM NAV */}
        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 pb-safe flex justify-between items-center z-20">
          <button onClick={() => setActiveTab('trips')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'trips' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'} cursor-pointer`}>
            <Car className="w-6 h-6" />
            <span className="text-[10px] font-bold">Duty Logs</span>
          </button>
          
          <button onClick={() => toast.info("Emergency support line is open at +91 99999 88888")} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors relative cursor-pointer">
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-bold">CRM Chat</span>
          </button>

          <button onClick={() => setActiveTab('earnings')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'earnings' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'} cursor-pointer`}>
            <IndianRupee className="w-6 h-6" />
            <span className="text-[10px] font-bold">Earnings</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
