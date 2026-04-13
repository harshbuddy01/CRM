'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Upload, Loader2, Image as ImageIcon, 
  Trash2, Plus, Grip
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageCropperModal } from '@/components/ImageCropperModal';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['media-library', search],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      const res = await api.get('/cms/gallery', { params });
      return res.data.data;
    },
  });

  const [cropFile, setCropFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File is too large (max 20MB)");
      return;
    }

    setCropFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob | null) => {
    if (!croppedBlob || !cropFile) {
      setCropFile(null);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', croppedBlob);
    formData.append('category', 'General');
    formData.append('caption', cropFile.name.split('.')[0]);

    try {
      await api.post('/cms/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded to company library!');
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload.');
    } finally {
      setIsUploading(false);
      setCropFile(null);
    }
  };

  const deleteMutation = async (id: string) => {
    if (!window.confirm('Delete this image permanently from the library?')) return;
    try {
      await api.delete(`/cms/gallery/${id}`);
      toast.success('Image deleted from library');
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    } catch (err: any) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-blue-600" />
            Media Library
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage all your proposal and itinerary photos.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search images..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl border-slate-200"
            />
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="rounded-xl h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileSelect} 
      />

      {/* Grid */}
      <div className="px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading Library...</p>
          </div>
        ) : (data || []).length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Your library is empty</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">Upload amazing photos here to instantly use them across all your itineraries and proposals.</p>
            <Button onClick={() => fileInputRef.current?.click()} className="rounded-xl shadow-lg shadow-blue-200 font-bold">
              <Plus className="w-4 h-4 mr-2" /> Select Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(data || []).map((img: any) => (
              <div 
                key={img.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300"
              >
                <img 
                  src={img.imageUrl} 
                  alt={img.caption || 'Library Image'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-white font-bold text-[10px] truncate">{img.caption || 'Untitled'}</p>
                  <p className="text-white/60 text-[9px] uppercase tracking-widest">{img.category || 'General'}</p>
                  
                  <button 
                    onClick={() => deleteMutation(img.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-rose-500 hover:bg-rose-600 rounded-xl flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-lg"
                    title="Delete permanently"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageCropperModal
        isOpen={!!cropFile}
        imageFile={cropFile}
        onClose={() => setCropFile(null)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
