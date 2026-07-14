'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus, Trash2, Loader2, Check, Upload, Image as ImageIcon,
  MapPin, Video, Compass, Sparkles, LayoutGrid, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

// ─── Default Static Data Fallbacks ───────────────────────────────────────────
const DEFAULT_HERO_SLIDES = [
  {
    title: "Sacred Serenity",
    subtitle: "Discover the peace within.",
    image: "https://unsplash.com/photos/GdlEMsUsOy0/download?force=true&w=1800",
    location: "Varanasi"
  },
  {
    title: "Mountain Heights",
    subtitle: "Breathtaking views.",
    image: "https://unsplash.com/photos/-umeutkfZew/download?force=true&w=1800",
    location: "Ladakh"
  },
  {
    title: "Wildlife Wonders",
    subtitle: "Embrace nature.",
    image: "https://unsplash.com/photos/A0vabw8DVx0/download?force=true&w=1800",
    location: "Madhya Pradesh"
  },
  {
    title: "Concrete Coast",
    subtitle: "Modern marvels.",
    image: "https://unsplash.com/photos/yjQQO8hIH6A/download?force=true&w=1800",
    location: "Maharashtra"
  },
  {
    title: "Green Valleys",
    subtitle: "Endless horizons.",
    image: "https://unsplash.com/photos/ilrO9BN7QSE/download?force=true&w=1800",
    location: "Himachal Pradesh"
  },
  {
    title: "Tranquil Waters",
    subtitle: "A journey of peace.",
    image: "https://unsplash.com/photos/29ezCWtMtnM/download?force=true&w=1800",
    location: "Kerala"
  }
];

const DEFAULT_ODYSSEY_SPOTS = [
  { id: "tiger-hill", name: "Tiger Hill", location: "Darjeeling", image: "https://images.pexels.com/photos/33736751/pexels-photo-33736751.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "hawa-mahal", name: "Hawa Mahal", location: "Jaipur", image: "https://images.pexels.com/photos/19195937/pexels-photo-19195937.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "rumtek", name: "Rumtek Monastery", location: "Gangtok", image: "https://images.pexels.com/photos/35431355/pexels-photo-35431355.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "city-palace", name: "City Palace", location: "Udaipur", image: "https://images.pexels.com/photos/29824639/pexels-photo-29824639.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "varanasi", name: "Dashashwamedh Ghat", location: "Varanasi", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" },
  { id: "shanti-stupa", name: "Shanti Stupa", location: "Leh", image: "https://images.unsplash.com/photo-1543336775-49935ed6e76d?auto=format&fit=crop&w=800&q=80" },
  { id: "tea-gardens", name: "Tea Gardens", location: "Munnar", image: "https://images.pexels.com/photos/31758870/pexels-photo-31758870.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "backwaters", name: "Vembanad Lake", location: "Alleppey", image: "https://images.pexels.com/photos/29801456/pexels-photo-29801456.jpeg?auto=compress&cs=tinysrgb&w=800" }
];

const DEFAULT_DESTINATIONS = [
  {
    id: "gangtok",
    title: "Gangtok",
    tagline: "Sikkim",
    description: "A sanctuary in the Himalayas where tradition meets tranquility.",
    mainImage: "https://images.pexels.com/photos/33547415/pexels-photo-33547415.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/33547415/pexels-photo-33547415.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/gangtok"
  },
  {
    id: "darjeeling",
    title: "Darjeeling",
    tagline: "West Bengal",
    description: "Mist-kissed peaks and rolling tea gardens in the Queen of Hills.",
    mainImage: "https://images.pexels.com/photos/33736751/pexels-photo-33736751.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/33736751/pexels-photo-33736751.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/darjeeling"
  },
  {
    id: "pelling",
    title: "Pelling",
    tagline: "West Sikkim",
    description: "Sacred lakes and ancient monasteries with a view of the gods.",
    mainImage: "https://images.pexels.com/photos/34032592/pexels-photo-34032592.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/34032592/pexels-photo-34032592.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/pelling"
  },
  {
    id: "udaipur",
    title: "Udaipur",
    tagline: "Rajasthan",
    description: "A golden sunset over the legendary City of Lakes.",
    mainImage: "https://images.pexels.com/photos/29801402/pexels-photo-29801402.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/29801402/pexels-photo-29801402.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/udaipur"
  },
  {
    id: "jaipur",
    title: "Jaipur",
    tagline: "Rajasthan",
    description: "The Pink City where history is written in sandstone and light.",
    mainImage: "https://images.pexels.com/photos/19195937/pexels-photo-19195937.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/19195937/pexels-photo-19195937.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/jaipur"
  },
  {
    id: "munnar",
    title: "Munnar",
    tagline: "Kerala",
    description: "The emerald heaven where clouds rest upon velvet green hills.",
    mainImage: "https://images.pexels.com/photos/31758870/pexels-photo-31758870.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/31758870/pexels-photo-31758870.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/munnar"
  },
  {
    id: "goa",
    title: "Goa",
    tagline: "West Coast",
    description: "Pristine sands and colonial whispers on the edge of the Arabian Sea.",
    mainImage: "https://images.pexels.com/photos/2432269/pexels-photo-2432269.jpeg?auto=compress&cs=tinysrgb&w=1200",
    overlayImage: "https://images.pexels.com/photos/2432269/pexels-photo-2432269.jpeg?auto=compress&cs=tinysrgb&w=1200",
    link: "/destinations/goa"
  },
  {
    id: "wayanad",
    title: "Wayanad",
    tagline: "Kerala",
    description: "Ancient caves and misty plantations in the heart of the Western Ghats.",
    mainImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80",
    overlayImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80",
    link: "/destinations/wayanad"
  }
];

const DEFAULT_LANDING_STATES = [
  {
    slug: "sikkim",
    title: "Sikkim",
    region: "Himalayan Sanctuary",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800",
    cities: ["Gangtok", "Pelling", "Lachung"],
    desc: "An alpine haven of glacial lakes, ancient monasteries, and the cloud-kissed peaks of Mount Kanchenjunga.",
    gradientFrom: "#527e99",
    gradientTo: "#88b3d0",
  },
  {
    slug: "west-bengal",
    title: "West Bengal",
    region: "Colonial & Tea Heritage",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
    cities: ["Darjeeling", "Kolkata"],
    desc: "Wander through rolling green valleys of Darjeeling tea, or explore the colonial art archives of Kolkata.",
    gradientFrom: "#8a6a2f",
    gradientTo: "#bca374",
  },
  {
    slug: "kerala",
    title: "Kerala",
    region: "God's Own Country",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800",
    cities: ["Munnar", "Wayanad"],
    desc: "A tropical oasis of emerald backwaters, velvet tea plantations, and wild spice sanctuaries.",
    gradientFrom: "#3a6d47",
    gradientTo: "#6bb07d",
  },
  {
    slug: "rajasthan",
    title: "Rajasthan",
    region: "Land of Kings",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800",
    cities: ["Jaipur", "Udaipur"],
    desc: "Sandstone fortresses rising from desert dunes, grand lake palaces, and royal heritage legends.",
    gradientFrom: "#b37b2d",
    gradientTo: "#e0ad6e",
  },
  {
    slug: "goa",
    title: "Goa",
    region: "Coastal Tranquility",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
    cities: ["Goa Beaches"],
    desc: "Pristine sun-drenched sands, historic Portuguese chapels, and the easy rhythm of coastal life.",
    gradientFrom: "#2e6f75",
    gradientTo: "#5cb3bd",
  },
  {
    slug: "andaman-nicobar",
    title: "Andaman & Nicobar",
    region: "Tropical Island Haven",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
    cities: ["Port Blair"],
    desc: "Crystal-clear turquoise waters, vibrant coral reefs, and untouched palm-fringed private shores.",
    gradientFrom: "#237282",
    gradientTo: "#5bc0d6",
  },
  {
    slug: "tamil-nadu",
    title: "Tamil Nadu",
    region: "Dravidian Heritage",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800",
    cities: ["Ooty"],
    desc: "Stately mountain retreats, stone-carved heritage temples, and the scenic vistas of the Nilgiris.",
    gradientFrom: "#7a552e",
    gradientTo: "#ab815b",
  },
];

const DEFAULT_ACTIVITIES = [
  {
    title: "Trekking",
    subtitle: "Himalayan Trails",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop",
    alt: "Trekking through the Himalayan mountains",
  },
  {
    title: "Yak Safari",
    subtitle: "Highland Rides",
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1200&auto=format&fit=crop",
    alt: "Yak safari across high-altitude pastures",
  },
  {
    title: "Bike Ride",
    subtitle: "Mountain Roads",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop",
    alt: "Bike riding on scenic mountain roads",
  },
  {
    title: "Camping",
    subtitle: "Under the Stars",
    image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?q=80&w=1200&auto=format&fit=crop",
    alt: "Camping under a starry sky in the mountains",
  },
  {
    title: "Rope Course",
    subtitle: "Adventure Heights",
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200&auto=format&fit=crop",
    alt: "Rope course adventure in the forest",
  },
  {
    title: "Food",
    subtitle: "Local Flavours",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1200&auto=format&fit=crop",
    alt: "Traditional Indian food spread",
  },
  {
    title: "Paragliding",
    subtitle: "Soar the Skies",
    image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format&fit=crop",
    alt: "Paragliding over mountain valleys",
  },
  {
    title: "Khangchendzonga Trek",
    subtitle: "Summit Dreams",
    image: "https://images.unsplash.com/photo-1585409677599-f5476da95f71?q=80&w=1200&auto=format&fit=crop",
    alt: "Khangchendzonga mountain peak trail",
  },
  {
    title: "Coronation Trek",
    subtitle: "Royal Pathways",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    alt: "Mountain trail through alpine meadows",
  },
  {
    title: "River Rafting",
    subtitle: "White Water Rush",
    image: "https://images.unsplash.com/photo-1530866495561-507c83d09e79?q=80&w=1200&auto=format&fit=crop",
    alt: "River rafting through rapids",
  },
  {
    title: "Parks & Sanctuaries",
    subtitle: "Wildlife Haven",
    image: "https://images.unsplash.com/photo-1535338454528-1b5304d1ac73?q=80&w=1200&auto=format&fit=crop",
    alt: "Lush green forest sanctuary",
  },
];

const DEFAULT_VILLAS = [
  {
    id: "v1",
    title: "Vela One Bedroom Ocean Front Villa",
    description: "Poised on a cliffside with sweeping ocean views, complemented by personalized butler services to cater to your every desire.",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "v2",
    title: "Vela Two Bedroom Family Villa",
    description: "A spacious sanctuary designed for families, featuring a private pool and lush garden surroundings.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "v3",
    title: "Vela Ocean View Cliff Villa",
    description: "Experience the ultimate in privacy and luxury with unobstructed views of the Indian Ocean.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "v4",
    title: "Vela River Front Villa",
    description: "Nestled along the gentle river, this villa offers a tranquil escape into nature's embrace.",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1600&q=80"
  }
];

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
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 100; // 100 MB max

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file size check
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast.error(`File is too large (${fileSizeMB.toFixed(1)} MB). Maximum allowed: ${MAX_FILE_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/website-configs/cms/upload?section=${section}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5 * 60 * 1000, // 5 minute timeout for large video uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(pct);
          }
        },
      });
      if (res.data.success && res.data.url) {
        onUploaded(res.data.url);
        toast.success('File uploaded successfully!');
      } else {
        toast.error('Invalid upload response format');
      }
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        toast.error('Upload timed out. The file may be too large or network too slow.');
      } else if (err.response?.status === 413) {
        toast.error(err.response?.data?.message || 'File is too large for the server to accept.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to upload file. Please try again.');
      }
    } finally {
      setUploading(false);
      setProgress(0);
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
        {uploading ? `Uploading ${progress}%` : label}
      </Button>
      {uploading && (
        <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      )}
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

  const [deletingVideos, setDeletingVideos] = useState<Record<string, boolean>>({});

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
            {(['videoUrl1', 'videoUrl2'] as const).map((key, i) => {
              const videoUrl = form[key];
              const deleting = !!deletingVideos[key];

              const handleDeleteVideo = async () => {
                if (!videoUrl) return;
                if (!confirm(`Delete Video Loop ${i + 1} from Cloudflare R2? This cannot be undone.`)) return;
                setDeletingVideos(prev => ({ ...prev, [key]: true }));
                try {
                  await api.delete('/website-configs/cms/delete-asset', { data: { url: videoUrl } });
                  setForm((f: any) => ({ ...f, [key]: '' }));
                  toast.success(`Video ${i + 1} deleted from R2 successfully.`);
                } catch (err: any) {
                  // Still clear the URL in the form even if R2 delete fails
                  setForm((f: any) => ({ ...f, [key]: '' }));
                  toast.warning(`URL cleared. R2 delete may have failed: ${err?.response?.data?.message || err.message}`);
                } finally {
                  setDeletingVideos(prev => ({ ...prev, [key]: false }));
                }
              };

              return (
                <div key={key} className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Video Loop {i + 1}</Label>
                  <div className="flex gap-2">
                    <Input value={videoUrl || ''} onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder="https://..." className="flex-1" />
                    <R2UploadButton label="Upload Video" accept="video/*" section="hero" onUploaded={url => setForm((f: any) => ({ ...f, [key]: url }))} />
                    {videoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleting}
                        onClick={handleDeleteVideo}
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg"
                        title="Delete video from R2"
                      >
                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                  </div>
                  {videoUrl && (
                    <video src={videoUrl} controls className="w-full h-32 rounded-lg bg-black object-cover mt-2" />
                  )}
                </div>
              );
            })}
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

interface LandingStatesEditorProps {
  list: any[]; setList: (fn: (l: any[]) => any[]) => void;
  onSave: () => void; saving: boolean;
}
function LandingStatesEditor({ list, setList, onSave, saving }: LandingStatesEditorProps) {
  const addItem = () => setList((d: any[]) => [...d, { slug: '', title: '', region: '', image: '', desc: '', cities: [], gradientFrom: '#527e99', gradientTo: '#88b3d0' }]);
  const removeItem = (idx: number) => setList((d: any[]) => d.filter((_: any, i: number) => i !== idx));
  const updateItem = (idx: number, key: string, val: any) => setList((d: any[]) => { const u = [...d]; u[idx] = { ...u[idx], [key]: val }; return u; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Landing Page States</h3>
          <p className="text-xs text-muted-foreground">Manage the states list displayed on the destinations directory page.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Add State</Button>
          <Button onClick={onSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}Save States
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        {list.map((state: any, idx: number) => (
          <Card key={idx} className="p-5 bg-slate-50/50 border border-slate-200 grid md:grid-cols-[1.5fr_3fr_auto] gap-6 items-start relative">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-red-500 h-8 w-8" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400">Cover Photo</Label>
                <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border">
                  {state.image ? <img src={state.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                </div>
                <div className="flex gap-1.5 items-center">
                  <Input value={state.image || ''} onChange={e => updateItem(idx, 'image', e.target.value)} placeholder="Cover Image Path/URL" className="flex-1 text-xs h-9" />
                  <R2UploadButton label="Upload" section="destinations" onUploaded={url => updateItem(idx, 'image', url)} />
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Slug/ID *</Label><Input value={state.slug} onChange={e => updateItem(idx, 'slug', e.target.value)} placeholder="sikkim" /></div>
                <div className="space-y-1.5 col-span-2"><Label className="text-xs text-muted-foreground font-semibold">State Name *</Label><Input value={state.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Sikkim" /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Subtitle / Region</Label><Input value={state.region} onChange={e => updateItem(idx, 'region', e.target.value)} placeholder="Himalayan Sanctuary" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Cities (Comma-separated)</Label>
                  <Input 
                    value={Array.isArray(state.cities) ? state.cities.join(', ') : state.cities || ''} 
                    onChange={e => updateItem(idx, 'cities', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} 
                    placeholder="Gangtok, Pelling, Lachung" 
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Gradient From</Label><Input value={state.gradientFrom || '#527e99'} onChange={e => updateItem(idx, 'gradientFrom', e.target.value)} placeholder="#527e99" /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Gradient To</Label><Input value={state.gradientTo || '#88b3d0'} onChange={e => updateItem(idx, 'gradientTo', e.target.value)} placeholder="#88b3d0" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Description</Label>
                <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={state.desc} onChange={e => updateItem(idx, 'desc', e.target.value)} placeholder="Detailed text about this state..." />
              </div>
            </div>
          </Card>
        ))}
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
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400">Main Poster Photo</Label>
                <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border">
                  {dest.mainImage ? <img src={dest.mainImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                </div>
                <div className="flex gap-1.5 items-center">
                  <Input value={dest.mainImage || ''} onChange={e => updateItem(idx, 'mainImage', e.target.value)} placeholder="Poster Path/URL" className="flex-1 text-xs h-9" />
                  <R2UploadButton label="Upload" section="destinations" onUploaded={url => updateItem(idx, 'mainImage', url)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400">Overlay Grayscale Photo</Label>
                <div className="relative w-full h-28 bg-slate-100 rounded-xl overflow-hidden border">
                  {dest.overlayImage ? <img src={dest.overlayImage} className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
                </div>
                <div className="flex gap-1.5 items-center">
                  <Input value={dest.overlayImage || ''} onChange={e => updateItem(idx, 'overlayImage', e.target.value)} placeholder="Overlay Path/URL" className="flex-1 text-xs h-9" />
                  <R2UploadButton label="Upload" section="destinations" onUploaded={url => updateItem(idx, 'overlayImage', url)} />
                </div>
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
  form: any; setForm: (fn: (f: any) => any) => void;
  onSave: () => void; saving: boolean;
}
function VillasEditor({ form, setForm, onSave, saving }: VillasEditorProps) {
  if (!form) return <PageSkeleton />;

  const addItem = () => setForm((f: any) => ({ ...f, items: [...(f.items || []), { id: '', title: '', description: '', image: '' }] }));
  const removeItem = (idx: number) => setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) }));
  const updateItem = (idx: number, key: string, val: any) => setForm((f: any) => {
    const list = [...f.items]; list[idx] = { ...list[idx], [key]: val }; return { ...f, items: list };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Exclusive Stays (Villas & Stays)</h3>
          <p className="text-xs text-muted-foreground">Manage the heading titles and slideshow of luxury Villas on the homepage.</p>
        </div>
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}Save Stays
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 bg-slate-50/50 rounded-xl border p-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Section Title</Label>
          <Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="VELA" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Section Tagline / Subtitle</Label>
          <Input value={form.subtitle} onChange={e => setForm((f: any) => ({ ...f, subtitle: e.target.value }))} placeholder="Your Exclusive Tranquil Haven at IMAGICA HOLIDAYS" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-t pt-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Slideshow Items</Label>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Add Stay</Button>
        </div>
        {form.items?.map((vil: any, idx: number) => (
          <Card key={idx} className="p-4 bg-white border border-slate-200 grid md:grid-cols-[1.2fr_3fr_auto] gap-4 items-start relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-8 w-8" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
            <div className="space-y-2">
              <div className="relative w-full h-24 bg-slate-100 rounded-lg overflow-hidden border">
                {vil.image ? <img src={vil.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>}
              </div>
              <div className="flex gap-1.5 items-center">
                <Input value={vil.image || ''} onChange={e => updateItem(idx, 'image', e.target.value)} placeholder="Image Path/URL" className="flex-1 text-xs h-9" />
                <R2UploadButton label="Upload" section="villas" onUploaded={url => updateItem(idx, 'image', url)} />
              </div>
            </div>
            <div className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <Input value={vil.id} onChange={e => updateItem(idx, 'id', e.target.value)} placeholder="Hotel/Villa Name (e.g. Rambagh Palace)" />
                <Input value={vil.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Tagline / Subtitle (e.g. The Jewel of Jaipur)" />
              </div>
              <textarea className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-y min-h-[60px]" value={vil.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Description (e.g. Occupying a 70-acre estate...)" />
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
              <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border">
                {pageForm.pageContent.heroImage || pageForm.heroImage ? <img src={pageForm.pageContent.heroImage || pageForm.heroImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>}
              </div>
              <div className="flex gap-1.5 items-center">
                <Input value={pageForm.pageContent.heroImage || pageForm.heroImage || ''} onChange={e => setPageForm((f: any) => ({ ...f, heroImage: e.target.value, pageContent: { ...f.pageContent, heroImage: e.target.value } }))} placeholder="Cover Image Path/URL" className="flex-1 text-xs h-9" />
                <R2UploadButton label="Upload" section="destinations" onUploaded={url => setPageForm((f: any) => ({ ...f, heroImage: url, pageContent: { ...f.pageContent, heroImage: url } }))} />
              </div>
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
  { id: 'hero',           label: 'Hero Banner & Video',  icon: Video },
  { id: 'odyssey',        label: 'Himalayan Odyssey',    icon: Sparkles },
  { id: 'destinations',   label: 'Featured Grid',        icon: LayoutGrid },
  { id: 'landing-states', label: 'Landing Page States',  icon: Compass },
  { id: 'activities',     label: 'Activities',           icon: Compass },
  { id: 'villas',         label: 'Exclusive Stays (Villas)',       icon: ImageIcon },
  { id: 'inside-pages',   label: 'Destination Pages',    icon: MapPin },
] as const;

type SubTabId = typeof SUB_TABS[number]['id'];

export default function WebsiteControlTab() {
  const qc = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('hero');

  // Load once — NO auto-refresh. Only refreshes after you save.
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['wc-configs'],
    queryFn: () => api.get('/website-configs/public').then(r => r.data.data),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const { data: destinationsList = [] } = useQuery({
    queryKey: ['wc-destinations-list'],
    queryFn: () => api.get('/masters/destinations').then(r => r.data.data),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // All form state lives here — editors receive state via props, never lose work
  const [heroForm,        setHeroForm]        = useState<any>(null);
  const [odysseyForm,     setOdysseyForm]     = useState<any>(null);
  const [destsList,       setDestsList]       = useState<any[]>([]);
  const [activitiesList,  setActivitiesList]  = useState<any[]>([]);
  const [villasForm,      setVillasForm]      = useState<any>(null);
  const [landingStatesList, setLandingStatesList] = useState<any[]>([]);
  const [seeded,          setSeeded]          = useState(false);

  // Seed ONCE on first load — background refetches after save don't reset forms
  useEffect(() => {
    if (!configData || seeded) return;
    const c = configData.config || {};
    
    // Hero Banner & Video
    const hero = c.hero || {};
    const fallbackSlides = hero.fallbackSlides && hero.fallbackSlides.length > 0 ? hero.fallbackSlides : DEFAULT_HERO_SLIDES;
    setHeroForm({
      useVideo: hero.useVideo ?? true,
      videoUrl1: hero.videoUrl1 || '',
      videoUrl2: hero.videoUrl2 || '',
      fallbackSlides,
    });

    // Himalayan Odyssey
    const odyssey = c.odyssey || {};
    const spots = odyssey.spots && odyssey.spots.length > 0 ? odyssey.spots : DEFAULT_ODYSSEY_SPOTS;
    setOdysseyForm({
      title: odyssey.title || 'A Himalayan Odyssey',
      subtitle: odyssey.subtitle || 'Exquisite Locations',
      spots,
    });

    // Featured Grid (Destinations)
    const destinations = c.destinations && c.destinations.length > 0 ? c.destinations : DEFAULT_DESTINATIONS;
    setDestsList(destinations);

    // Activities
    const activities = c.activities && c.activities.length > 0 ? c.activities : DEFAULT_ACTIVITIES;
    setActivitiesList(activities);

    // Villas & Stays
    const villas = c.villas || {};
    const villasItems = Array.isArray(villas)
      ? villas
      : (villas.items && villas.items.length > 0 ? villas.items : DEFAULT_VILLAS);
    setVillasForm({
      title: villas.title || 'Exclusive Stays',
      subtitle: villas.subtitle || 'Your Exclusive Tranquil Haven at IMAGICA HOLIDAYS',
      items: villasItems,
    });

    // Landing Page States
    const landingStates = c['landing-states'] && c['landing-states'].length > 0 ? c['landing-states'] : DEFAULT_LANDING_STATES;
    setLandingStatesList(landingStates);

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
        {activeSubTab === 'landing-states' && (
          <LandingStatesEditor list={landingStatesList} setList={setLandingStatesList}
            onSave={() => sectionMut.mutate({ section: 'landing-states', data: landingStatesList })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'activities' && (
          <ActivitiesEditor list={activitiesList} setList={setActivitiesList}
            onSave={() => sectionMut.mutate({ section: 'activities', data: activitiesList })} saving={sectionMut.isPending} />
        )}
        {activeSubTab === 'villas' && (
          <VillasEditor form={villasForm} setForm={setVillasForm}
            onSave={() => sectionMut.mutate({ section: 'villas', data: villasForm })} saving={sectionMut.isPending} />
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
