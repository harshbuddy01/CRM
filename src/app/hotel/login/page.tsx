'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, Lock, User, KeyRound } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api.imagicaholidays.com/api/v1'
    : 'http://localhost:3001/api/v1');

export default function HotelPartnerLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) {
      toast.error('Username and PIN are required');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/public/hotel/login`, { username, pin });
      if (res.data?.success) {
        const { hotelId, hotelName } = res.data.data;
        localStorage.setItem(
          'imagica_hotel_auth',
          JSON.stringify({ hotelId, hotelName, username })
        );
        toast.success(`Welcome, ${hotelName}!`);
        router.push(`/hotel/${hotelId}`);
      } else {
        toast.error(res.data?.message || 'Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-xl">
          <Building2 className="w-10 h-10 text-orange-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Hotel Partner Portal</h2>
        <p className="mt-2 text-sm text-slate-400">
          Secure access to bookings, arrivals, and settlements
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                Username / Login ID
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm"
                  placeholder="hotelname@imagica"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                Password / PIN
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="pin"
                  id="pin"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm"
                  placeholder="Enter 6-digit PIN"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <KeyRound className="w-5 h-5 mr-2" />
                )}
                Login Securely
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
