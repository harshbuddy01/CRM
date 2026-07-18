'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Loader2, Lock, User, KeyRound } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api.imagicaholidays.com/api/v1'
    : 'http://localhost:3001/api/v1');

export default function DriverPartnerLogin() {
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
      const res = await axios.post(`${API_BASE}/public/driver/login`, { username, pin });
      if (res.data?.success) {
        const { driverId, driverName } = res.data.data;
        localStorage.setItem(
          'imagica_driver_auth',
          JSON.stringify({ driverId, driverName, username })
        );
        toast.success(`Welcome back, ${driverName}!`);
        router.push(`/driver/${driverId}`);
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center flex flex-col items-center pointer-events-none mb-4">
        <img 
          src="/logo.png?v=2" 
          alt="Imagica Holidays" 
          className="h-14 object-contain"
          style={{ filter: 'drop-shadow(0px 0px 1px #ffffff) drop-shadow(0px 0px 1px #ffffff) drop-shadow(0px 0px 2px #ffffff)' }}
        />
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Driver Partner Portal</h2>
        <p className="mt-2 text-sm text-slate-400">
          Secure duty logs, arrivals, and payout records
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/55 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                  placeholder="drivername@imagica"
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/55 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                  placeholder="Enter 6-digit PIN"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <KeyRound className="w-5 h-5 mr-2" />
                )}
                Start Journey Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
