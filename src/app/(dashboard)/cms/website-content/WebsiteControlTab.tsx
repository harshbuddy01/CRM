'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Play, Plus, Trash2, Loader2, X, Check, Upload, Image as ImageIcon, 
  MapPin, HelpCircle, ArrowRight, Eye, Video, Compass, Sparkles, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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
        toast.success('File uploaded successfully!');
      } else {
        toast.error('Invalid upload response format');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
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
        className="h-8 text-xs font-bold rounded-lg border-slate-300 hover:bg-slate-50 transition-colors"
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

// ─── Main Tab Component ───
export default function WebsiteControlTab() {
  const qc = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'odyssey' | 'destinations' | 'activities' | 'villas' | 'inside-pages'>('hero');

  // Fetch full configuration & destinations list
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['wc-configs'],
    queryFn: () => api.get('/website-config/public').then(r => r.data.data),
  });

  const { data: destinationsList = [], isLoading: destsLoading } = useQuery({
    queryKey: ['wc-destinations-list'],
    queryFn: () => api.get('/masters/destinations').then(r => r.data.data),
  });

  const config = configData?.config || {};
  const destinationsCms = configData?.destinations || [];

  // Mutations
  const updateSectionMut = useMutation({
    mutationFn: ({ section, data }: { section: string; data: any }) => 
      api.put(`/website-configs/cms/${section}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['wc-configs'] });
      toast.success(`Homepage section "${variables.section}" saved successfully!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save section settings');
    }
  });

  const updateDestCmsMut = useMutation({
    mutationFn: ({ destId, data }: { destId: string; data: any }) =>
      api.put(`/website-configs/destinations/${destId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wc-configs'] });
      toast.success('Destination Inside Page saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save Destination Inside Page');
    }
  });

  // ─── Sub-Tab 1: Hero Video / Banners Editor ───
  function HeroEditor() {
    const initialHero = config.hero || {
      useVideo: true,
      videoUrl1: 'https://media.imagicaholidays.com/imagica-assets/hero-1-hq-compressed.mp4',
      videoUrl2: 'https://media.imagicaholidays.com/imagica-assets/hero-1-hq-compressed.mp4',
      fallbackSlides: [
        { title: 'Sacred Serenity', subtitle: 'Discover the peace within.', image: '', location: 'Varanasi' }
      ]
    };

    const [form, setForm] = useState(initialHero);

    const handleSave = () => {
      updateSectionMut.mutate({ section: 'hero', data: form });
    };

    const addSlide = () => {
      setForm((f: any) => ({
        ...f,
        fallbackSlides: [...(f.fallbackSlides || []), { title: '', subtitle: '', image: '', location: '' }]
      }));
    };

    const removeSlide = (idx: number) => {
      setForm((f: any) => ({
        ...f,
        fallbackSlides: f.fallbackSlides.filter((_: any, i: number) => i !== idx)
      }));
    };

    const updateSlide = (idx: number, key: string, val: any) => {
      setForm((f: any) => {
        const list = [...f.fallbackSlides];
        list[idx] = { ...list[idx], [key]: val };
        return { ...f, fallbackSlides: list };
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Hero Section Banners & Video loop</h3>
            <p className="text-xs text-muted-foreground">Manage the background loop of the homepage hero banner.</p>
          </div>
          <Button onClick={handleSave} disabled={updateSectionMut.isPending} size="sm">
            {updateSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
            Save Hero
          </Button>
        </div>

        <div className="bg-slate-50/50 rounded-xl border p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Background Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="radio" checked={form.useVideo === true} onChange={() => setForm((f: any) => ({ ...f, useVideo: true }))} />
                Cloudflare R2 Video Loop
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="radio" checked={form.useVideo === false} onChange={() => setForm((f: any) => ({ ...f, useVideo: false }))} />
                Image Banner Slideshow (Fallback)
              </label>
            </div>
          </div>

          {form.useVideo ? (
            <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Video Loop 1</Label>
                <div className="flex gap-2">
                  <Input value={form.videoUrl1} onChange={e => setForm((f: any) => ({ ...f, videoUrl1: e.target.value }))} placeholder="https://..." className="flex-1" />
                  <R2UploadButton label="Upload Video" accept="video/*" section="hero" onUploaded={url => setForm((f: any) => ({ ...f, videoUrl1: url }))} />
                </div>
                {form.videoUrl1 && (
                  <video src={form.videoUrl1} controls className="w-full h-32 rounded-lg bg-black object-cover mt-2" />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Video Loop 2 (Transition loop)</Label>
                <div className="flex gap-2">
                  <Input value={form.videoUrl2} onChange={e => setForm((f: any) => ({ ...f, videoUrl2: e.target.value }))} placeholder="https://..." className="flex-1" />
                  <R2UploadButton label="Upload Video" accept="video/*" section="hero" onUploaded={url => setForm((f: any) => ({ ...f, videoUrl2: url }))} />
                </div>
                {form.videoUrl2 && (
                  <video src={form.videoUrl2} controls className="w-full h-32 rounded-lg bg-black object-cover mt-2" />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Image Slideshow Banners</Label>
                <Button variant="outline" size="sm" onClick={addSlide}><Plus className="w-3.5 h-3.5 mr-1" /> Add Slide</Button>
              </div>

              <div className="space-y-3">
                {form.fallbackSlides?.map((slide: any, idx: number) => (
                  <Card key={idx} className="p-4 bg-white border border-slate-200 grid md:grid-cols-[1fr_2fr_auto] gap-4 items-center">
                    <div className="relative w-full h-24 bg-slate-100 rounded-lg overflow-hidden border">
                      {slide.image ? (
                        <img src={slide.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={slide.title} onChange={e => updateSlide(idx, 'title', e.target.value)} placeholder="Slide Title" />
                        <Input value={slide.location} onChange={e => updateSlide(idx, 'location', e.target.value)} placeholder="Location Badge" />
                      </div>
                      <Input value={slide.subtitle} onChange={e => updateSlide(idx, 'subtitle', e.target.value)} placeholder="Slide Subtitle" />
                      <div className="flex gap-2 items-center">
                        <Input value={slide.image} onChange={e => updateSlide(idx, 'image', e.target.value)} placeholder="Image URL" className="flex-1 text-xs" />
                        <R2UploadButton label="Upload" section="hero" onUploaded={url => updateSlide(idx, 'image', url)} />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeSlide(idx)}><Trash2 className="w-4 h-4" /></Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Sub-Tab 2: Himalayan Odyssey Editor ───
  function OdysseyEditor() {
    const initialOdyssey = config.odyssey || {
      title: 'A Himalayan Odyssey',
      subtitle: 'Exquisite Locations',
      spots: []
    };

    const [form, setForm] = useState(initialOdyssey);

    const handleSave = () => {
      updateSectionMut.mutate({ section: 'odyssey', data: form });
    };

    const addSpot = () => {
      setForm((f: any) => ({
        ...f,
        spots: [...(f.spots || []), { name: '', location: '', image: '' }]
      }));
    };

    const removeSpot = (idx: number) => {
      setForm((f: any) => ({
        ...f,
        spots: f.spots.filter((_: any, i: number) => i !== idx)
      }));
    };

    const updateSpot = (idx: number, key: string, val: any) => {
      setForm((f: any) => {
        const list = [...f.spots];
        list[idx] = { ...list[idx], [key]: val };
        return { ...f, spots: list };
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Himalayan Odyssey (Attractive Spots)</h3>
            <p className="text-xs text-muted-foreground">Manage the heading titles and carousel of locations on your homepage.</p>
          </div>
          <Button onClick={handleSave} disabled={updateSectionMut.isPending} size="sm">
            {updateSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
            Save Odyssey
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Main Title Segment</Label>
            <Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Odyssey" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subtitle Segment</Label>
            <Input value={form.subtitle} onChange={e => setForm((f: any) => ({ ...f, subtitle: e.target.value }))} placeholder="Exquisite Locations" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-t pt-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Carousel Spots List</Label>
            <Button variant="outline" size="sm" onClick={addSpot}><Plus className="w-3.5 h-3.5 mr-1" /> Add Location Spot</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {form.spots?.map((spot: any, idx: number) => (
              <Card key={idx} className="p-4 bg-white border border-slate-200 flex flex-col gap-3 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8 hover:bg-red-50" onClick={() => removeSpot(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border">
                  {spot.image ? (
                    <img src={spot.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={spot.name} onChange={e => updateSpot(idx, 'name', e.target.value)} placeholder="Spot Name (e.g. Tiger Hill)" />
                    <Input value={spot.location} onChange={e => updateSpot(idx, 'location', e.target.value)} placeholder="District/City" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input value={spot.image} onChange={e => updateSpot(idx, 'image', e.target.value)} placeholder="Image URL" className="flex-1 text-xs" />
                    <R2UploadButton label="Upload Photo" section="spots" onUploaded={url => updateSpot(idx, 'image', url)} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Sub-Tab 3: Destinations Carousel Editor ───
  function DestinationsEditor() {
    const initialDestinations = config.destinations || [];
    const [list, setList] = useState(initialDestinations);

    const handleSave = () => {
      updateSectionMut.mutate({ section: 'destinations', data: list });
    };

    const addDestination = () => {
      setList((d: any) => [...d, { id: '', title: '', tagline: '', description: '', link: '', mainImage: '', overlayImage: '' }]);
    };

    const removeDestination = (idx: number) => {
      setList((d: any) => d.filter((_: any, i: number) => i !== idx));
    };

    const updateDest = (idx: number, key: string, val: any) => {
      setList((d: any) => {
        const updated = [...d];
        updated[idx] = { ...updated[idx], [key]: val };
        return updated;
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Featured Destinations Grid</h3>
            <p className="text-xs text-muted-foreground">Manage the main cards carousel of locations on your website home page.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addDestination}><Plus className="w-3.5 h-3.5 mr-1" /> Add Card</Button>
            <Button onClick={handleSave} disabled={updateSectionMut.isPending} size="sm">
              {updateSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
              Save Grid
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {list.map((dest: any, idx: number) => (
            <Card key={idx} className="p-5 bg-slate-50/50 border border-slate-200 grid md:grid-cols-[1.5fr_3fr_auto] gap-6 items-start relative">
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-red-500 h-8 w-8 hover:bg-red-50" onClick={() => removeDestination(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Main Poster Photo</Label>
                  <div className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden border">
                    {dest.mainImage ? <img src={dest.mainImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                  </div>
                  <div className="flex gap-1 items-center mt-2">
                    <R2UploadButton label="Upload Poster" section="destinations" onUploaded={url => updateDest(idx, 'mainImage', url)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Overlay Grayscale Photo</Label>
                  <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden border">
                    {dest.overlayImage ? <img src={dest.overlayImage} className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                  </div>
                  <div className="flex gap-1 items-center mt-2">
                    <R2UploadButton label="Upload Overlay" section="destinations" onUploaded={url => updateDest(idx, 'overlayImage', url)} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-semibold">Slug/ID *</Label>
                    <Input value={dest.id} onChange={e => updateDest(idx, 'id', e.target.value)} placeholder="gangtok" required />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs text-muted-foreground font-semibold">Display Title *</Label>
                    <Input value={dest.title} onChange={e => updateDest(idx, 'title', e.target.value)} placeholder="Gangtok" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-semibold">Tagline</Label>
                    <Input value={dest.tagline} onChange={e => updateDest(idx, 'tagline', e.target.value)} placeholder="Where Tradition Meets Tranquility" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-semibold">Navigation Link</Label>
                    <Input value={dest.link} onChange={e => updateDest(idx, 'link', e.target.value)} placeholder="/destinations/gangtok" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Description</Label>
                  <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={dest.description} onChange={e => updateDest(idx, 'description', e.target.value)} placeholder="Detailed editorial info..." />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Sub-Tab 4: Activities Section Editor ───
  function ActivitiesEditor() {
    const initialActivities = config.activities || [];
    const [list, setList] = useState(initialActivities);

    const handleSave = () => {
      updateSectionMut.mutate({ section: 'activities', data: list });
    };

    const addActivity = () => {
      setList((d: any) => [...d, { title: '', subtitle: '', image: '', alt: '' }]);
    };

    const removeActivity = (idx: number) => {
      setList((d: any) => d.filter((_: any, i: number) => i !== idx));
    };

    const updateAct = (idx: number, key: string, val: any) => {
      setList((d: any) => {
        const updated = [...d];
        updated[idx] = { ...updated[idx], [key]: val };
        return updated;
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Activities & Local Food Section</h3>
            <p className="text-xs text-muted-foreground">Manage the activities hover panels displayed on the homepage.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addActivity}><Plus className="w-3.5 h-3.5 mr-1" /> Add Panel</Button>
            <Button onClick={handleSave} disabled={updateSectionMut.isPending} size="sm">
              {updateSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
              Save Activities
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map((act: any, idx: number) => (
            <Card key={idx} className="p-4 bg-white border border-slate-200 grid md:grid-cols-[1fr_2fr_auto] gap-4 items-center relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8 hover:bg-red-50" onClick={() => removeActivity(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border">
                {act.image ? <img src={act.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>}
              </div>

              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={act.title} onChange={e => updateAct(idx, 'title', e.target.value)} placeholder="Activity Name" />
                  <Input value={act.subtitle} onChange={e => updateAct(idx, 'subtitle', e.target.value)} placeholder="Subtitle Category" />
                </div>
                <div className="flex gap-2 items-center">
                  <Input value={act.image} onChange={e => updateAct(idx, 'image', e.target.value)} placeholder="Image URL" className="flex-1 text-xs" />
                  <R2UploadButton label="Upload Photo" section="activities" onUploaded={url => updateAct(idx, 'image', url)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Sub-Tab 5: Villas / Exclusive Stay Editor ───
  function VillasEditor() {
    const initialVillas = config.villas || [];
    const [list, setList] = useState(initialVillas);

    const handleSave = () => {
      updateSectionMut.mutate({ section: 'villas', data: list });
    };

    const addVilla = () => {
      setList((d: any) => [...d, { id: '', title: '', description: '', image: '' }]);
    };

    const removeVilla = (idx: number) => {
      setList((d: any) => d.filter((_: any, i: number) => i !== idx));
    };

    const updateVil = (idx: number, key: string, val: any) => {
      setList((d: any) => {
        const updated = [...d];
        updated[idx] = { ...updated[idx], [key]: val };
        return updated;
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Exclusive Stay / Villas</h3>
            <p className="text-xs text-muted-foreground">Manage the slideshow of luxury Vela Villas on the homepage.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addVilla}><Plus className="w-3.5 h-3.5 mr-1" /> Add Villa</Button>
            <Button onClick={handleSave} disabled={updateSectionMut.isPending} size="sm">
              {updateSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
              Save Villas
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {list.map((vil: any, idx: number) => (
            <Card key={idx} className="p-4 bg-white border border-slate-200 grid md:grid-cols-[1.2fr_3fr_auto] gap-4 items-start relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8 hover:bg-red-50" onClick={() => removeVilla(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="space-y-2">
                <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border">
                  {vil.image ? <img src={vil.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                </div>
                <R2UploadButton label="Upload Photo" section="villas" onUploaded={url => updateVil(idx, 'image', url)} />
              </div>

              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={vil.id} onChange={e => updateVil(idx, 'id', e.target.value)} placeholder="Villa ID (e.g. v1)" />
                  <Input value={vil.title} onChange={e => updateVil(idx, 'title', e.target.value)} placeholder="Villa Title" />
                </div>
                <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={vil.description} onChange={e => updateVil(idx, 'description', e.target.value)} placeholder="Villa description/tagline..." />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Sub-Tab 6: Destination Inside Pages Editor (Cover + Attractions) ───
  function InsidePagesEditor() {
    const [selectedDestId, setSelectedDestId] = useState<string>('');
    const [pageForm, setPageForm] = useState({
      aboutHtml: '',
      heroImage: '',
      seoTitle: '',
      seoDesc: '',
      isPublished: true,
      pageContent: {
        heroImage: '',
        attractions: [] as Array<{ name: string; tag: string; image: string; short: string }>
      }
    });

    // Load CMS settings when destinationId changes
    useEffect(() => {
      if (!selectedDestId) return;

      const cmsDetails = destinationsCms.find((d: any) => d.destinationId === selectedDestId);
      if (cmsDetails) {
        setPageForm({
          aboutHtml: cmsDetails.aboutHtml || '',
          heroImage: cmsDetails.heroImage || '',
          seoTitle: cmsDetails.seoTitle || '',
          seoDesc: cmsDetails.seoDesc || '',
          isPublished: cmsDetails.isPublished ?? true,
          pageContent: cmsDetails.pageContent || { heroImage: '', attractions: [] }
        });
      } else {
        // Fallback defaults
        setPageForm({
          aboutHtml: '',
          heroImage: '',
          seoTitle: '',
          seoDesc: '',
          isPublished: true,
          pageContent: { heroImage: '', attractions: [] }
        });
      }
    }, [selectedDestId, configData]);

    const handleSave = () => {
      if (!selectedDestId) {
        toast.error('Please select a destination first');
        return;
      }
      updateDestCmsPage(selectedDestId, pageForm);
    };

    const updateDestCmsPage = async (destId: string, data: any) => {
      updateDestCmsMut.mutate({ destId, data });
    };

    const addAttraction = () => {
      setPageForm((f: any) => ({
        ...f,
        pageContent: {
          ...f.pageContent,
          attractions: [...(f.pageContent.attractions || []), { name: '', tag: 'Nature', image: '', short: '' }]
        }
      }));
    };

    const removeAttraction = (idx: number) => {
      setPageForm((f: any) => ({
        ...f,
        pageContent: {
          ...f.pageContent,
          attractions: f.pageContent.attractions.filter((_: any, i: number) => i !== idx)
        }
      }));
    };

    const updateAttraction = (idx: number, key: string, val: any) => {
      setPageForm((f: any) => {
        const list = [...f.pageContent.attractions];
        list[idx] = { ...list[idx], [key]: val };
        return {
          ...f,
          pageContent: { ...f.pageContent, attractions: list }
        };
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Destination Inside Page Editor</h3>
            <p className="text-xs text-muted-foreground">Select a destination to customize its cover photo and tourist attraction details.</p>
          </div>
          {selectedDestId && (
            <Button onClick={handleSave} disabled={updateDestCmsMut.isPending} size="sm">
              {updateDestCmsMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
              Save Page Settings
            </Button>
          )}
        </div>

        {/* Dropdown Selector */}
        <div className="space-y-1.5 max-w-sm">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Destination</Label>
          <select 
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            value={selectedDestId}
            onChange={e => setSelectedDestId(e.target.value)}
          >
            <option value="">-- Choose a Destination --</option>
            {destinationsList.map((dest: any) => (
              <option key={dest.id} value={dest.id}>{dest.name}</option>
            ))}
          </select>
        </div>

        {selectedDestId ? (
          <div className="space-y-6 border-t pt-4">
            
            {/* Cover photo uploader */}
            <div className="bg-slate-50/50 rounded-xl border p-5 grid md:grid-cols-[1.5fr_3fr] gap-6 items-center">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destination Page Cover Photo</Label>
                <div className="relative w-full h-36 bg-slate-100 rounded-lg overflow-hidden border">
                  {pageForm.pageContent.heroImage || pageForm.heroImage ? (
                    <img src={pageForm.pageContent.heroImage || pageForm.heroImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>
                  )}
                </div>
                <R2UploadButton 
                  label="Upload Cover Image" 
                  section="destinations" 
                  onUploaded={url => setPageForm((f: any) => ({
                    ...f,
                    heroImage: url,
                    pageContent: { ...f.pageContent, heroImage: url }
                  }))} 
                />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">SEO Title</Label>
                    <Input value={pageForm.seoTitle} onChange={e => setPageForm((f: any) => ({ ...f, seoTitle: e.target.value }))} placeholder="Title for browser search tab" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">SEO Meta Description</Label>
                    <Input value={pageForm.seoDesc} onChange={e => setPageForm((f: any) => ({ ...f, seoDesc: e.target.value }))} placeholder="Brief summary for Google search" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">About Description HTML</Label>
                  <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={pageForm.aboutHtml} onChange={e => setPageForm((f: any) => ({ ...f, aboutHtml: e.target.value }))} placeholder="Detailed text about this holiday destination..." />
                </div>
              </div>
            </div>

            {/* Attractions Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tourist Attractions List</Label>
                <Button variant="outline" size="sm" onClick={addAttraction}><Plus className="w-3.5 h-3.5 mr-1" /> Add Attraction</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {pageForm.pageContent.attractions?.map((attr: any, idx: number) => (
                  <Card key={idx} className="p-4 bg-white border border-slate-200 flex flex-col gap-3 relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8 hover:bg-red-50" onClick={() => removeAttraction(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border">
                      {attr.image ? (
                        <img src={attr.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={attr.name} onChange={e => updateAttraction(idx, 'name', e.target.value)} placeholder="Attraction Name" />
                        <Input value={attr.tag} onChange={e => updateAttraction(idx, 'tag', e.target.value)} placeholder="Category Tag (e.g. Nature)" />
                      </div>
                      <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[50px] text-xs" value={attr.short} onChange={e => updateAttraction(idx, 'short', e.target.value)} placeholder="Short description..." />
                      <div className="flex gap-2 items-center">
                        <Input value={attr.image} onChange={e => updateAttraction(idx, 'image', e.target.value)} placeholder="Photo URL" className="flex-1 text-xs" />
                        <R2UploadButton label="Upload Photo" section="destinations" onUploaded={url => updateAttraction(idx, 'image', url)} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="border-2 border-dashed rounded-xl py-12 text-center text-slate-400 font-medium bg-slate-50/20">
            <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Please select a destination above to open its cover photo and attractions list editor.
          </div>
        )}
      </div>
    );
  }

  // ─── Tab Rendering ───
  const subTabs = [
    { id: 'hero', label: 'Hero Banner & Video', icon: Video },
    { id: 'odyssey', label: 'Himalayan Odyssey', icon: Sparkles },
    { id: 'destinations', label: 'Featured Grid', icon: LayoutGrid },
    { id: 'activities', label: 'Activities', icon: Compass },
    { id: 'villas', label: 'Villas & Stays', icon: ImageIcon },
    { id: 'inside-pages', label: 'Destination Pages', icon: MapPin },
  ] as const;

  if (configLoading || destsLoading) {
    return (
      <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    );
  }

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-8">
      {/* Sidebar Navigation */}
      <div className="flex flex-col gap-1 border-r pr-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black px-3 mb-2">Sections Control</p>
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Form workspace */}
      <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[400px]">
        {activeSubTab === 'hero' && <HeroEditor />}
        {activeSubTab === 'odyssey' && <OdysseyEditor />}
        {activeSubTab === 'destinations' && <DestinationsEditor />}
        {activeSubTab === 'activities' && <ActivitiesEditor />}
        {activeSubTab === 'villas' && <VillasEditor />}
        {activeSubTab === 'inside-pages' && <InsidePagesEditor />}
      </div>
    </div>
  );
}
