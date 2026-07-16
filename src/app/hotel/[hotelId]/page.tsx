'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Building2, Users, IndianRupee, MessageSquare, 
  Calendar, Bed, Utensils, Clock, CheckCircle2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function HotelPartnerWebApp() {
  const { hotelId } = useParams();
  const [activeTab, setActiveTab] = useState<'guests' | 'requests' | 'finance'>('guests');

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
        <header className="bg-[#1e293b] text-white px-5 pt-12 pb-6 shadow-md relative z-10">
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
              <h1 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Portal</h1>
              <h2 className="text-sm font-bold mt-0.5 text-orange-400">Hotel 4 Season</h2>
            </div>
          </div>
          
          <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('guests')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'guests' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Arrivals
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors relative ${activeTab === 'requests' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Requests
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1e293b]" />
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'finance' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Finance
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 scrollbar-none pb-24 relative z-10">
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
                  <h3 className="font-bold text-gray-900 text-lg">Today's Arrivals</h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">1 Booking</span>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">Confirmed</span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider border border-gray-200">ID: ETHNO-38024</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mt-2">Sumeet Customer</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Users className="w-3.5 h-3.5" /> 2 Adults, 0 Children
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400">ETA</span>
                      <p className="font-bold text-orange-600 text-sm mt-0.5">02:00 PM</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Check-in</span>
                      <span className="text-xs font-bold text-gray-700">08 Jun 2026</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Check-out</span>
                      <span className="text-xs font-bold text-gray-700">10 Jun 2026</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Room Type</span>
                      <span className="text-xs font-bold text-gray-700">Premium Valley View (MAP Plan)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => toast.success("Guest Checked In!")} className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs py-2.5 rounded-xl transition-colors border border-green-200 shadow-sm flex justify-center items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Check-in
                    </button>
                    <a href="tel:+919876543210" className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2.5 rounded-xl transition-colors border border-blue-200 shadow-sm flex justify-center items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LIVE REQUESTS VIEW */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">Live Service Requests</h3>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-red-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">Tea / Coffee</h4>
                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">NEW</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Room 502 • Sumeet (ID: ETHNO-38024)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">2 min ago</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => toast.success("Marked as Processing")} className="flex-1 bg-gray-900 text-white font-bold text-xs py-2 rounded-lg">Acknowledge</button>
                    <button onClick={() => toast.success("Marked as Completed")} className="flex-1 bg-gray-100 text-gray-700 font-bold text-xs py-2 rounded-lg hover:bg-gray-200">Complete</button>
                  </div>
                </div>

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
                <div className="bg-gradient-to-br from-[#1e293b] to-gray-800 rounded-3xl p-6 text-white shadow-lg">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Settled by Imagica Holidays</span>
                  <h3 className="text-3xl font-bold mt-1 flex items-center gap-1">
                    <IndianRupee className="w-6 h-6 text-orange-400" /> 45,000
                  </h3>
                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-xs">
                    <span className="text-gray-400">Total Bookings: 4</span>
                    <button className="font-bold text-orange-400 flex items-center gap-1 hover:text-orange-300">
                      <FileText className="w-3.5 h-3.5" /> Download Report
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mt-6">Recent Booking Settlements</h3>
                
                <div className="space-y-3">
                  {/* Ledger Item 1 */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Sumeet (ID: ETHNO-38024)</h4>
                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
                           Fully Paid by Imagica Holidays
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">₹12,000</span>
                      <span className="block text-[10px] text-gray-400">01 Jun 2026</span>
                    </div>
                  </div>

                  {/* Ledger Item 2 */}
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Rahul (ID: ETHNO-29931)</h4>
                        <p className="text-[10px] text-orange-500 font-bold flex items-center gap-1 mt-0.5">
                          Advance Paid by Imagica Holidays (50%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">₹6,000</span>
                      <span className="block text-[10px] text-gray-400">28 May 2026</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* BOTTOM NAV */}
        <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 pb-safe flex justify-between items-center z-20">
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors">
            <Building2 className="w-6 h-6" />
            <span className="text-[10px] font-bold">Front Desk</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors relative">
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-bold">CRM Support</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors">
            <FileText className="w-6 h-6" />
            <span className="text-[10px] font-bold">Invoices</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
