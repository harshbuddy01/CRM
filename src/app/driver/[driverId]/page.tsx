'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  MapPin, PhoneCall, CheckCircle2, User, Car, 
  IndianRupee, Plane, Train, MessageSquare, AlertTriangle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DriverWebApp() {
  const { driverId } = useParams();
  const [activeTab, setActiveTab] = useState<'trips' | 'earnings'>('trips');
  const [transitMode] = useState<'flight' | 'train'>('flight');

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
            <div className="text-right">
              <h1 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver Portal</h1>
              <h2 className="text-sm font-bold mt-0.5 text-blue-400">Ramesh Kumar</h2>
            </div>
          </div>
          
          <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('trips')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'trips' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400'}`}
            >
              Active Duty
            </button>
            <button 
              onClick={() => setActiveTab('earnings')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'earnings' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400'}`}
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
                  <h3 className="font-bold text-gray-900 text-lg">Next Assignment</h3>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Today</span>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-lg">Sumeet Customer</h4>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider border border-gray-200">ID: ETHNO-38024</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">2 Passengers • 4 Bags</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {/* Pickup */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {transitMode === 'flight' ? <Plane className="w-3 h-3" /> : <Train className="w-3 h-3" />}
                      </div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-gray-100 bg-gray-50/80 shadow-sm">
                        <span className="font-bold text-xs text-blue-600">Pickup @ 09:00 AM</span>
                        <p className="text-xs text-gray-700 mt-1">{transitMode === 'flight' ? 'Bagdogra Airport (IXB)' : 'NJP Railway Station'}</p>
                      </div>
                    </div>

                    {/* Drop */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-orange-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-gray-100 bg-gray-50/80 shadow-sm">
                        <span className="font-bold text-xs text-orange-600">Drop-off</span>
                        <p className="text-xs text-gray-700 mt-1">Hotel 4 Season, Pelling</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <a href="tel:+919876543210" className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <PhoneCall className="w-4 h-4" /> Call Guest
                    </a>
                    <button onClick={() => toast.success("Trip Started!")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
                      <Car className="w-4 h-4" /> Start Trip
                    </button>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-800 leading-relaxed font-medium">
                    Guest has pending payment of ₹5,000. Please collect cash at drop-off.
                  </p>
                </div>
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
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-6 text-white shadow-lg">
                  <span className="text-xs font-medium text-green-100 uppercase tracking-widest">Settled by Imagica Holidays</span>
                  <h3 className="text-3xl font-bold mt-1 flex items-center gap-1">
                    <IndianRupee className="w-6 h-6 text-green-200" /> 12,500
                  </h3>
                  <div className="mt-4 pt-4 border-t border-green-500/50 flex justify-between items-center text-xs">
                    <span className="text-green-100">Next Payout: 10 Jun</span>
                    <span className="font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Direct to Bank</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mt-6">Recent Payments from Imagica</h3>
                
                <div className="space-y-3">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Trip ETHNO-38024</h4>
                        <p className="text-[10px] text-green-600 font-bold mt-0.5">Fully Paid by Imagica Holidays</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">+₹8,000</span>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Trip ETHNO-22101</h4>
                        <p className="text-[10px] text-orange-500 font-bold mt-0.5">Advance Paid by Imagica Holidays</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">+₹4,500</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* BOTTOM NAV */}
        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 pb-safe flex justify-between items-center z-20">
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
            <Car className="w-6 h-6" />
            <span className="text-[10px] font-bold">Duty</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors relative">
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-bold">CRM Chat</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
