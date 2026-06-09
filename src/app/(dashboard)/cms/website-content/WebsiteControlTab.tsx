'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus, Trash2, Loader2, Check, Upload, Image as ImageIcon,
  MapPin, Video, Compass, Sparkles, LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />;
}
function PageSkeleton() {
  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-8">
      <div className="flex flex-col gap-2 border-r pr-6">
        <Skeleton className="h-3 w-24 mb-2" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-72" />
        <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// ─── R2 Upload Button ─────────────────────────────────────────────────────────
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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
      <Button type="button" variant="outline" size="sm" disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="h-8 text-xs font-bold rounded-lg border-slate-300 hover:bg-slate-50 transition-colors">
        {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />}
        {label}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Editor Props — all form state lives in parent, passed via props
// This is the correct pattern: top-level components, NO nesting inside parent
// ─────────────────────────────────────────────────────────────────────────────

interface HeroEditorProps {
  form: any; setForm: (fn: (f: any) => any) => void;
  onSave: () => void; saving: boolean;
}
function HeroEditor({ form, setForm, onSave, saving }: HeroEditorProps) {
  if (!form) return <PageSkeleton />;

  const addSlide = () => setForm((f: any) => ({ ...f, fallbackSlides: [...(f.fallbackSlides || []), { title: '', subtitle: '', image: '', location: '' }] }));
  const removeSlide = (idx: number) => setForm((f: any) => ({ ...f, fallbackSlides: f.fallbackSlides.filter((_: any, i: number) => i !== idx) }));
  const updateSlide = (idx: number, key: string, val: any) => setForm((f: any) => {
    const list = [...f.fallbackSlides]; list[idx] = { ...list[idx], [key]: val }; return { ...f, fallbackSlides: list };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Hero Section Banners & Video loop</h3>
          <p className="text-xs text-muted-foreground">Manage the background loop of the homepage hero banner.</p>
        </div>
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
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
            {(['videoUrl1', 'videoUrl2'] as const).map((key, i) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Video Loop {i + 1}</Label>
                <div className="flex gap-2">
                  <Input value={form[key]} onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder="https://..." className="flex-1" />
                  <R2UploadButton label="Upload Video" accept="video/*" section="hero" onUploaded={url => setForm((f: any) => ({ ...f, [key]: url }))} />
                </div>
                {form[key] && <video src={form[key]} controls className="w-full h-32 rounded-lg bg-black object-cover mt-2" />}
              </div>
            ))}
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
                    {slide.image ? <img src={slide.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>}
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

interface OdysseyEditorProps {
  form: any; setForm: (fn: (f: any) => any) => void;
  onSave: () => void; saving: boolean;
}
function OdysseyEditor({ form, setForm, onSave, saving }: OdysseyEditorProps) {
  if (!form) return <PageSkeleton />;

  const addSpot = () => setForm((f: any) => ({ ...f, spots: [...(f.spots || []), { name: '', location: '', image: '' }] }));
  const removeSpot = (idx: number) => setForm((f: any) => ({ ...f, spots: f.spots.filter((_: any, i: number) => i !== idx) }));
  const updateSpot = (idx: number, key: string, val: any) => setForm((f: any) => {
    const list = [...f.spots]; list[idx] = { ...list[idx], [key]: val }; return { ...f, spots: list };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Himalayan Odyssey (Attractive Spots)</h3>
          <p className="text-xs text-muted-foreground">Manage the heading titles and carousel of locations on your homepage.</p>
        </div>
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
          Save Odyssey
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Main Title</Label>
          <Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Odyssey" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subtitle</Label>
          <Input value={form.subtitle} onChange={e => setForm((f: any) => ({ ...f, subtitle: e.target.value }))} placeholder="Exquisite Locations" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-t pt-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Carousel Spots</Label>
          <Button variant="outline" size="sm" onClick={addSpot}><Plus className="w-3.5 h-3.5 mr-1" /> Add Spot</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {form.spots?.map((spot: any, idx: number) => (
            <Card key={idx} className="p-4 bg-white border border-slate-200 flex flex-col gap-3 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeSpot(idx)}><Trash2 className="w-4 h-4" /></Button>
              <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border">
                {spot.image ? <img src={spot.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={spot.name} onChange={e => updateSpot(idx, 'name', e.target.value)} placeholder="Spot Name" />
                  <Input value={spot.location} onChange={e => updateSpot(idx, 'location', e.target.value)} placeholder="District/City" />
                </div>
                <div className="flex gap-2 items-center">
                  <Input value={spot.image} onChange={e => updateSpot(idx, 'image', e.target.value)} placeholder="Image URL" className="flex-1 text-xs" />
                  <R2UploadButton label="Upload" section="spots" onUploaded={url => updateSpot(idx, 'image', url)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DestsEditorProps {
  list: any[]; setList: (fn: (l: any[]) => any[]) => void;
  onSave: () => void; saving: boolean;
}
function DestinationsEditor({ list, setList, onSave, saving }: DestsEditorProps) {
  const addItem = () => setList((d: any[]) => [...d, { id: '', title: '', tagline: '', description: '', link: '', mainImage: '', overlayImage: '' }]);
  const removeItem = (idx: number) => setList((d: any[]) => d.filter((_: any, i: number) => i !== idx));
  const updateItem = (idx: number, key: string, val: any) => setList((d: any[]) => { const u = [...d]; u[idx] = { ...u[idx], [key]: val }; return u; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Featured Destinations Grid</h3>
          <p className="text-xs text-muted-foreground">Manage the main cards carousel of destinations on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Add Card</Button>
          <Button onClick={onSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}Save Grid
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        {list.map((dest: any, idx: number) => (
          <Card key={idx} className="p-5 bg-slate-50/50 border border-slate-200 grid md:grid-cols-[1.5fr_3fr_auto] gap-6 items-start relative">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-red-500 h-8 w-8" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Main Poster Photo</Label>
                <div className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden border">
                  {dest.mainImage ? <img src={dest.mainImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                </div>
                <R2UploadButton label="Upload Poster" section="destinations" onUploaded={url => updateItem(idx, 'mainImage', url)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Overlay Grayscale Photo</Label>
                <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden border">
                  {dest.overlayImage ? <img src={dest.overlayImage} className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                </div>
                <R2UploadButton label="Upload Overlay" section="destinations" onUploaded={url => updateItem(idx, 'overlayImage', url)} />
              </div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Slug/ID *</Label><Input value={dest.id} onChange={e => updateItem(idx, 'id', e.target.value)} placeholder="gangtok" /></div>
                <div className="space-y-1.5 col-span-2"><Label className="text-xs text-muted-foreground font-semibold">Display Title *</Label><Input value={dest.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Gangtok" /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Tagline</Label><Input value={dest.tagline} onChange={e => updateItem(idx, 'tagline', e.target.value)} placeholder="Where Tradition Meets Tranquility" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Link</Label><Input value={dest.link} onChange={e => updateItem(idx, 'link', e.target.value)} placeholder="/destinations/gangtok" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Description</Label>
                <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={dest.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Detailed editorial info..." />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ActivitiesEditorProps {
  list: any[]; setList: (fn: (l: any[]) => any[]) => void;
  onSave: () => void; saving: boolean;
}
function ActivitiesEditor({ list, setList, onSave, saving }: ActivitiesEditorProps) {
  const addItem = () => setList((d: any[]) => [...d, { title: '', subtitle: '', image: '', alt: '' }]);
  const removeItem = (idx: number) => setList((d: any[]) => d.filter((_: any, i: number) => i !== idx));
  const updateItem = (idx: number, key: string, val: any) => setList((d: any[]) => { const u = [...d]; u[idx] = { ...u[idx], [key]: val }; return u; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Activities & Local Food Section</h3>
          <p className="text-xs text-muted-foreground">Manage the activities hover panels displayed on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Add Panel</Button>
          <Button onClick={onSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}Save Activities
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((act: any, idx: number) => (
          <Card key={idx} className="p-4 bg-white border border-slate-200 grid md:grid-cols-[1fr_2fr_auto] gap-4 items-center relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
            <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border">
              {act.image ? <img src={act.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>}
            </div>
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <Input value={act.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Activity Name" />
                <Input value={act.subtitle} onChange={e => updateItem(idx, 'subtitle', e.target.value)} placeholder="Subtitle Category" />
              </div>
              <div className="flex gap-2 items-center">
                <Input value={act.image} onChange={e => updateItem(idx, 'image', e.target.value)} placeholder="Image URL" className="flex-1 text-xs" />
                <R2UploadButton label="Upload" section="activities" onUploaded={url => updateItem(idx, 'image', url)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface VillasEditorProps {
  list: any[]; setList: (fn: (l: any[]) => any[]) => void;
  onSave: () => void; saving: boolean;
}
function VillasEditor({ list, setList, onSave, saving }: VillasEditorProps) {
  const addItem = () => setList((d: any[]) => [...d, { id: '', title: '', description: '', image: '' }]);
  const removeItem = (idx: number) => setList((d: any[]) => d.filter((_: any, i: number) => i !== idx));
  const updateItem = (idx: number, key: string, val: any) => setList((d: any[]) => { const u = [...d]; u[idx] = { ...u[idx], [key]: val }; return u; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Exclusive Stay / Villas</h3>
          <p className="text-xs text-muted-foreground">Manage the slideshow of luxury Villas on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Add Villa</Button>
          <Button onClick={onSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}Save Villas
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {list.map((vil: any, idx: number) => (
          <Card key={idx} className="p-4 bg-white border border-slate-200 grid md:grid-cols-[1.2fr_3fr_auto] gap-4 items-start relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
            <div className="space-y-2">
              <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border">
                {vil.image ? <img src={vil.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
              </div>
              <R2UploadButton label="Upload Photo" section="villas" onUploaded={url => updateItem(idx, 'image', url)} />
            </div>
            <div className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <Input value={vil.id} onChange={e => updateItem(idx, 'id', e.target.value)} placeholder="Villa ID (e.g. v1)" />
                <Input value={vil.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Villa Title" />
              </div>
              <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={vil.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Villa description/tagline..." />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface InsidePagesEditorProps {
  destinationsList: any[];
  destinationsCms: any[];
  onSave: (destId: string, data: any) => void;
  saving: boolean;
}
function InsidePagesEditor({ destinationsList, destinationsCms, onSave, saving }: InsidePagesEditorProps) {
  const [selectedDestId, setSelectedDestId] = useState('');
  const [pageForm, setPageForm] = useState({
    aboutHtml: '', heroImage: '', seoTitle: '', seoDesc: '', isPublished: true,
    pageContent: { heroImage: '', attractions: [] as Array<{ name: string; tag: string; image: string; short: string }> }
  });

  useEffect(() => {
    if (!selectedDestId) return;
    const cms = destinationsCms.find((d: any) => d.destinationId === selectedDestId);
    if (cms) {
      setPageForm({ aboutHtml: cms.aboutHtml || '', heroImage: cms.heroImage || '', seoTitle: cms.seoTitle || '', seoDesc: cms.seoDesc || '', isPublished: cms.isPublished ?? true, pageContent: cms.pageContent || { heroImage: '', attractions: [] } });
    } else {
      setPageForm({ aboutHtml: '', heroImage: '', seoTitle: '', seoDesc: '', isPublished: true, pageContent: { heroImage: '', attractions: [] } });
    }
  }, [selectedDestId]);

  const addAttraction = () => setPageForm((f: any) => ({ ...f, pageContent: { ...f.pageContent, attractions: [...(f.pageContent.attractions || []), { name: '', tag: 'Nature', image: '', short: '' }] } }));
  const removeAttraction = (idx: number) => setPageForm((f: any) => ({ ...f, pageContent: { ...f.pageContent, attractions: f.pageContent.attractions.filter((_: any, i: number) => i !== idx) } }));
  const updateAttraction = (idx: number, key: string, val: any) => setPageForm((f: any) => { const list = [...f.pageContent.attractions]; list[idx] = { ...list[idx], [key]: val }; return { ...f, pageContent: { ...f.pageContent, attractions: list } }; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Destination Inside Page Editor</h3>
          <p className="text-xs text-muted-foreground">Select a destination to customize its cover photo and tourist attraction details.</p>
        </div>
        {selectedDestId && (
          <Button onClick={() => onSave(selectedDestId, pageForm)} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}Save Page Settings
          </Button>
        )}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Destination</Label>
        <select className="w-full px-3 py-2 border rounded-md text-sm bg-background" value={selectedDestId} onChange={e => setSelectedDestId(e.target.value)}>
          <option value="">-- Choose a Destination --</option>
          {destinationsList.map((dest: any) => <option key={dest.id} value={dest.id}>{dest.name}</option>)}
        </select>
      </div>
      {selectedDestId ? (
        <div className="space-y-6 border-t pt-4">
          <div className="bg-slate-50/50 rounded-xl border p-5 grid md:grid-cols-[1.5fr_3fr] gap-6 items-center">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destination Page Cover Photo</Label>
              <div className="relative w-full h-36 bg-slate-100 rounded-lg overflow-hidden border">
                {pageForm.pageContent.heroImage || pageForm.heroImage ? <img src={pageForm.pageContent.heroImage || pageForm.heroImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
              </div>
              <R2UploadButton label="Upload Cover Image" section="destinations" onUploaded={url => setPageForm((f: any) => ({ ...f, heroImage: url, pageContent: { ...f.pageContent, heroImage: url } }))} />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">SEO Title</Label><Input value={pageForm.seoTitle} onChange={e => setPageForm((f: any) => ({ ...f, seoTitle: e.target.value }))} placeholder="Title for browser search tab" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">SEO Meta Description</Label><Input value={pageForm.seoDesc} onChange={e => setPageForm((f: any) => ({ ...f, seoDesc: e.target.value }))} placeholder="Brief summary for Google search" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">About Description HTML</Label>
                <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={pageForm.aboutHtml} onChange={e => setPageForm((f: any) => ({ ...f, aboutHtml: e.target.value }))} placeholder="Detailed text about this holiday destination..." />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tourist Attractions List</Label>
              <Button variant="outline" size="sm" onClick={addAttraction}><Plus className="w-3.5 h-3.5 mr-1" /> Add Attraction</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {pageForm.pageContent.attractions?.map((attr: any, idx: number) => (
                <Card key={idx} className="p-4 bg-white border border-slate-200 flex flex-col gap-3 relative">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeAttraction(idx)}><Trash2 className="w-4 h-4" /></Button>
                  <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border">
                    {attr.image ? <img src={attr.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>}
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — thin orchestrator, all logic above in proper top-level components
// ─────────────────────────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'hero',         label: 'Hero Banner & Video',  icon: Video },
  { id: 'odyssey',      label: 'Himalayan Odyssey',    icon: Sparkles },
  { id: 'destinations', label: 'Featured Grid',        icon: LayoutGrid },
  { id: 'activities',   label: 'Activities',           icon: Compass },
  { id: 'villas',       label: 'Villas & Stays',       icon: ImageIcon },
  { id: 'inside-pages', label: 'Destination Pages',    icon: MapPin },
] as const;

type SubTabId = typeof SUB_TABS[number]['id'];

export default function WebsiteControlTab() {
  const qc = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('hero');

  // Load once — NO auto-refresh. Only refreshes after you save.
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['wc-configs'],
    queryFn: () => api.get('/website-config/public').then(r => r.data.data),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const { data: destinationsList = [] } = useQuery({
    queryKey: ['wc-destinations-list'],
    queryFn: () => api.get('/masters/destinations').then(r => r.data.data),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // All form state lives here — editors receive state via props, never lose work
  const [heroForm,        setHeroForm]        = useState<any>(null);
  const [odysseyForm,     setOdysseyForm]     = useState<any>(null);
  const [destsList,       setDestsList]       = useState<any[]>([]);
  const [activitiesList,  setActivitiesList]  = useState<any[]>([]);
  const [villasList,      setVillasList]      = useState<any[]>([]);
  const [seeded,          setSeeded]          = useState(false);

  // Seed ONCE on first load — background refetches after save don't reset forms
  useEffect(() => {
    if (!configData || seeded) return;
    const c = configData.config || {};
    setHeroForm(c.hero || { useVideo: true, videoUrl1: '', videoUrl2: '', fallbackSlides: [] });
    setOdysseyForm(c.odyssey || { title: 'A Himalayan Odyssey', subtitle: 'Exquisite Locations', spots: [] });
    setDestsList(c.destinations || []);
    setActivitiesList(c.activities || []);
    setVillasList(c.villas || []);
    setSeeded(true);
  }, [configData, seeded]);

  const sectionMut = useMutation({
    mutationFn: ({ section, data }: { section: string; data: any }) =>
      api.put(`/website-configs/cms/${section}`, data),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['wc-configs'] }); toast.success(`"${v.section}" saved!`); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const destCmsMut = useMutation({
    mutationFn: ({ destId, data }: { destId: string; data: any }) =>
      api.put(`/website-configs/destinations/${destId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wc-configs'] }); toast.success('Destination page saved!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  if (configLoading && !configData) return <PageSkeleton />;

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-8">
      {/* Sidebar — always shows all 6 sections, never re-renders */}
      <div className="flex flex-col gap-1 border-r pr-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black px-3 mb-2">Sections Control</p>
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors text-left ${
                isActive ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Editor panel */}
      <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[400px]">
        {activeSubTab === 'hero' && (
          <HeroEditor form={heroForm} setForm={setHeroForm}
            onSave={() => sectionMut.mutate({ section: 'hero', data: heroForm })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'odyssey' && (
          <OdysseyEditor form={odysseyForm} setForm={setOdysseyForm}
            onSave={() => sectionMut.mutate({ section: 'odyssey', data: odysseyForm })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'destinations' && (
          <DestinationsEditor list={destsList} setList={setDestsList}
            onSave={() => sectionMut.mutate({ section: 'destinations', data: destsList })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'activities' && (
          <ActivitiesEditor list={activitiesList} setList={setActivitiesList}
            onSave={() => sectionMut.mutate({ section: 'activities', data: activitiesList })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'villas' && (
          <VillasEditor list={villasList} setList={setVillasList}
            onSave={() => sectionMut.mutate({ section: 'villas', data: villasList })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'inside-pages' && (
          <InsidePagesEditor
            destinationsList={destinationsList}
            destinationsCms={configData?.destinations || []}
            onSave={(destId, data) => destCmsMut.mutate({ destId, data })}
            saving={destCmsMut.isPending} />
        )}
      </div>
    </div>
  );
}
