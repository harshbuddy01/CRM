'use client';

import React from 'react';
import DOMPurify from 'dompurify';
import { Sun, Hotel, Utensils, Mountain, Compass, Car, Plane, LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

function getSafeImageUrl(url: string) {
  if (!url) return '';
  let processedUrl = url.startsWith('//') ? `https:${url}` : url;
  if (processedUrl.includes('res.cloudinary.com')) {
    processedUrl = processedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_900/');
  }
  return processedUrl;
}

export function BrochureView({ itinerary, query }: { itinerary: any, query?: any }) {
  if (!itinerary) return null;

  const days = itinerary.days || [];
  const destinationsArray = Array.from(new Set(days.map((d: any) => d.destination?.name).filter(Boolean))) as string[];
  const destinations = destinationsArray.join(' • ') || itinerary.title || query?.destination || 'TBD';
  const departurePoint = query?.pickupLocation || days[0]?.destination?.name || 'TBD';

  const fromDate = itinerary.travelDateFrom || query?.travelDateFrom;
  const toDate = itinerary.travelDateTo || query?.travelDateTo;
  
  let dateString = 'Season TBD';
  if (fromDate && toDate) {
    const fromStr = new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const toStr = new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    dateString = `${fromStr} - ${toStr}`;
  }

  const coverImageUrl = itinerary.coverPhotoUrl 
    ? getSafeImageUrl(itinerary.coverPhotoUrl) 
    : 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2674&auto=format&fit=crop';

  const sanitize = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html);
  };

  const titleFallback = itinerary.title || query?.destination || 'TRAVEL ITINERARY';

  return (
    <div className="bg-white w-full max-w-[1200px] mx-auto shadow-2xl relative">
      {/* Playfair Font import specifically for the brochure display */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
      `}} />

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[500px] overflow-hidden bg-slate-900 pointer-events-none">
        <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover opacity-80 select-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            className="text-white text-5xl md:text-7xl font-black uppercase tracking-widest text-center px-4 md:px-12 leading-tight select-none"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 8px 8px 30px rgba(0,0,0,0.8)" 
            }}
          >
            {titleFallback}
          </h1>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="w-full h-4 bg-[#454545] mb-8" />
      <div className="flex flex-col md:flex-row justify-between px-8 md:px-16 pb-8 border-b border-black/10 mb-10">
        <div className="font-serif text-lg mb-4 md:mb-0">
          <span className="font-bold">Departure :</span> 
          <span className="border-b border-slate-400 inline-block min-w-[150px] px-2 text-slate-700">{departurePoint}</span>
        </div>
        <div className="font-serif text-lg text-right">
          <span className="font-bold">Date :</span> 
          <span className="border-b border-slate-400 inline-block min-w-[150px] px-2 text-slate-700">{dateString}</span>
        </div>
      </div>

      {/* BRAND & CONTACT IDENTITY SECTION */}
      <div className="px-8 md:px-16 pb-16 text-center">
        <div className="font-serif text-3xl font-black text-[#111] tracking-[4px] uppercase mb-8">
          Imagica Holidays
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-16 font-sans text-sm text-[#444] font-medium">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-6 h-6" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Email" className="w-6 h-6" />
            <span>contact@imagicaholidays.com</span>
          </div>
        </div>
      </div>

      {/* Content Iteration */}
      <div className="px-8 md:px-16 pb-20 space-y-24">
        {days.map((day: any, dIdx: number) => {
          const isEven = (dIdx + 1) % 2 === 0;
          const events = day.events || [];
          let archImageUrl = day.imageUrl || (events.find((e: any) => e.imageUrl)?.imageUrl);
          archImageUrl = archImageUrl ? getSafeImageUrl(archImageUrl) : 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop';
          
          const activities = events.filter((e: any) => e.type !== 'accommodation' && e.type !== 'transport');
          const stays = events.filter((e: any) => e.type === 'accommodation');
          const trans = events.filter((e: any) => e.type === 'transport');

          let dayDateLabel = '';
          if (fromDate) {
            const d = new Date(fromDate);
            d.setDate(d.getDate() + (day.dayNumber - 1));
            dayDateLabel = ' (' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ')';
          }

          const desc = day.description || '';

          return (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              key={day.id} 
              className={`flex flex-col md:flex-row gap-10 items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
            >
              
              <div className="w-full md:w-[40%] shrink-0 text-center">
                <img src={archImageUrl} alt={`Day ${day.dayNumber}`} className="w-[85%] mx-auto h-[450px] md:h-[500px] object-cover rounded-[180px] rounded-b-none shadow-xl border border-slate-100 select-none pointer-events-none" />
              </div>
              
              <div className="w-full md:w-[60%] text-left pt-6">
                <div className="border-b-[1.5px] border-[#111] pb-3 mb-6">
                  <h2 className="text-2xl uppercase tracking-widest font-bold text-slate-800">
                    <span className="text-[#8b6e4b] mr-3">DAY {day.dayNumber}{dayDateLabel} :</span>
                    {day.title || destinations}
                  </h2>
                </div>

                <div 
                  className="w-full text-[13px] leading-relaxed text-slate-600 block" 
                  style={{ columnCount: 2, columnGap: '30px', columnRule: '1px solid #e2e8f0', widows: 2, orphans: 2, textAlign: 'left' }}
                >
                  {desc && <p className="mb-4" style={{ breakInside: 'avoid-column' }}>{desc}</p>}
                  {activities.map((ev: any) => (
                    <div key={ev.id} className="mb-4" style={{ breakInside: 'avoid-column' }}>
                      <div className="flex items-start gap-2 text-slate-800 font-medium leading-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b6e4b] mt-[5px] shrink-0" /> 
                        <strong>{ev.title}</strong>
                      </div>
                      {ev.description && (
                        <div className="pl-[14px] mt-1 text-[11px] text-slate-500 leading-snug">
                          {ev.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Event Embedded Cards Matching PDF */}
                <div className="mt-10 space-y-4">
                  {stays.map((stay: any) => (
                    <div key={stay.id} className="flex items-center bg-[#fafafa] border border-slate-200 rounded-sm overflow-hidden shadow-sm h-[100px]">
                      {stay.imageUrl ? (
                        <img src={getSafeImageUrl(stay.imageUrl)} className="w-[100px] h-full object-cover shrink-0 select-none" alt="" />
                      ) : (
                        <div className="w-[100px] h-full bg-slate-200 flex items-center justify-center shrink-0">
                          <Hotel className="w-8 h-8 text-slate-400 opacity-50" />
                        </div>
                      )}
                      <div className="p-4 flex-1">
                        <div className="text-[9px] text-[#8b6e4b] font-black uppercase tracking-widest mb-1">Sanctuary</div>
                        <div className="font-serif text-[15px] font-bold text-slate-800 leading-tight truncate max-w-[200px] md:max-w-[300px]">
                          {stay.metadata?.hotelName || stay.title}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
                          {stay.metadata?.roomType || stay.metadata?.roomCategory || 'Standard Room'} 
                          {stay.metadata?.mealPlan ? ` • ${stay.metadata.mealPlan}` : ''}
                        </div>
                        {stay.description && (
                          <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
                            {stay.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {trans.map((tr: any) => (
                    <div key={tr.id} className="flex items-center bg-[#fafafa] border border-slate-200 rounded-sm overflow-hidden shadow-sm h-[100px]">
                      {tr.imageUrl ? (
                        <img src={getSafeImageUrl(tr.imageUrl)} className="w-[100px] h-full object-cover shrink-0 select-none" alt="" />
                      ) : (
                        <div className="w-[100px] h-full bg-slate-200 flex items-center justify-center shrink-0">
                          <Car className="w-8 h-8 text-slate-400 opacity-50" />
                        </div>
                      )}
                      <div className="p-4 flex-1">
                        <div className="text-[9px] text-[#8b6e4b] font-black uppercase tracking-widest mb-1">Expedition Vector</div>
                        <div className="font-serif text-[15px] font-bold text-slate-800 leading-tight truncate max-w-[200px] md:max-w-[300px]">
                          {tr.title}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
                          {tr.metadata?.vehicle || 'Standard Vehicle'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Package Terms Footer */}
      {(itinerary.packageTerms) && (
        <div className="bg-[#111] text-white p-12 md:p-20 text-center relative z-10 w-full mb-0">
            <h2 className="text-3xl font-serif text-[#d4af37] mb-12 uppercase tracking-widest text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Package Terms</h2>
            <div 
              className="prose prose-invert prose-sm max-w-4xl mx-auto text-slate-300 font-sans text-left 
              prose-h3:text-[#8b6e4b] prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest 
              prose-ul:text-[13px] prose-p:text-[13px] prose-li:my-1 prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: sanitize(itinerary.packageTerms) }}
            />
        </div>
      )}
    </div>
  );
}
