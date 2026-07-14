'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Crop as CropIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedBlob: Blob | null) => void | Promise<void>;
}

export function ImageCropperModal({ isOpen, onClose, imageFile, onCropComplete }: Props) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (imageFile) {
      setCrop(undefined); // Reset crop state for new images
      const objectUrl = URL.createObjectURL(imageFile);
      setImgSrc(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setImgSrc('');
    }
  }, [imageFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // Default to selecting the entire image 100% free-form
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    });
  }

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) {
      // If no valid crop state is built, return the original file to avoid getting stuck
      if (imageFile) {
        setIsProcessing(true);
        try {
          await onCropComplete(imageFile);
        } catch (e) {
          console.error('Callback error:', e);
        } finally {
          setIsProcessing(false);
        }
      }
      return;
    }
    
    setIsProcessing(true);
    try {
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const canvas = document.createElement('canvas');
      
      // Create canvas with the cropped dimensions
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;

      ctx.drawImage(
        imgRef.current,
        cropX,
        cropY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert canvas back to a Blob, keeping the original mime type or defaulting to jpg
      canvas.toBlob(async (blob) => {
        if (!blob) {
            console.error('Canvas conversion is empty');
            setIsProcessing(false);
            return;
        }
        try {
          await onCropComplete(blob);
        } catch (e) {
          console.error('Crop callback error:', e);
        } finally {
          setIsProcessing(false);
        }
      }, imageFile?.type || 'image/jpeg', 0.95);

    } catch (e) {
      console.error('Crop Error:', e);
      setIsProcessing(false);
      try {
        await onCropComplete(imageFile); // Fallback to original
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-white/20">
        
        {/* Header - Fixed Z-index to prevent cropper bleed */}
        <div className="p-4 border-b flex items-center justify-between bg-slate-50 relative z-20">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CropIcon className="w-5 h-5 text-blue-500" /> Selective Image Cropper
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Drag to crop. Original resolution is preserved. Uncropped borders are removed.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" disabled={isProcessing}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Cropping Area - Hidden overflow and flex center */}
        <div className="flex-1 p-6 bg-slate-900 flex items-center justify-center overflow-hidden relative z-10 w-full" style={{ height: '65vh' }}>
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <Upload className="w-6 h-6 text-blue-500 absolute animate-pulse" />
              </div>
              <p className="text-white font-bold text-sm tracking-wide">Uploading cropped image...</p>
              <p className="text-slate-400 text-xs">Please wait, this will close automatically.</p>
            </div>
          )}
          {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              className="flex justify-center items-center max-w-full max-h-full"
            >
              <img
                ref={imgRef}
                alt="Crop Original"
                src={imgSrc}
                onLoad={onImageLoad}
                className="block max-w-full border border-white/10 shadow-2xl object-contain"
                style={{ maxHeight: 'calc(65vh - 3rem)' }}
              />
            </ReactCrop>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-slate-400 text-sm">Loading image reader...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-slate-50 flex items-center justify-between relative z-20">
          <p className="text-xs font-medium text-slate-400">Aspect Ratio: Freeform</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase tracking-wider text-xs px-6" disabled={isProcessing}>
              Cancel Upload
            </Button>
            <Button onClick={handleConfirm} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-wider text-xs h-10 px-8" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CropIcon className="w-4 h-4 mr-2" />}
              {isProcessing ? 'Uploading...' : 'Confirm & Upload'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
