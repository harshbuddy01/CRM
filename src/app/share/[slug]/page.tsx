'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { BrochureView } from '@/components/BrochureView';

export default function SharePage() {
  const { slug } = useParams();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug || Array.isArray(slug)) {
      setError('Itinerary not found');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const res = await api.get(`/itineraries/share/${slug}`);
        if (res.data.success) {
          setItinerary(res.data.data);
          document.title = `${res.data.data.title} | Imagica Holidays`;
        } else {
          setError('Itinerary not found');
        }
      } catch (err: any) {
        console.error('Share Load Error:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (error || !itinerary) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-center p-4">
      <div className="bg-white p-10 rounded-[32px] shadow-sm max-w-sm border border-slate-100">
        <AlertTriangle className="w-12 h-12 mx-auto text-rose-300 mb-6" />
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Proposal Not Found</h1>
        <p className="text-sm text-slate-500 mt-2">This link may have expired or is invalid.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 md:py-12 md:px-4 py-0 px-0 selection:bg-slate-800 selection:text-white">
      <BrochureView itinerary={itinerary} isShare={true} shareSlug={slug as string} />
    </div>
  );
}
