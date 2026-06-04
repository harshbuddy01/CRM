import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';

export function BrochureView({ 
  itinerary, 
  query,
  isShare, 
  shareSlug 
}: { 
  itinerary: any; 
  query?: any;
  isShare?: boolean; 
  shareSlug?: string; 
}) {
  const [token, setToken] = React.useState<string | null>(null);
  const [loadingToken, setLoadingToken] = React.useState(!isShare);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = useAuthStore.getState().accessToken || localStorage.getItem('token');
      setToken(storedToken);
      setLoadingToken(false);
    }
  }, [isShare]);

  if (!itinerary) return null;

  if (loadingToken) {
    return (
      <div className="w-full max-w-[1000px] mx-auto shadow-2xl relative overflow-hidden rounded-3xl border border-slate-100 bg-white flex items-center justify-center" style={{ height: '88vh' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Securing connection...</span>
        </div>
      </div>
    );
  }

  const baseURL = api.defaults.baseURL || '';
  const iframeSrc = isShare && (shareSlug || itinerary.shareSlug || itinerary.slug)
    ? `${baseURL}/itineraries/share/${shareSlug || itinerary.shareSlug || itinerary.slug}/html`
    : `${baseURL}/itineraries/${itinerary.id}/html?token=${token || ''}`;

  return (
    <div className="w-full max-w-[1000px] mx-auto shadow-2xl relative overflow-hidden md:rounded-3xl rounded-none border-0 md:border border-slate-100 bg-white h-screen md:h-[88vh]">
      <iframe 
        src={iframeSrc} 
        className="w-full h-full border-0" 
        title={`Preview - ${itinerary.title}`} 
      />
    </div>
  );
}
