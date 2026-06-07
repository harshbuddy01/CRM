'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';
import { Loader2, Save, Building, Mail, Webhook, CreditCard, ShieldAlert, GitMerge, Check, Edit2, FileText, Upload } from 'lucide-react';

function StatusSettingsTab() {
  const queryClient = useQueryClient();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data: statuses, isLoading } = useQuery({
    queryKey: ['status-settings'],
    queryFn: async () => {
      const res = await api.get('/status-settings');
      return res.data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.patch(`/status-settings/${editingCode}`, payload);
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      setEditingCode(null);
      queryClient.invalidateQueries({ queryKey: ['status-settings'] });
      // Invalidate queries so pipeline colours refresh immediately
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Statuses</CardTitle>
        <CardDescription>
          Customize the colors and dashboard visibility for the core query pipeline stages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses?.map((status: any) => (
            <div key={status.code} className="p-4 border rounded-lg flex items-center justify-between">
              {editingCode === status.code ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={editForm.colorHex} onChange={e => setEditForm({...editForm, colorHex: e.target.value})} className="w-12 p-1 h-9" />
                      <Input value={editForm.colorHex} onChange={e => setEditForm({...editForm, colorHex: e.target.value})} className="uppercase uppercase font-mono" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <input type="checkbox" id={`vis-${status.code}`} checked={editForm.isDashboardVisible} onChange={e => setEditForm({...editForm, isDashboardVisible: e.target.checked})} className="w-4 h-4" />
                    <Label htmlFor={`vis-${status.code}`}>Show on Dashboard</Label>
                  </div>
                  <div className="flex justify-end gap-2 pb-0.5">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCode(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: status.colorHex }} />
                    <div>
                      <p className="font-semibold">{status.label} <span className="text-muted-foreground text-xs font-mono ml-2">{status.code}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {status.isDashboardVisible ? 'Visible on Dashboard' : 'Hidden from Dashboard'}
                        {status.isLocked ? ' • Read-only Stage' : ''}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingCode(status.code);
                    setEditForm({ ...status });
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ImageUploadFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  description?: string;
}

function ImageUploadField({ label, placeholder, value, onChange, description }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        onChange(res.data.url);
        toast.success(`${label} uploaded successfully!`);
      } else {
        toast.error('Upload response invalid');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex justify-between items-center">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-normal transition-colors"
          >
            Clear Image
          </button>
        )}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10"
          />
          {value && (
            <div className="absolute right-2 top-1.5 w-6 h-6 rounded border overflow-hidden bg-muted flex items-center justify-center">
              <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 gap-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Upload className="w-4 h-4 text-indigo-600" />
          )}
          Upload
        </Button>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {value && (
        <div className="mt-2 p-1.5 border rounded-lg bg-muted/20 max-w-[200px] overflow-hidden group relative">
          <img src={value} alt="Preview thumbnail" className="w-full h-24 object-cover rounded shadow-sm" />
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // State for form fields
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Fetch settings
  const { data, isLoading } = useQuery({
    queryKey: ['org-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data) Object.keys(data).length > 0 && setFormData(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      await api.post('/settings', payload);
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['org-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground max-w-md">Only system administrators can access and configure Global Organisation Settings.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your company profile, signatures, and third-party API configurations.</p>
      </div>

      <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-8 w-full">
        {/* Vertical Sidebar Navigation */}
        <div className="md:w-64 shrink-0">
          <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
            <TabsTrigger 
              value="general" 
              className="justify-start px-4 py-2.5 w-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none hover:bg-muted/50 transition-colors rounded-lg"
            >
              <Building className="w-4 h-4 mr-3" /> General Details
            </TabsTrigger>
            <TabsTrigger 
              value="email" 
              className="justify-start px-4 py-2.5 w-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none hover:bg-muted/50 transition-colors rounded-lg"
            >
              <Mail className="w-4 h-4 mr-3" /> Email Signature
            </TabsTrigger>
            <TabsTrigger 
              value="apis" 
              className="justify-start px-4 py-2.5 w-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none hover:bg-muted/50 transition-colors rounded-lg"
            >
              <Webhook className="w-4 h-4 mr-3" /> Integrations & API
            </TabsTrigger>
            <TabsTrigger 
              value="statuses" 
              className="justify-start px-4 py-2.5 w-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none hover:bg-muted/50 transition-colors rounded-lg"
            >
              <GitMerge className="w-4 h-4 mr-3" /> Pipeline Statuses
            </TabsTrigger>
            <TabsTrigger 
              value="pdf-design" 
              className="justify-start px-4 py-2.5 w-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none hover:bg-muted/50 transition-colors rounded-lg"
            >
              <FileText className="w-4 h-4 mr-3" /> Proposal PDF Design
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl space-y-6">
          <TabsContent value="general" className="mt-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>These details appear on proposals and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    placeholder="E.g. Travel Dreams Inc." 
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    placeholder="hello@example.com"
                    value={formData.companyEmail || ''}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input 
                    placeholder="+91 98765 43210"
                    value={formData.companyPhone || ''}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input 
                    placeholder="https://www.example.com"
                    value={formData.companyWebsite || ''}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Registered Office Address</Label>
                <Input 
                  placeholder="123 Travel Avenue, City, Country"
                  value={formData.companyAddress || ''}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input 
                    placeholder="E.g. 19AABC1234K1ZV" 
                    value={formData.companyGst || ''}
                    onChange={(e) => setFormData({ ...formData, companyGst: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN</Label>
                  <Input 
                    placeholder="E.g. AABC1234K" 
                    value={formData.companyPan || ''}
                    onChange={(e) => setFormData({ ...formData, companyPan: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-2">
                <ImageUploadField 
                  label="Company Logo" 
                  placeholder="https://example.com/logo.png" 
                  value={formData.companyLogoUrl || ''} 
                  onChange={(val) => setFormData({ ...formData, companyLogoUrl: val })}
                  description="Provide a company logo to display on PDF itineraries and signatures. Direct URL or upload an image."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>These details appear at the bottom of tax invoices for bank transfer payment instructions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input 
                    placeholder="E.g. Imagica Holidays Pvt. Ltd." 
                    value={formData.bankAccountName || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input 
                    placeholder="E.g. Yes Bank" 
                    value={formData.bankName || ''}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input 
                    placeholder="E.g. 002300800123456" 
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input 
                    placeholder="E.g. YESB0002308" 
                    value={formData.bankIfscCode || ''}
                    onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tax Invoice Customization</CardTitle>
              <CardDescription>Customize the visual assets displayed on generated Tax Invoice PDFs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploadField 
                label="Invoice Top Header Banner" 
                placeholder="https://example.com/header-banner.jpg" 
                value={formData.invoiceHeaderBannerUrl || ''} 
                onChange={(val) => setFormData({ ...formData, invoiceHeaderBannerUrl: val })}
                description="Upload the top header image banner (e.g. scenic views of Kashmir, Sikkim, Kerala)."
              />
              <ImageUploadField 
                label="Invoice Middle Polaroid Banner" 
                placeholder="https://example.com/middle-banner.jpg" 
                value={formData.invoiceMiddleBannerUrl || ''} 
                onChange={(val) => setFormData({ ...formData, invoiceMiddleBannerUrl: val })}
                description="Upload the middle/footer polaroid pictures banner."
              />
              <ImageUploadField 
                label="Feedback QR Code" 
                placeholder="https://example.com/qr-code.png" 
                value={formData.invoiceQrCodeUrl || ''} 
                onChange={(val) => setFormData({ ...formData, invoiceQrCodeUrl: val })}
                description="Upload a Google Review / Feedback QR Code to show in the feedback section."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Global Email Signature</CardTitle>
              <CardDescription>
                This signature will be automatically appended to the bottom of every outbound communications sent from the CRM (like Proposals or Custom Emails).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <Label className="mb-2 block">Signature Body</Label>
                <RichTextEditor 
                  value={formData.emailSignature || ''}
                  onChange={(val) => setFormData({ ...formData, emailSignature: val })}
                  placeholder="Warm regards,&#10;The Team at Travel Dreams"
                  className="min-h-[250px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="mt-0 space-y-6 outline-none">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <ShieldAlert className="w-5 h-5 mr-2" />
                Security Warning
              </CardTitle>
              <CardDescription className="text-amber-700/80">
                Changing these keys will immediately affect live production services. Ensure you are copying the exact Sandbox or Live keys from your developer portals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <CardTitle>Razorpay Payment Gateway</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Razorpay Key ID</Label>
                <Input 
                  type="password"
                  value={formData.razorpayKeyId || ''}
                  onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_xxxxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>Razorpay Key Secret</Label>
                <Input 
                  type="password"
                  value={formData.razorpayKeySecret || ''}
                  onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                  placeholder="••••••••••••••••••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Razorpay Webhook Secret</Label>
                <Input 
                  type="password"
                  value={formData.razorpayWebhookSecret || ''}
                  onChange={(e) => setFormData({ ...formData, razorpayWebhookSecret: e.target.value })}
                  placeholder="••••••••••••••••••••••••"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <CardTitle>SendGrid Email Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SendGrid API Key</Label>
                <Input 
                  type="password"
                  value={formData.sendgridApiKey || ''}
                  onChange={(e) => setFormData({ ...formData, sendgridApiKey: e.target.value })}
                  placeholder="SG._xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses" className="mt-0 outline-none">
          <StatusSettingsTab />
        </TabsContent>

        <TabsContent value="pdf-design" className="mt-0 space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Proposal PDF Layout Customization</CardTitle>
              <CardDescription>
                Customize background assets, banner layouts, watermarks, and theme colors for printed/exported itinerary PDFs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploadField 
                  label="Cover Page Hero Photo" 
                  placeholder="https://example.com/cover-train.jpg" 
                  value={formData.pdfCoverPhoto || ''} 
                  onChange={(val) => setFormData({ ...formData, pdfCoverPhoto: val })}
                  description="This is the main cover image. Defaults to the Darjeeling toy train photo."
                />
                <ImageUploadField 
                  label="Page Top Banner" 
                  placeholder="https://example.com/header-banner.jpg" 
                  value={formData.pdfHeaderBanner || ''} 
                  onChange={(val) => setFormData({ ...formData, pdfHeaderBanner: val })}
                  description="Horizontal landscape/illustration image displayed below page headers (e.g. Page 3, 4)."
                />
                <ImageUploadField 
                  label="Page Background Watermark" 
                  placeholder="https://example.com/watermark.png" 
                  value={formData.pdfWatermark || ''} 
                  onChange={(val) => setFormData({ ...formData, pdfWatermark: val })}
                  description="Faint background watermark image behind body text."
                />
                <ImageUploadField 
                  label="Page Bottom Silhouette" 
                  placeholder="https://example.com/bottom-silhouette.png" 
                  value={formData.pdfBottomSilhouette || ''} 
                  onChange={(val) => setFormData({ ...formData, pdfBottomSilhouette: val })}
                  description="Faint mountain/tree silhouette displayed at the bottom of pages."
                />
                <div className="space-y-2">
                  <Label>Primary Theme Color (Hex)</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={formData.pdfThemeColor || '#0f3d2f'} onChange={e => setFormData({...formData, pdfThemeColor: e.target.value})} className="w-12 p-1 h-9" />
                    <Input value={formData.pdfThemeColor || '#0f3d2f'} onChange={e => setFormData({...formData, pdfThemeColor: e.target.value})} className="uppercase font-mono" />
                  </div>
                  <p className="text-xs text-muted-foreground">Main brand color (e.g., used for headers and footers). Defaults to Forest Green (#0f3d2f).</p>
                </div>
                <div className="space-y-2">
                  <Label>Accent Theme Color (Hex)</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={formData.pdfAccentColor || '#d4af37'} onChange={e => setFormData({...formData, pdfAccentColor: e.target.value})} className="w-12 p-1 h-9" />
                    <Input value={formData.pdfAccentColor || '#d4af37'} onChange={e => setFormData({...formData, pdfAccentColor: e.target.value})} className="uppercase font-mono" />
                  </div>
                  <p className="text-xs text-muted-foreground">Highlight accent color (e.g., gold borders and icons). Defaults to Gold (#d4af37).</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-indigo-200 bg-indigo-50/10">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-900 gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Canva Full-Page Background Templates
              </CardTitle>
              <CardDescription className="text-indigo-800/80">
                Design the entire page layout in Canva (with headers, footers, and watermarks), export as images, upload them here, and overlay dynamic CRM text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm">
                <input
                  type="checkbox"
                  id="pdfUseCanvaBackground"
                  checked={formData.pdfUseCanvaBackground === 'true'}
                  onChange={(e) => setFormData({ ...formData, pdfUseCanvaBackground: e.target.checked ? 'true' : 'false' })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="pdfUseCanvaBackground" className="font-semibold text-indigo-900 cursor-pointer">
                  Enable Canva Background Templates
                </Label>
              </div>

              {formData.pdfUseCanvaBackground === 'true' && (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploadField
                      label="Canva Cover Page Background"
                      placeholder="https://example.com/canva-cover.png"
                      value={formData.pdfCanvaCover || ''}
                      onChange={(val) => setFormData({ ...formData, pdfCanvaCover: val })}
                      description="Full A4 size background image for Page 1. Best exported from Canva as 210mm x 297mm PNG/JPG."
                    />
                    <ImageUploadField
                      label="Canva Inner Page Background"
                      placeholder="https://example.com/canva-inner.png"
                      value={formData.pdfCanvaInner || ''}
                      onChange={(val) => setFormData({ ...formData, pdfCanvaInner: val })}
                      description="Full A4 background applied behind Page 2, 3, and all Day Wise Detailed pages. Programmatically hides default top/bottom lines."
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-indigo-950 text-sm mb-3">Positioning & Margins (Advanced)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Cover Overlay Top</Label>
                        <Input
                          value={formData.pdfCoverOverlayTop || '130mm'}
                          onChange={(e) => setFormData({ ...formData, pdfCoverOverlayTop: e.target.value })}
                          placeholder="e.g. 130mm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Inner Top Margin</Label>
                        <Input
                          value={formData.pdfPagePaddingTop || '38mm'}
                          onChange={(e) => setFormData({ ...formData, pdfPagePaddingTop: e.target.value })}
                          placeholder="e.g. 38mm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Inner Bottom Margin</Label>
                        <Input
                          value={formData.pdfPagePaddingBottom || '20mm'}
                          onChange={(e) => setFormData({ ...formData, pdfPagePaddingBottom: e.target.value })}
                          placeholder="e.g. 20mm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Inner Left Margin</Label>
                        <Input
                          value={formData.pdfPagePaddingLeft || '15mm'}
                          onChange={(e) => setFormData({ ...formData, pdfPagePaddingLeft: e.target.value })}
                          placeholder="e.g. 15mm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Inner Right Margin</Label>
                        <Input
                          value={formData.pdfPagePaddingRight || '15mm'}
                          onChange={(e) => setFormData({ ...formData, pdfPagePaddingRight: e.target.value })}
                          placeholder="e.g. 15mm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Adjust these margin values (e.g. in millimeters <code>mm</code>) to align the dynamic text exactly within your Canva template spaces.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          <div className="flex justify-end pt-6 border-t mt-8">
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-2.5 shadow-sm transition-all"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save All Settings
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
