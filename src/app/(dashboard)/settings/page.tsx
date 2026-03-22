'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Save, Building, Mail, Webhook, CreditCard, ShieldAlert, GitMerge, Check, Edit2 } from 'lucide-react';

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
              <div className="space-y-2 pt-2">
                <Label>Company Logo URL (Optional)</Label>
                <Input 
                  placeholder="https://example.com/logo.png"
                  value={formData.companyLogoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, companyLogoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Provide a direct URL to a standard ratio image (PNG or JPG).</p>
              </div>
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
