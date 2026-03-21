'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileText, Image, File, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const FILE_ICONS: Record<string, any> = {
  PDF: FileText, JPG: Image, JPEG: Image, PNG: Image, GIF: Image, WEBP: Image,
};

export function DocsTab({ queryId }: { queryId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState('');

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documents', queryId],
    queryFn: async () => {
      const res = await api.get(`/queries/${queryId}/documents`);
      return res.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: globalThis.File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (label) formData.append('label', label);
      await api.post(`/queries/${queryId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded');
      setLabel('');
      queryClient.invalidateQueries({ queryKey: ['documents', queryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents', queryId] });
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Documents</h3>
        <div className="flex items-center gap-2">
          <Input placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)} className="w-48" />
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
          }} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} className="gap-2">
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
          </Button>
        </div>
      </div>

      {!docs?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No documents uploaded yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map((doc: any) => {
            const Icon = FILE_ICONS[doc.fileType] || File;
            return (
              <Card key={doc.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.label && `${doc.label} • `}{doc.fileType} • {doc.fileSize} KB
                      {doc.uploader?.name && ` • by ${doc.uploader.name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(new Date(doc.createdAt), 'PP')}</p>
                  </div>
                  <div className="flex gap-1">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                      <Button size="icon" variant="ghost"><Download className="w-4 h-4" /></Button>
                    </a>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => {
                      if (confirm('Delete this document?')) deleteMutation.mutate(doc.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
