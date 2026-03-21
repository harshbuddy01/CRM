'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Building2, User, Phone, Mail, Globe, MapPin, Target } from 'lucide-react';

export default function NewAgentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    gstNumber: '',
    city: '',
    address: '',
    isActive: true,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/agents', data);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success('Agent onboarded successfully');
      router.push(`/agents/${res.data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create agent');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.mobile) {
      toast.error('Company Name and Mobile are required');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/agents')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Onboard New Agent</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Section 1: Company */}
           <div className="md:col-span-1">
             <h3 className="text-lg font-semibold flex items-center gap-2">
               <Building2 className="w-5 h-5 text-blue-600" />
               Agency Info
             </h3>
             <p className="text-xs text-muted-foreground mt-1">Official business registration details.</p>
           </div>
           
           <Card className="md:col-span-2">
              <CardContent className="pt-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="companyName">Company / Agency Name *</Label>
                    <Input 
                      id="companyName" 
                      placeholder="E.g. Zenith Travels" 
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="gst">GST Number (Optional)</Label>
                       <Input 
                         id="gst" 
                         placeholder="22AAAAA0000A1Z5" 
                         value={formData.gstNumber}
                         onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                         className="uppercase"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="city">City</Label>
                       <Input 
                         id="city" 
                         placeholder="New Delhi" 
                         value={formData.city}
                         onChange={e => setFormData({...formData, city: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Full Office Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Building name, Floor, Locality..."
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                 </div>
              </CardContent>
           </Card>

           {/* Section 2: Contact */}
           <div className="md:col-span-1">
             <h3 className="text-lg font-semibold flex items-center gap-2">
               <User className="w-5 h-5 text-indigo-600" />
               Point of Contact
             </h3>
             <p className="text-xs text-muted-foreground mt-1">Who should we call for bookings?</p>
           </div>

           <Card className="md:col-span-2">
              <CardContent className="pt-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="contact">Contact Person Name</Label>
                    <Input 
                      id="contact" 
                      placeholder="E.g. Rajesh Kumar" 
                      value={formData.contactPerson}
                      onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="mobile">Mobile Number *</Label>
                       <Input 
                         id="mobile" 
                         placeholder="+91 99999 00000" 
                         value={formData.mobile}
                         onChange={e => setFormData({...formData, mobile: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="email">Email Address</Label>
                       <Input 
                         id="email" 
                         type="email"
                         placeholder="partner@agency.com" 
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="flex justify-end gap-3 pt-6">
           <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
           <Button type="submit" className="bg-blue-600 px-8" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Partnership
           </Button>
        </div>
      </form>
    </div>
  );
}
