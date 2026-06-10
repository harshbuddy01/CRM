'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, X, Check, ChevronDown, ChevronUp, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Direct File Upload Component ───
interface R2UploadButtonProps {
  label: string;
  onUploaded: (url: string) => void;
  accept?: string;
  section?: string;
}

function R2UploadButton({ label, onUploaded, accept = 'image/*', section = 'general' }: R2UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/website-configs/cms/upload?section=${section}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.url) {
        onUploaded(res.data.url);
        toast.success('Uploaded successfully!');
      } else {
        toast.error('Invalid response format');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="h-8 text-xs font-bold"
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
        )}
        {label}
      </Button>
    </div>
  );
}

function DayForm({ day, onSave, onCancel, saving }: any) {
  const [f, setF] = useState({
    dayNumber: day?.dayNumber || 1,
    title: day?.title || '',
    date: day?.date || '',
    time: day?.time || '',
    description: day?.description || '',
    image: day?.image || '',
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Day #</Label>
          <Input type="number" value={f.dayNumber} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('dayNumber', Number.isFinite(parsed) ? parsed : f.dayNumber);
          }} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Title *</Label>
          <Input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Discover Gangtok" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</Label>
          <Input value={f.date} onChange={e => set('date', e.target.value)} placeholder="1 Nov" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Time</Label>
          <Input value={f.time} onChange={e => set('time', e.target.value)} placeholder="Arrival 12:00" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Description</Label>
        <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={f.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Image</Label>
        <div className="flex gap-2 items-center">
          <Input value={f.image} onChange={e => set('image', e.target.value)} placeholder="https://..." className="flex-1" />
          <R2UploadButton
            label="Upload Image"
            onUploaded={(url) => set('image', url)}
            section="journeys"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={saving || !f.title} onClick={() => onSave(f)}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}Save Day
        </Button>
      </div>
    </div>
  );
}

function JourneyForm({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    slug: initial?.slug || '',
    title: initial?.title || '',
    regions: initial?.regions || '',
    durationNights: initial?.durationNights || 1,
    durationDays: initial?.durationDays || 2,
    pricePerGuest: initial?.pricePerGuest || 25000,
    originalPrice: initial?.originalPrice || 30000,
    departurePort: initial?.departurePort || '',
    returnPort: initial?.returnPort || '',
    departureDate: initial?.departureDate || '',
    returnDate: initial?.returnDate || '',
    ports: initial?.ports || 2,
    countries: initial?.countries || 1,
    vehicle: initial?.vehicle || 'Premium SUV',
    badges: JSON.stringify(initial?.badges || ['SIKKIM']),
    images: JSON.stringify(initial?.images || []),
    mapImage: initial?.mapImage || '',
    overview: initial?.overview || '',
    isActive: initial?.isActive ?? true,
    sequence: initial?.sequence || 0,
    seoTitle: initial?.seoTitle || '',
    seoDescription: initial?.seoDescription || '',
    seoKeywords: initial?.seoKeywords || '',
  });
  const [saving, setSaving] = useState(false);
  const [showDayForm, setShowDayForm] = useState(false);
  const [editingDay, setEditingDay] = useState<any>(null);
  const [daySaving, setDaySaving] = useState(false);
  const [dayDeleting, setDayDeleting] = useState(false);
  const [showRawImages, setShowRawImages] = useState(false);
  const qc = useQueryClient();
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse badges and images from JSON strings before sending
      let parsedBadges = form.badges;
      let parsedImages = form.images;
      try {
        parsedBadges = typeof form.badges === 'string' ? JSON.parse(form.badges) : form.badges;
      } catch (jsonErr: any) {
        toast.error(`Invalid JSON in badges: ${jsonErr.message}`);
        setSaving(false);
        return;
      }
      try {
        parsedImages = typeof form.images === 'string' ? JSON.parse(form.images) : form.images;
      } catch (jsonErr: any) {
        toast.error(`Invalid JSON in images: ${jsonErr.message}`);
        setSaving(false);
        return;
      }
      const payload = {
        ...form,
        badges: parsedBadges,
        images: parsedImages,
      };
      if (initial) await api.put(`/website-content/journeys/${initial.id}`, payload);
      else await api.post('/website-content/journeys', payload);
      toast.success(initial ? 'Journey updated!' : 'Journey created!');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const addDay = async (dayData: any) => {
    if (!initial?.id) { toast.error('Save journey first before adding days'); return; }
    setDaySaving(true);
    try {
      await api.post(`/website-content/journeys/${initial.id}/days`, dayData);
      toast.success('Day added!');
      qc.invalidateQueries({ queryKey: ['wc-journeys'] });
      onSaved();
      setShowDayForm(false);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDaySaving(false); }
  };

  const updateDay = async (dayData: any) => {
    setDaySaving(true);
    try {
      await api.put(`/website-content/journey-days/${editingDay.id}`, dayData);
      toast.success('Day updated!');
      qc.invalidateQueries({ queryKey: ['wc-journeys'] });
      onSaved();
      setEditingDay(null);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDaySaving(false); }
  };

  const removeDay = async (dayId: string) => {
    if (!confirm('Remove this day?')) return;
    setDayDeleting(true);
    try {
      await api.delete(`/website-content/journey-days/${dayId}`);
      toast.success('Day removed');
      qc.invalidateQueries({ queryKey: ['wc-journeys'] });
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to remove day'); }
    finally { setDayDeleting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{initial ? 'Edit Journey' : 'New Journey'}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Slug (URL ID) *</Label>
          <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="sikkim-journey-0" required />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title *</Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="2-Day Sikkim Explorer Escape" required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Region *</Label>
          <Input value={form.regions} onChange={e => set('regions', e.target.value)} placeholder="NORTH-EAST INDIA & SIKKIM" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Vehicle</Label>
          <Input value={form.vehicle} onChange={e => set('vehicle', e.target.value)} />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">💰 Pricing</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Price Per Guest (₹) *</Label>
            <Input type="number" value={form.pricePerGuest} onChange={e => {
              const parsed = parseInt(e.target.value, 10);
              set('pricePerGuest', Number.isFinite(parsed) ? parsed : form.pricePerGuest);
            }} />
            <input type="range" min="5000" max="100000" step="500" value={form.pricePerGuest} onChange={e => set('pricePerGuest', parseInt(e.target.value))} className="w-full mt-1" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Original Price (₹)</Label>
            <Input type="number" value={form.originalPrice} onChange={e => {
              const parsed = parseInt(e.target.value, 10);
              set('originalPrice', Number.isFinite(parsed) ? parsed : form.originalPrice);
            }} />
            <input type="range" min="5000" max="150000" step="500" value={form.originalPrice} onChange={e => set('originalPrice', parseInt(e.target.value))} className="w-full mt-1" />
          </div>
        </div>
      </div>

      {/* Duration & Ports */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nights</Label>
          <Input type="number" value={form.durationNights} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('durationNights', Number.isFinite(parsed) ? parsed : form.durationNights);
          }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Days</Label>
          <Input type="number" value={form.durationDays} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('durationDays', Number.isFinite(parsed) ? parsed : form.durationDays);
          }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ports</Label>
          <Input type="number" value={form.ports} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('ports', Number.isFinite(parsed) ? parsed : form.ports);
          }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Countries</Label>
          <Input type="number" value={form.countries} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('countries', Number.isFinite(parsed) ? parsed : form.countries);
          }} />
        </div>
      </div>

      {/* Route */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Departure Port *</Label>
          <Input value={form.departurePort} onChange={e => set('departurePort', e.target.value)} placeholder="Gangtok" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Return Port *</Label>
          <Input value={form.returnPort} onChange={e => set('returnPort', e.target.value)} placeholder="Lachung" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Departure Date</Label>
          <Input value={form.departureDate} onChange={e => set('departureDate', e.target.value)} placeholder="1 Nov 2026" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Return Date</Label>
          <Input value={form.returnDate} onChange={e => set('returnDate', e.target.value)} placeholder="3 Nov 2026" />
        </div>
      </div>

      {/* Badges & Images */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Badges (JSON array)</Label>
          <Input value={form.badges} onChange={e => set('badges', e.target.value)} placeholder='["SIKKIM"]' />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Map Image</Label>
          <div className="flex gap-2 items-center">
            <Input value={form.mapImage} onChange={e => set('mapImage', e.target.value)} placeholder="https://..." className="flex-1" />
            <R2UploadButton
              label="Upload Map"
              onUploaded={(url) => set('mapImage', url)}
              section="journeys"
            />
          </div>
          {form.mapImage && (
            <div className="relative w-20 h-16 border rounded bg-slate-100 overflow-hidden mt-1 group">
              <img src={form.mapImage} alt="Map preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => set('mapImage', '')}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Gallery Images</Label>
          <R2UploadButton
            label="Add Image to Gallery"
            section="journeys"
            onUploaded={(url) => {
              // Parse images list
              let currentList: string[] = [];
              try {
                currentList = typeof form.images === 'string' ? JSON.parse(form.images) : (form.images || []);
                if (!Array.isArray(currentList)) currentList = [];
              } catch (e) {
                currentList = [];
              }
              const newList = [...currentList, url];
              set('images', JSON.stringify(newList));
            }}
          />
        </div>
        
        {(() => {
          let currentList: string[] = [];
          try {
            currentList = typeof form.images === 'string' ? JSON.parse(form.images) : (form.images || []);
            if (!Array.isArray(currentList)) currentList = [];
          } catch (e) {
            currentList = [];
          }
          
          return currentList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-slate-50">
              {currentList.map((url, index) => (
                <div key={index} className="relative aspect-video rounded-md border bg-white overflow-hidden group shadow-sm">
                  <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const newList = currentList.filter((_, i) => i !== index);
                        set('images', JSON.stringify(newList));
                      }}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                      title="View full image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground bg-slate-50">
              No gallery images uploaded yet. Click the button above to upload.
            </div>
          );
        })()}

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowRawImages(!showRawImages)}
            className="text-[10px] text-slate-500 hover:underline"
          >
            {showRawImages ? 'Hide raw JSON editor' : 'Show raw JSON editor'}
          </button>
        </div>

        {showRawImages && (
          <div className="space-y-1 mt-1">
            <textarea
              className="w-full px-3 py-2 border rounded-md text-xs bg-background font-mono resize-y min-h-[60px]"
              value={form.images}
              onChange={e => set('images', e.target.value)}
              placeholder='["https://url1", "https://url2"]'
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Overview</Label>
        <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[80px]" value={form.overview} onChange={e => set('overview', e.target.value)} />
      </div>

      {/* SEO Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">🔍 SEO Optimization</p>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">SEO Title (Title Tag)</Label>
          <Input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="e.g. Premium Gangtok Tour Packages | Imagica Holidays" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">SEO Meta Description</Label>
          <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} placeholder="e.g. Plan your dream trip with our curated Gangtok tour packages. Premium hotels, transport, and customized itineraries." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">SEO Keywords (Comma separated)</Label>
          <Input value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} placeholder="e.g. Gangtok tour, Sikkim packages, Lachung trip" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Display Order</Label>
          <Input type="number" value={form.sequence} onChange={e => {
            const parsed = parseInt(e.target.value, 10);
            set('sequence', Number.isFinite(parsed) ? parsed : form.sequence);
          }} />
        </div>
        <label className="flex items-center gap-2 text-sm pt-6">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
          Active (visible on website)
        </label>
      </div>

      {/* Itinerary Days */}
      {initial && (
        <div className="border-t pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">Itinerary Days ({initial.days?.length || 0})</p>
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowDayForm(true); setEditingDay(null); }}>
              <Plus className="w-3 h-3 mr-1" /> Add Day
            </Button>
          </div>
          {initial.days?.map((d: any) => (
            editingDay?.id === d.id ? (
              <DayForm key={d.id} day={d} saving={daySaving} onSave={updateDay} onCancel={() => setEditingDay(null)} />
            ) : (
              <div key={d.id} className="flex items-center justify-between border rounded-lg p-3 mb-2 bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center">D{d.dayNumber}</span>
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.date} · {d.time}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingDay(d)}><Edit2 className="w-3 h-3" /></Button>
                  <Button type="button" variant="ghost" size="sm" className="text-red-500" disabled={dayDeleting} onClick={() => removeDay(d.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            )
          ))}
          {showDayForm && !editingDay && (
            <DayForm saving={daySaving} onSave={addDay} onCancel={() => setShowDayForm(false)} />
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
          {initial ? 'Update Journey' : 'Create Journey'}
        </Button>
      </div>
    </form>
  );
}

export default function JourneysTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: journeys, isLoading } = useQuery({
    queryKey: ['wc-journeys'],
    queryFn: () => api.get('/website-content/journeys').then(r => r.data.data),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/website-content/journeys/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wc-journeys'] }); toast.success('Journey deleted'); },
    onError: (error: any) => { console.error('Delete journey failed:', error); toast.error(error.response?.data?.message || 'Failed to delete journey'); },
  });

  const openEdit = (j: any) => { setEditing(j); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Manage journey packages displayed on your website. Edit pricing, itineraries, and more.</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Journey</Button>
      </div>

      {showForm && (
        <JourneyForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ['wc-journeys'] })}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !journeys?.length ? (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <p>No journeys yet. Create your first journey or run the seed script!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journeys.map((j: any) => (
            <div key={j.id} className="border rounded-xl bg-card hover:shadow-sm transition-shadow">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${j.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{j.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{j.regions}</span>
                      <span>·</span>
                      <span>{j.durationDays}D/{j.durationNights}N</span>
                      <span>·</span>
                      <span>{j.days?.length || 0} days</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{j.pricePerGuest?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground line-through">₹{j.originalPrice?.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === j.id ? null : j.id)}>
                      {expandedId === j.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(j)}><Edit2 className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm('Delete this journey?')) deleteMut.mutate(j.id); }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
              {expandedId === j.id && (
                <div className="px-5 pb-5 border-t pt-4">
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs block">Slug</span><span className="font-mono text-xs">{j.slug}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Route</span>{j.departurePort} → {j.returnPort}</div>
                    <div><span className="text-muted-foreground text-xs block">Dates</span>{j.departureDate} – {j.returnDate}</div>
                    <div><span className="text-muted-foreground text-xs block">Vehicle</span>{j.vehicle}</div>
                  </div>
                  {j.days?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-muted-foreground mb-2">ITINERARY</p>
                      <div className="grid md:grid-cols-3 gap-2">
                        {j.days.map((d: any) => (
                          <div key={d.id} className="bg-slate-50 rounded-lg p-3 text-xs">
                            <span className="font-bold">Day {d.dayNumber}:</span> {d.title}
                            <p className="text-muted-foreground mt-0.5">{d.date} · {d.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
