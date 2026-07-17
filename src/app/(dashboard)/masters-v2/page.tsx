'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Building2, Map, Car, Bed, Utensils, Palette, CalendarDays,
  Plus, Edit2, Trash2, Loader2, Search, X, Upload, ChevronRight,
  Check, ImageIcon, Eye, KeyRound, RefreshCw, MessageSquare, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CATEGORIES = [
  { id: 'destinations', label: 'Destinations', icon: Map, color: 'bg-indigo-50 border-indigo-200 text-indigo-700', activeColor: 'bg-indigo-600 border-indigo-600 text-white', desc: 'Goa, Manali, Bali' },
  { id: 'hotels', label: 'Hotels', icon: Building2, color: 'bg-rose-50 border-rose-200 text-rose-700', activeColor: 'bg-rose-600 border-rose-600 text-white', desc: 'Hotels per destination' },
  { id: 'drivers', label: 'Drivers', icon: Car, color: 'bg-amber-50 border-amber-200 text-amber-700', activeColor: 'bg-amber-600 border-amber-600 text-white', desc: 'Driver list & Portal logins' },
  { id: 'suppliers', label: 'Suppliers', icon: Building2, color: 'bg-blue-50 border-blue-200 text-blue-700', activeColor: 'bg-blue-600 border-blue-600 text-white', desc: 'Vendors, DMCs, transport providers' },
  { id: 'activities', label: 'Activities', icon: Palette, color: 'bg-green-50 border-green-200 text-green-700', activeColor: 'bg-green-600 border-green-600 text-white', desc: 'Sightseeing, trekking, experiences' },
  { id: 'transfers', label: 'Transfers', icon: Car, color: 'bg-orange-50 border-orange-200 text-orange-700', activeColor: 'bg-orange-600 border-orange-600 text-white', desc: 'Vehicles, cabs, transport types' },
  { id: 'room-types', label: 'Room Types', icon: Bed, color: 'bg-purple-50 border-purple-200 text-purple-700', activeColor: 'bg-purple-600 border-purple-600 text-white', desc: 'Single, double, suite categories' },
  { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', activeColor: 'bg-yellow-600 border-yellow-600 text-white', desc: 'BB, HB, FB, All Inclusive' },
  { id: 'package-themes', label: 'Themes', icon: Palette, color: 'bg-pink-50 border-pink-200 text-pink-700', activeColor: 'bg-pink-600 border-pink-600 text-white', desc: 'Adventure, Honeymoon, Family' },
  { id: 'day-itinerary-templates', label: 'Day Itinerary', icon: CalendarDays, color: 'bg-teal-50 border-teal-200 text-teal-700', activeColor: 'bg-teal-600 border-teal-600 text-white', desc: 'Reusable day-by-day templates' },
  { id: 'gallery-images', label: 'Media Gallery', icon: ImageIcon, color: 'bg-zinc-50 border-zinc-200 text-zinc-700', activeColor: 'bg-zinc-800 border-zinc-800 text-white', desc: 'Stock photos, destination assets' },
];

export default function MastersV2Page() {
  const searchParams = useSearchParams();
  const initialCatId = searchParams.get('cat');
  const [active, setActive] = useState<string | null>(initialCatId || CATEGORIES[0].id);
  const activeCategory = CATEGORIES.find(c => c.id === active) || CATEGORIES[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Database</h1>
        <p className="text-muted-foreground text-sm mt-1">Global catalogs for travel components and service providers</p>
      </div>

      {/* Category Cards ON SCREEN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(isActive ? null : cat.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center
                ${isActive ? cat.activeColor + ' shadow-md scale-[1.02]' : cat.color + ' hover:shadow-sm hover:scale-[1.01]'}`}
            >
              <Icon className="w-7 h-7" />
              <span className="text-xs font-semibold leading-tight">{cat.label}</span>
              <span className={`text-[10px] leading-tight ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>{cat.desc}</span>
              {isActive && <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-current" style={{borderTopColor:'currentColor'}} />}
            </button>
          );
        })}
      </div>

      {/* Content Panel */}
      {activeCategory && (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/30">
            <activeCategory.icon className="w-5 h-5 text-muted-foreground" />
            <div><h2 className="font-semibold">{activeCategory.label}</h2><p className="text-xs text-muted-foreground">{activeCategory.desc}</p></div>
            <button onClick={() => setActive(null)} className="ml-auto text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <MasterPanel category={activeCategory} />
        </div>
      )}

      {!active && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          <ChevronRight className="w-8 h-8 mb-3 opacity-30" />
          <p className="font-medium">Select a category above to manage records</p>
          <p className="text-sm mt-1 opacity-70">Click any coloured card to view and add items</p>
        </div>
      )}
    </div>
  );
}

function MasterPanel({ category }: { category: typeof CATEGORIES[0] }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const getRequiredPermission = (catId: string) => {
    if (catId === 'suppliers' || catId === 'drivers') return 'master.manage_vendors';
    if (['hotels', 'room-types', 'meal-plans'].includes(catId)) return 'master.manage_hotels';
    return 'master.manage_destinations';
  };
  const reqPermission = getRequiredPermission(category.id);
  const canManage = !!(user?.permissions?.[reqPermission] || user?.permissions?.['master.manage_destinations']);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);

  // Share Credentials States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareItem, setShareItem] = useState<any>(null);
  const [shareType, setShareType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [waRecipient, setWaRecipient] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const sendEmailMut = useMutation({
    mutationFn: (data: { to: string, subject: string, body: string }) => {
      const endpoint = category.id === 'hotels' 
        ? `/masters/hotels/${shareItem?.id}/send-credentials` 
        : `/drivers/${shareItem?.id}/send-credentials`;
      return api.post(endpoint, data);
    },
    onSuccess: () => {
      toast.success('Credentials email sent successfully!');
      setIsShareModalOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send email via backend'),
  });

  const openShareModal = (item: any, type: 'whatsapp' | 'email') => {
    setShareItem(item);
    setShareType(type);
    
    const isHotel = category.id === 'hotels';
    const partnerName = item.name || '';
    const loginId = item.loginId || '';
    const pin = item.loginPassword || '';
    
    const portalUrl = isHotel 
      ? `https://hotel.imagicaholidays.com/hotel/${item.id}` 
      : `https://driver.imagicaholidays.com/driver/${item.id}`;

    setWaRecipient(isHotel ? '' : (item.phone || ''));
    setEmailRecipient(''); // Default to empty so they can type it
    
    setWaMessage(
      `Hello ${partnerName},\n\nHere are your access credentials for the Imagica Holidays ${isHotel ? 'Hotel' : 'Driver'} Partner Portal:\n\n🔗 Link: ${portalUrl}\n👤 Login ID: ${loginId}\n🔑 Password/PIN: ${pin}\n\nThank you for partnering with Imagica Holidays!`
    );
    
    setEmailSubject(`Your Imagica Holidays Partner Portal Credentials - ${partnerName}`);
    
    setEmailBody(
      `Hello ${partnerName},\n\nHere are your access credentials for the Imagica Holidays ${isHotel ? 'Hotel' : 'Driver'} Partner Portal:\n\nLink: ${portalUrl}\nLogin ID: ${loginId}\nPassword/PIN: ${pin}\n\nThank you for partnering with Imagica Holidays!\n\nBest regards,\nImagica Holidays`
    );
    
    setIsShareModalOpen(true);
  };

  const basePath = category.id === 'drivers' ? '' : (['destinations', 'hotels'].includes(category.id) ? '/masters' : '/masters-v2');

  const { data, isLoading } = useQuery({
    queryKey: [basePath, category.id, search],
    queryFn: () => {
      const url = basePath ? `${basePath}/${category.id}` : `/${category.id}`;
      return api.get(url, { params: search ? { search } : {} }).then(r => r.data?.data || r.data);
    }
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [basePath, category.id] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const url = basePath ? `${basePath}/${category.id}/${id}` : `/${category.id}/${id}`;
      return api.delete(url);
    },
    onSuccess: () => { toast.success('Deleted'); invalidate(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const generateCredsMutation = useMutation({
    mutationFn: (itemId: string) => {
      const endpoint = category.id === 'hotels' ? `/masters/hotels/${itemId}/credentials` : `/drivers/${itemId}/credentials`;
      return api.post(endpoint);
    },
    onSuccess: (res) => {
      toast.success(`Portal credentials generated! PIN: ${res.data.data.loginPassword || res.data.data.pin}`);
      invalidate();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to generate credentials'),
  });

  const startEdit = (item: any) => { setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };
  
  // V1 endpoints return an array, V2 returns { items, total }
  let items = Array.isArray(data) ? data : (data?.items || []);
  
  // Client-side search for V1 endpoints (since backend doesn't support ?search yet)
  if (search && Array.isArray(data)) {
    const s = search.toLowerCase();
    items = items.filter((item: any) => (item.name || item.title || item.companyName || item.vehicleType || '').toLowerCase().includes(s));
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={`Search ${category.label.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        {canManage && !showForm && (
          <Button size="sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add {category.label.replace(/s$/, '').replace('ie$', 'y')}
          </Button>
        )}
      </div>

      {showForm && canManage && (
        <MasterForm category={category} editItem={editItem} onClose={closeForm} onSaved={invalidate} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <category.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-sm">{search ? `No results for "${search}"` : `No ${category.label.toLowerCase()} added yet`}</p>
          {!search && canManage && <Button variant="outline" size="sm" className="mt-3" onClick={() => { setEditItem(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-1" /> Add First</Button>}
        </div>
      ) : (
        <MasterTable 
          category={category} 
          items={items} 
          onView={setViewItem} 
          onEdit={startEdit} 
          onDelete={(id) => { if (confirm('Delete this record?')) deleteMutation.mutate(id); }} 
          canManage={canManage}
          onGenerateCredentials={(id) => generateCredsMutation.mutate(id)}
          generatingId={generateCredsMutation.variables}
          onShareCredentials={openShareModal}
        />
      )}
      {data && <p className="text-xs text-muted-foreground text-right">{data.total || items.length} total records</p>}

      {viewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center p-4">
           <div className="bg-background rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b">
                 <h2 className="font-semibold">{category.label} Details</h2>
                 <button onClick={() => setViewItem(null)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 text-sm">
                 {Object.entries(viewItem)
                   .filter(([k, v]) => !['id', 'deletedAt'].includes(k) && typeof v !== 'object')
                   .map(([k, v]) => (
                     <div key={k} className="flex flex-col pb-2 border-b last:border-0 border-muted">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="mt-1 font-medium">{String(v || '—')}</span>
                     </div>
                 ))}
                 {viewItem.destination && (
                     <div className="flex flex-col pb-2 border-b last:border-0 border-muted">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Destination</span>
                        <span className="mt-1 font-medium">{viewItem.destination?.name}</span>
                     </div>
                 )}
                 {(viewItem.photoUrl || viewItem.iconUrl || viewItem.imageUrl) && (
                     <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground uppercase mb-2">Photo</span>
                        <img src={viewItem.photoUrl || viewItem.iconUrl || viewItem.imageUrl} className="w-full h-auto max-h-[300px] object-contain rounded shadow-sm border bg-slate-50" alt="Preview" />
                     </div>
                 )}
              </div>
           </div>
        </div>
      )}
      {/* ── Share Credentials Modal ── */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {shareType === 'whatsapp' ? <MessageSquare className="text-emerald-500 w-5 h-5" /> : <Mail className="text-blue-500 w-5 h-5" />}
              {shareType === 'whatsapp' ? 'Share via WhatsApp' : 'Share via Email'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Review and edit the template credentials message before sharing.
            </DialogDescription>
          </DialogHeader>

          {shareType === 'whatsapp' && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient Phone Number</label>
                <Input 
                  value={waRecipient} 
                  onChange={(e) => setWaRecipient(e.target.value)} 
                  placeholder="Enter phone with country code (e.g. 919876543210)"
                  className="font-medium text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Body</label>
                <textarea 
                  value={waMessage} 
                  onChange={(e) => setWaMessage(e.target.value)} 
                  className="w-full text-xs font-sans p-3 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <Button 
                onClick={() => {
                  const phone = waRecipient.replace(/\D/g, '');
                  window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(waMessage)}`, '_blank');
                  setIsShareModalOpen(false);
                }} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
              >
                Open in WhatsApp
              </Button>
            </div>
          )}

          {shareType === 'email' && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient Email</label>
                <Input 
                  value={emailRecipient} 
                  onChange={(e) => setEmailRecipient(e.target.value)} 
                  placeholder="enter.email@domain.com"
                  type="email"
                  className="font-medium text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                <Input 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  placeholder="Email Subject"
                  className="font-medium text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Body</label>
                <textarea 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  className="w-full text-xs font-sans p-3 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button 
                onClick={() => sendEmailMut.mutate({ to: emailRecipient, subject: emailSubject, body: emailBody })} 
                disabled={sendEmailMut.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs"
              >
                {sendEmailMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send via System Emailer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MasterForm({ category, editItem, onClose, onSaved }: { category: typeof CATEGORIES[0]; editItem: any; onClose: () => void; onSaved: () => void; }) {
  const [form, setForm] = useState<Record<string, any>>(editItem ? { ...editItem, destinationId: editItem.destination?.id || editItem.destinationId || '' } : { isActive: true });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(editItem?.photoUrl || editItem?.iconUrl || editItem?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations-dropdown'],
    queryFn: () => api.get('/masters-v2/destinations').then(r => r.data.data),
    enabled: ['hotels', 'activities', 'transfers', 'day-itinerary-templates'].includes(category.id),
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isV1 = ['destinations', 'hotels'].includes(category.id);
      const url = editItem ? (isV1 ? `/masters/${category.id}/${editItem.id}` : `/masters-v2/${category.id}/${editItem.id}`) : (isV1 ? `/masters/${category.id}` : `/masters-v2/${category.id}`);
      const method = editItem ? (isV1 ? 'put' : 'patch') : 'post';

      if (isV1) {
        const payload = { ...form };
        delete payload.id; delete payload.createdAt; delete payload.updatedAt; delete payload.deletedAt; delete payload.destination;
        if (payload.basePrice) payload.basePrice = Number(payload.basePrice);
        if (typeof payload.isActive === 'string') payload.isActive = payload.isActive === 'true';
        await (api as any)[method](url, payload);
      } else {
        const fd = new FormData();
        const skipKeys = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'photoUrl', 'iconUrl', 'imageUrl', 'destination'];
        Object.entries(form).forEach(([k, v]) => { 
          if (skipKeys.includes(k) || (typeof v === 'object' && v !== null && !(v instanceof File))) return;
          if (v !== null && v !== undefined && v !== '') fd.append(k, String(v)); 
        });
        if (photoFile) fd.append('photo', photoFile);
        await (api as any)[method](url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(editItem ? 'Updated!' : 'Added!');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const hasPhoto = ['activities', 'transfers', 'package-themes'].includes(category.id);

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5 bg-muted/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{editItem ? 'Edit' : 'Add New'} {category.label.replace(/s$/, '')}</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {category.id === 'destinations' && (<>
          <Field label="Destination Name *"><Input placeholder="e.g. Goa, Paris" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Country"><Input placeholder="e.g. India" value={form.country || ''} onChange={e => set('country', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
          <Field label="Description" className="md:col-span-2"><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background text-sm resize-none" placeholder="Brief description..." value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
        </>)}

        {category.id === 'hotels' && (<>
          <Field label="Hotel Name *"><Input placeholder="e.g. Taj Mahal Palace" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Destination"><DestinationSelect destinations={destinations} value={form.destinationId || ''} onChange={v => set('destinationId', v)} /></Field>
          <Field label="Category"><Input placeholder="e.g. 5 Star, Budget" value={form.category || ''} onChange={e => set('category', e.target.value)} /></Field>
          <Field label="Base Price (₹)"><Input type="number" placeholder="0" value={form.basePrice || ''} onChange={e => set('basePrice', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {category.id === 'drivers' && (<>
          <Field label="Driver Name *"><Input placeholder="e.g. Samar A." value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Phone *"><Input placeholder="e.g. 9876543210" value={form.phone || ''} onChange={e => set('phone', e.target.value)} required /></Field>
          <Field label="Vehicle Name *"><Input placeholder="e.g. Innova Crysta" value={form.vehicleName || ''} onChange={e => set('vehicleName', e.target.value)} required /></Field>
          <Field label="Vehicle Number *"><Input placeholder="e.g. SK-01-D-1234" value={form.vehicleNo || ''} onChange={e => set('vehicleNo', e.target.value)} required /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {category.id === 'suppliers' && (<>
          <Field label="Company Name *"><Input placeholder="e.g. Raj Travels Pvt Ltd" value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} required /></Field>
          <Field label="Category / Provider Type"><Input placeholder="e.g. Bolero, Cab, DMC, Budget" value={form.category || ''} onChange={e => set('category', e.target.value)} /></Field>
          <Field label="Mobile"><Input placeholder="+91 98765 43210" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Email"><Input type="email" placeholder="supplier@email.com" value={form.email || ''} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="City"><Input placeholder="e.g. Gangtok, Darjeeling" value={form.city || ''} onChange={e => set('city', e.target.value)} /></Field>
          <Field label="Address"><Input placeholder="Full address" value={form.address || ''} onChange={e => set('address', e.target.value)} /></Field>
          <Field label="Contact Person"><Input placeholder="Manager / Owner name" value={form.contactPerson || ''} onChange={e => set('contactPerson', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {category.id === 'activities' && (<>
          <Field label="Activity Name *"><Input placeholder="e.g. Tsomgo Lake Visit" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Destination"><DestinationSelect destinations={destinations} value={form.destinationId || ''} onChange={v => set('destinationId', v)} /></Field>
          <Field label="Price Per Person (₹)"><Input type="number" placeholder="0" value={form.pricePerPerson || ''} onChange={e => set('pricePerPerson', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
          <Field label="Description" className="md:col-span-2"><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background text-sm resize-none" placeholder="Brief description..." value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
        </>)}

        {category.id === 'transfers' && (<>
          <Field label="Transfer Name *"><Input placeholder="e.g. Bolero, Tempo Traveller 9-seater" value={form.name || form.vehicleType || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Destination"><DestinationSelect destinations={destinations} value={form.destinationId || ''} onChange={v => set('destinationId', v)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
          <Field label="Description" className="md:col-span-2"><textarea className="w-full min-h-[70px] px-3 py-2 border rounded-md bg-background text-sm resize-none" placeholder="Capacity, features..." value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
        </>)}

        {category.id === 'room-types' && (<>
          <Field label="Room Type Name *"><Input placeholder="e.g. Single, Double, Triple, Deluxe Suite" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {category.id === 'meal-plans' && (<>
          <Field label="Meal Plan Code *"><Input placeholder="e.g. BB, HB, FB, AI, EP, MAP" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <Field label="Price (₹)"><Input type="number" placeholder="0" value={form.price || ''} onChange={e => set('price', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {category.id === 'package-themes' && (<>
          <Field label="Theme Name *"><Input placeholder="e.g. Honeymoon, Adventure, Family, Pilgrimage" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {category.id === 'day-itinerary-templates' && (<>
          <Field label="Day Title *"><Input placeholder="e.g. Day 1 — Gangtok Arrival & Sightseeing" value={form.title || ''} onChange={e => set('title', e.target.value)} required /></Field>
          <Field label="Destination"><DestinationSelect destinations={destinations} value={form.destinationId || ''} onChange={v => set('destinationId', v)} /></Field>
          <Field label="Details / Plan" className="md:col-span-2"><textarea className="w-full min-h-[90px] px-3 py-2 border rounded-md bg-background text-sm resize-none" placeholder="Day plan, places, timings..." value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}
        
        {category.id === 'gallery-images' && (<>
          <Field label="Caption / Name *"><Input placeholder="e.g. Tiger Hills at Sunrise" value={form.caption || ''} onChange={e => set('caption', e.target.value)} required /></Field>
          <Field label="Category / Folder"><Input placeholder="e.g. Darjeeling, Sikkim" value={form.category || ''} onChange={e => set('category', e.target.value)} /></Field>
          <Field label="Sequence"><Input type="number" value={form.sequence || '0'} onChange={e => set('sequence', e.target.value)} /></Field>
          <StatusField value={form.isActive} onChange={v => set('isActive', v)} />
        </>)}

        {(hasPhoto || category.id === 'gallery-images') && (
          <Field label={category.id === 'package-themes' ? 'Theme Icon' : 'Photo'} className="md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-32 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 shrink-0 overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => photoRef.current?.click()}>
                {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />}
              </div>
              <div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                <Button type="button" variant="outline" size="sm" onClick={() => photoRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />{photoPreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG up to 5MB · Uploaded to Cloudinary</p>
                {photoPreview && <button type="button" className="text-xs text-red-500 mt-1 hover:underline" onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}>Remove photo</button>}
              </div>
            </div>
          </Field>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
          {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function MasterTable({ 
  category, 
  items, 
  onView, 
  onEdit, 
  onDelete, 
  canManage, 
  onGenerateCredentials, 
  generatingId,
  onShareCredentials
}: { 
  category: typeof CATEGORIES[0]; 
  items: any[]; 
  onView: (item: any) => void; 
  onEdit: (item: any) => void; 
  onDelete: (id: string) => void; 
  canManage: boolean; 
  onGenerateCredentials: (id: string) => void; 
  generatingId?: string;
  onShareCredentials: (item: any, type: 'whatsapp' | 'email') => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
            <th className="text-left py-3 px-3 font-medium">{category.id === 'day-itinerary-templates' ? 'Title' : (category.id === 'suppliers' ? 'Company Name' : (category.id === 'transfers' ? 'Vehicle Type' : (category.id === 'gallery-images' ? 'Caption' : 'Name')))}</th>
            {category.id === 'destinations' && <th className="text-left py-3 px-3 font-medium">Country</th>}
            {category.id === 'hotels' && <><th className="text-left py-3 px-3 font-medium">Destination</th><th className="text-left py-3 px-3 font-medium">Category</th><th className="text-left py-3 px-3 font-medium">Base Price</th></>}
            {category.id === 'drivers' && <><th className="text-left py-3 px-3 font-medium">Phone</th><th className="text-left py-3 px-3 font-medium">Vehicle Name</th><th className="text-left py-3 px-3 font-medium">Vehicle No</th></>}
            {category.id === 'suppliers' && <><th className="text-left py-3 px-3 font-medium">Category</th><th className="text-left py-3 px-3 font-medium">City</th><th className="text-left py-3 px-3 font-medium">Phone</th></>}
            {category.id === 'activities' && <><th className="text-left py-3 px-3 font-medium">Destination</th><th className="text-left py-3 px-3 font-medium">Price/Person</th></>}
            {category.id === 'transfers' && <><th className="text-left py-3 px-3 font-medium">Destination</th><th className="text-left py-3 px-3 font-medium">Price</th><th className="text-left py-3 px-3 font-medium">Photo</th></>}
            {category.id === 'meal-plans' && <th className="text-left py-3 px-3 font-medium">Price (₹)</th>}
            {category.id === 'package-themes' && <th className="text-left py-3 px-3 font-medium">Icon</th>}
            {(category.id === 'day-itinerary-templates' || category.id === 'gallery-images') && <><th className="text-left py-3 px-3 font-medium">{category.id === 'gallery-images' ? 'Category' : 'Destination'}</th><th className="text-left py-3 px-3 font-medium">{category.id === 'gallery-images' ? 'Preview' : 'Description'}</th></>}
            {['hotels', 'drivers'].includes(category.id) && <th className="text-left py-3 px-3 font-medium">Portal Login</th>}
            <th className="text-left py-3 px-3 font-medium">Status</th>
            <th className="text-right py-3 px-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
              <td className="py-3 px-3 font-medium">
                {String(item.title || item.companyName || item.vehicleType || item.name || item.caption || '')}
                {item.companyName && category.id !== 'suppliers' && <span className="text-xs text-muted-foreground block">{String(item.companyName)}</span>}
                {item.category && category.id !== 'suppliers' && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">{String(item.category)}</span>}
              </td>
              {category.id === 'destinations' && <td className="py-3 px-3 text-muted-foreground text-xs">{String(item.country || '—')}</td>}
              {category.id === 'hotels' && (<><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.destination?.name || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.category || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs font-medium">₹{Number(item.basePrice || 0).toLocaleString('en-IN')}</td></>)}
              {category.id === 'drivers' && (<><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.phone || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.vehicleName || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.vehicleNo || '—')}</td></>)}
              {category.id === 'suppliers' && (<><td className="py-3 px-3 text-muted-foreground capitalize text-xs">{String(item.category || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.city || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.phone || '—')}</td></>)}
              {category.id === 'activities' && (<><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.destination?.name || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs font-medium">₹{Number(item.pricePerPerson || 0).toLocaleString('en-IN')}</td></>)}
              {category.id === 'transfers' && (<><td className="py-3 px-3 text-muted-foreground text-xs">{String(item.destination?.name || '—')}</td><td className="py-3 px-3 text-muted-foreground text-xs font-medium">₹{Number(item.price || 0).toLocaleString('en-IN')}</td><td className="py-3 px-3">{item.photoUrl ? <img src={item.photoUrl} alt={String(item.name || '')} className="w-14 h-9 object-cover rounded" /> : <span className="text-muted-foreground text-xs">—</span>}</td></>)}
              {category.id === 'meal-plans' && <td className="py-3 px-3 text-muted-foreground text-xs font-medium">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>}
              {category.id === 'package-themes' && <td className="py-3 px-3">{item.iconUrl ? <img src={item.iconUrl} alt={String(item.name || '')} className="w-9 h-9 object-cover rounded-lg" /> : <span className="text-muted-foreground text-xs">—</span>}</td>}
              {(category.id === 'day-itinerary-templates' || category.id === 'gallery-images') && (
                <>
                  <td className="py-3 px-3 text-muted-foreground text-xs">{String(item.destination?.name || item.category || '—')}</td>
                  <td className="py-3 px-3 text-muted-foreground text-xs">
                    {category.id === 'gallery-images' ? (
                      item.imageUrl ? <img src={item.imageUrl} alt={item.caption} className="w-16 h-10 object-cover rounded shadow-sm border h-8" /> : '—'
                    ) : (
                      String(item.description || '—').length > 50 ? String(item.description).slice(0, 50) + '...' : String(item.description || '—')
                    )}
                  </td>
                </>
              )}
              {['hotels', 'drivers'].includes(category.id) && (
                <td className="py-3 px-3">
                  {item.loginId ? (
                    <div className="text-xs">
                      <p className="font-bold text-gray-900 font-mono">ID: {item.loginId}</p>
                      <p className="text-muted-foreground mt-0.5 font-mono">PIN: {item.loginPassword || '—'}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        {canManage && (
                          <button 
                            onClick={() => onGenerateCredentials(item.id)} 
                            disabled={generatingId === item.id}
                            title="Reset Credentials"
                            className="text-amber-600 hover:text-amber-700 hover:underline font-semibold flex items-center gap-0.5 text-[9px] cursor-pointer"
                          >
                            <RefreshCw className={cn("w-2 h-2", generatingId === item.id && "animate-spin")} /> Reset PIN
                          </button>
                        )}
                        <button 
                          onClick={() => onShareCredentials(item, 'whatsapp')}
                          title="Share via WhatsApp"
                          className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold flex items-center gap-0.5 text-[9px] cursor-pointer"
                        >
                          <MessageSquare className="w-2 h-2" /> WA
                        </button>
                        <button 
                          onClick={() => onShareCredentials(item, 'email')}
                          title="Share via Email"
                          className="text-blue-600 hover:text-blue-700 hover:underline font-semibold flex items-center gap-0.5 text-[9px] cursor-pointer"
                        >
                          <Mail className="w-2 h-2" /> Email
                        </button>
                      </div>
                    </div>
                  ) : (
                    canManage && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onGenerateCredentials(item.id)}
                        disabled={generatingId === item.id}
                        className="h-7 text-[10px] px-2 font-semibold border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center gap-1 cursor-pointer"
                      >
                        {generatingId === item.id ? <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> : <KeyRound className="w-3 h-3 text-amber-600" />} Setup Login
                      </Button>
                    )
                  )}
                </td>
              )}
              <td className="py-3 px-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-3 text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item)}><Eye className="w-3.5 h-3.5 text-blue-500" /></Button>
                  {canManage && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Edit2 className="w-3.5 h-3.5 text-primary" /></Button>}
                  {canManage && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(item.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string; }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function StatusField({ value, onChange }: { value: any; onChange: (v: boolean) => void; }) {
  return (
    <Field label="Status">
      <select className="w-full h-10 px-3 border rounded-md bg-background text-sm" value={value === false ? 'false' : 'true'} onChange={e => onChange(e.target.value === 'true')}>
        <option value="true">Active</option><option value="false">Inactive</option>
      </select>
    </Field>
  );
}

function DestinationSelect({ destinations, value, onChange }: { destinations: { id: string; name: string }[]; value: string; onChange: (v: string) => void; }) {
  return (
    <select className="w-full h-10 px-3 border rounded-md bg-background text-sm" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">— Select Destination —</option>
      {destinations.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
  );
}
