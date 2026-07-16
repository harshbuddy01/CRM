'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Building2, Users, IndianRupee, MessageSquare, 
  Send, CheckCircle2, ChevronRight, FileText, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export default function CRMTripDashboard() {
  const { tripId } = useParams();
  
  const [driverPaid, setDriverPaid] = useState('0');
  const [hotelPaid, setHotelPaid] = useState('0');
  const [autoWhatsapp, setAutoWhatsapp] = useState(true);

  const handlePaymentUpdate = (type: 'driver' | 'hotel') => {
    toast.success(`Payment updated successfully for ${type}`);
    if (autoWhatsapp) {
      setTimeout(() => {
        toast.info(`WhatsApp API: Message sent to ${type} regarding payment update.`, {
          icon: <MessageSquare className="w-4 h-4 text-green-500" />
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Active Trip</span>
            <h1 className="text-3xl font-bold mt-3 text-gray-900">Trip ETHNO-38024</h1>
            <p className="text-gray-500 mt-1">Sumeet Customer • Pelling, Sikkim (08 Jun - 10 Jun)</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Download Manifest
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Message Guest
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Financial Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Driver Payment Module */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Driver Settlement</h2>
                    <p className="text-xs text-gray-500">Ramesh Kumar (Innova)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Due</span>
                  <span className="text-xl font-bold text-gray-900">₹8,000</span>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Update Amount Paid</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                    </div>
                    <input 
                      type="number" 
                      value={driverPaid}
                      onChange={(e) => setDriverPaid(e.target.value)}
                      className="block w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-bold bg-gray-50"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handlePaymentUpdate('driver')}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Save Payment
                </button>
              </div>
            </div>

            {/* Hotel Payment Module */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Hotel Settlement</h2>
                    <p className="text-xs text-gray-500">Hotel 4 Season, Pelling</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Due</span>
                  <span className="text-xl font-bold text-gray-900">₹12,000</span>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Update Amount Paid</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                    </div>
                    <input 
                      type="number" 
                      value={hotelPaid}
                      onChange={(e) => setHotelPaid(e.target.value)}
                      className="block w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-bold bg-gray-50"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handlePaymentUpdate('hotel')}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Save Payment
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-6">
            
            {/* Automation Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Automation Settings</h3>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">WhatsApp API Sync</span>
                  <p className="text-[10px] text-gray-500 mt-1 pr-4">Automatically send payment confirmations to Driver & Hotel when updated.</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={autoWhatsapp} onChange={() => setAutoWhatsapp(!autoWhatsapp)} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${autoWhatsapp ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoWhatsapp ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>

              <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">
                  Guest App is syncing perfectly. Customer sees pending balance of ₹5,000.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/guest/ETHNO-3802442" target="_blank" className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                  <span className="text-sm font-bold text-gray-700">View Guest App</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="/driver/DRV-123" target="_blank" className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                  <span className="text-sm font-bold text-gray-700">View Driver App</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
