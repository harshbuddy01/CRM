'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Search, X, Loader2, Image as ImageIcon, 
  Filter, Check, MousePointer2, Upload, Camera, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageCropperModal } from './ImageCropperModal';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, title = 'Media Library' }: MediaLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['media-library', search, selectedCategory],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await api.get('/cms/gallery', { params });
      return res.data.data;
    },
    enabled: isOpen,
  });

  // Extract unique categories for filtering
  const { data: allImages = [] } = useQuery({
    queryKey: ['media-library-categories'],
    queryFn: async () => {
      const res = await api.get('/cms/gallery');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const categories = Array.from(new Set(allImages.map((img: any) => img.category).filter(Boolean))) as string[];

  const [cropFile, setCropFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    setCropFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob | null) => {
    if (!croppedBlob || !cropFile) {
      setCropFile(null); // Cancelled
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    // We send the cropped Blob
    formData.append('image', croppedBlob);
    formData.append('category', selectedCategory || 'General');
    formData.append('caption', cropFile.name.split('.')[0]);

    try {
      await api.post('/cms/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded to company library!');
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    } catch (err: any) {
      console.error('Upload Error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload. check permissions.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select a photo from your centralized company library</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileSelect} 
        />

        {/* Filters */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by caption or destination..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full h-8 px-4 text-[10px] uppercase tracking-wider font-bold"
             >
                All
             </Button>
             {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full h-8 px-4 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap"
                >
                  {cat}
                </Button>
             ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-sm font-medium">Fetching media assets...</p>
            </div>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No results found</p>
              <p className="text-xs text-slate-400">Try adjusting your search or category filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((img: any) => (
                <div 
                  key={img.id}
                  onClick={() => onSelect(img.imageUrl)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                >
                  <img 
                    src={img.imageUrl} 
                    alt={img.caption} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white font-bold text-[10px] truncate">{img.caption || 'Untitled'}</p>
                    <p className="text-white/60 text-[9px] uppercase tracking-widest">{img.category || 'Standard'}</p>
                    
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-lg">
                         <Check className="w-4 h-4" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteMutation(img.id); }}
                        className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-lg hover:bg-rose-600"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Icon Indicator for easier clarity */}
                  <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100">
                    Select Asset
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50/50 flex items-center justify-between">
           <p className="text-xs text-slate-400 italic">
             Total {data?.length || 0} assets found in this view
           </p>
            <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               onClick={() => fileInputRef.current?.click()} 
               disabled={isUploading}
               className="rounded-xl text-xs font-bold uppercase tracking-wider border-blue-200 hover:bg-blue-50 text-blue-600 h-10 px-6"
             >
               {isUploading ? (
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               ) : (
                 <Upload className="w-4 h-4 mr-2" />
               )}
               {isUploading ? 'Uploading...' : 'Upload New Image'}
             </Button>
             <div className="w-px h-6 bg-slate-200 mx-2" />
             <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs font-bold uppercase tracking-wider">
               Cancel
             </Button>
            </div>
        </div>
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
