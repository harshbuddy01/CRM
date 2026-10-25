'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  User, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  ChevronDown, 
  Flame, 
  CheckSquare, 
  Square, 
  Filter,
  ArrowRight,
  Check,
  Briefcase
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Conversation {
  phone: string;
  clientName: string | null;
  lastMessage: string;
  lastMessageAt: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  unreadCount: number;
  lastInboundAt?: string | null;
  isWindowOpen?: boolean;
  windowExpiresAt?: string | null;
  remainingMinutes?: number;
  queryCode?: string | null;
  destination?: string | null;
  queryStatus?: string | null;
  queryId?: string | null;
}

interface LeadItem {
  id: string;
  queryCode: string;
  name: string;
  phone: string;
  rawPhone: string;
  email?: string | null;
  destination?: string | null;
  status: string;
  budget?: any;
  createdAt: string;
  hasReplied?: boolean;
  lastReply?: string | null;
  lastReplyAt?: string | null;
  isWindowOpen?: boolean;
  remainingMinutes?: number;
}

interface ChatMessage {
  id: string;
  phone: string;
  direction: 'INBOUND' | 'OUTBOUND';
  message: string;
  status: string;
  createdAt: string;
}

const APPROVED_TEMPLATES = [
  {
    id: 'diwali_festive_poster',
    name: 'Diwali Festive Poster (Flyer + Offer)',
    category: 'MARKETING',
    description: 'Bespoke flyer with Flat ₹3,000 festive coupon',
  },
  {
    id: 'festive_exclusive_offer',
    name: 'Festive Exclusive Offer (Text)',
    category: 'MARKETING',
    description: 'Quick festive seasonal greeting & vacation discount',
  },
  {
    id: 'proposal_ready',
    name: 'Itinerary Proposal Ready (PDF)',
    category: 'MARKETING',
    description: 'Curated bespoke itinerary presentation',
  },
  {
    id: 'client_invoice_ready',
    name: 'Client Invoice Ready (Utility)',
    category: 'UTILITY',
    description: 'Guaranteed 100% immediate delivery invoice notice',
  },
];

export default function WhatsAppChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const selectedPhoneRef = useRef<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Smart Scroll Ref: Only scroll on user send or conversation change
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);

  // Sidebar Tabs & Filters
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'leads'>('chats');
  const [filterMode, setFilterMode] = useState<'all' | 'replied' | 'awaiting'>('all');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Bulk Selection Mode for Leads
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [showBulkTemplateMenu, setShowBulkTemplateMenu] = useState(false);

  // Template Picker Dropdown state in Chat Window
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    selectedPhoneRef.current = selectedPhone;
  }, [selectedPhone]);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior,
      });
      isScrolledUpRef.current = false;
    }
  };

  // Detect user scroll inside chat container to prevent annoying jump-down bug
  const handleChatScroll = () => {
    if (chatScrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isScrolledUpRef.current = distanceFromBottom > 120;
    }
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/whatsapp-chat/conversations');
      if (res.data?.success) {
        const list: Conversation[] = res.data.conversations || [];
        setConversations(list);
        if (!selectedPhoneRef.current && list.length > 0 && sidebarTab === 'chats') {
          const first = list[0];
          selectedPhoneRef.current = first.phone;
          setSelectedPhone(first.phone);
          setActiveConversation(first);
          fetchChatHistory(first.phone, true);
        } else if (selectedPhoneRef.current) {
          const current = list.find(c => c.phone === selectedPhoneRef.current);
          if (current) {
            setActiveConversation(prev => ({
              ...current,
              queryCode: prev?.queryCode || current.queryCode,
              destination: prev?.destination || current.destination,
              queryStatus: prev?.queryStatus || current.queryStatus,
              queryId: prev?.queryId || current.queryId,
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp conversations', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch CRM Leads for the Leads Tab
  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await api.get(`/whatsapp-chat/leads${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
      if (res.data?.success) {
        setLeads(res.data.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch CRM leads for WhatsApp', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Fetch chat history for selected phone number
  const fetchChatHistory = async (phone: string, forceScroll = false) => {
    try {
      const res = await api.get(`/whatsapp-chat/conversations/${phone}`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        if (forceScroll || !isScrolledUpRef.current) {
          setTimeout(() => scrollToBottom('auto'), 50);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    selectedPhoneRef.current = conv.phone;
    setSelectedPhone(conv.phone);
    setActiveConversation(conv);
    fetchChatHistory(conv.phone, true);
  };

  const handleSelectLead = (lead: LeadItem) => {
    selectedPhoneRef.current = lead.phone;
    setSelectedPhone(lead.phone);
    
    const existing = conversations.find(c => c.phone.slice(-10) === lead.phone.slice(-10));
    if (existing) {
      setActiveConversation({
        ...existing,
        queryCode: lead.queryCode,
        destination: lead.destination,
        queryStatus: lead.status,
        queryId: lead.id,
        clientName: lead.name || existing.clientName,
      });
      fetchChatHistory(existing.phone, true);
    } else {
      const tempConv: Conversation = {
        phone: lead.phone,
        clientName: lead.name,
        lastMessage: lead.hasReplied ? `Customer: ${lead.lastReply}` : 'Ready to start conversation',
        lastMessageAt: lead.lastReplyAt || lead.createdAt,
        direction: lead.hasReplied ? 'INBOUND' : 'OUTBOUND',
        status: 'READY',
        unreadCount: 0,
        isWindowOpen: lead.isWindowOpen || false,
        remainingMinutes: lead.remainingMinutes || 0,
        queryCode: lead.queryCode,
        destination: lead.destination,
        queryStatus: lead.status,
        queryId: lead.id,
      };
      setActiveConversation(tempConv);
      fetchChatHistory(lead.phone, true);
    }
  };

  // Polling setup
  useEffect(() => {
    fetchConversations();
    fetchLeads();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchConversations();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sidebarTab === 'leads') {
      fetchLeads();
    }
  }, [sidebarTab, searchQuery]);

  useEffect(() => {
    if (selectedPhone) {
      fetchChatHistory(selectedPhone, false);
      const interval = setInterval(() => {
        if (!document.hidden && selectedPhoneRef.current) {
          fetchChatHistory(selectedPhoneRef.current, false);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedPhone]);

  // Handle single message send
  const handleSend = async () => {
    if (!selectedPhone || !replyText.trim() || sending) return;

    setSending(true);
    const textToSend = replyText;
    setReplyText('');

    try {
      const res = await api.post(`/whatsapp-chat/conversations/${selectedPhone}/send`, {
        message: textToSend
      });

      if (res.data?.success) {
        await fetchChatHistory(selectedPhone, true);
        fetchConversations();
      }
    } catch (err: any) {
      console.error('Failed to send message', err);
      const msg = err.response?.data?.error || err.message || '';
      if (msg.includes('131047') || msg.toLowerCase().includes('24 hours') || msg.toLowerCase().includes('re-engagement')) {
        toast.warning(
          '24-Hour Window Closed: Meta requires an approved template or WhatsApp Web message outside the 24-hour window.',
          { duration: 6000 }
        );
      } else {
        toast.error('Failed to send WhatsApp message: ' + msg);
      }
    } finally {
      setSending(false);
    }
  };

  // Handle template dispatch from Chat Window
  const handleSendTemplate = async (templateId: string) => {
    if (!selectedPhone || sendingTemplate) return;
    setSendingTemplate(templateId);
    setShowTemplatePicker(false);

    try {
      const recipientName = activeConversation?.clientName || 'Valued Traveler';
      const queryCode = activeConversation?.queryCode || 'QRY-2026';

      let components: any[] = [];

      if (templateId === 'diwali_festive_poster') {
        components = [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: { link: 'https://media.imagicaholidays.com/campaigns/diwali-festive-poster-2026.jpg' },
              },
            ],
          },
          {
            type: 'body',
            parameters: [{ type: 'text', text: recipientName }],
          },
        ];
      } else if (templateId === 'festive_exclusive_offer') {
        components = [
          {
            type: 'body',
            parameters: [{ type: 'text', text: recipientName }],
          },
        ];
      } else if (templateId === 'proposal_ready') {
        components = [
          {
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: {
                  link: 'https://media.imagicaholidays.com/campaigns/Imagica_Holidays_Luxury_Brochure.pdf',
                  filename: `${queryCode}-Itinerary-Proposal.pdf`,
                },
              },
            ],
          },
          {
            type: 'body',
            parameters: [{ type: 'text', text: recipientName }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: 'destinations' }],
          },
        ];
      } else if (templateId === 'client_invoice_ready') {
        components = [
          {
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: {
                  link: 'https://media.imagicaholidays.com/campaigns/Imagica_Holidays_Luxury_Brochure.pdf',
                  filename: `${queryCode}-Invoice.pdf`,
                },
              },
            ],
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: recipientName },
              { type: 'text', text: queryCode },
              { type: 'text', text: '₹45,000' },
            ],
          },
        ];
      }

      const res = await api.post(`/whatsapp-chat/conversations/${selectedPhone}/send`, {
        templateName: templateId,
        components,
      });

      if (res.data?.success) {
        toast.success(`Template "${templateId}" sent successfully!`);
        await fetchChatHistory(selectedPhone, true);
        fetchConversations();
      }
    } catch (err: any) {
      console.error('Failed to dispatch template', err);
      toast.error('Failed to dispatch template: ' + (err.response?.data?.error || err.message));
    } finally {
      setSendingTemplate(null);
    }
  };

  // Handle Bulk Template Send to selected leads
  const handleBulkSendTemplate = async (templateId: string) => {
    if (selectedLeadIds.size === 0 || bulkSending) return;
    setBulkSending(true);
    setShowBulkTemplateMenu(false);

    const targetLeads = leads
      .filter(l => selectedLeadIds.has(l.id))
      .map(l => ({
        queryId: l.id,
        queryCode: l.queryCode,
        name: l.name,
        phone: l.phone,
        destination: l.destination,
      }));

    try {
      const res = await api.post('/whatsapp-chat/bulk-send-template', {
        recipients: targetLeads,
        templateName: templateId,
      });

      if (res.data?.success) {
        const { successCount, failCount } = res.data.data;
        toast.success(`Template broadcast complete! Sent: ${successCount}, Failed: ${failCount}`);
        setSelectedLeadIds(new Set());
        setIsBulkMode(false);
        fetchConversations();
        fetchLeads();
      }
    } catch (err: any) {
      console.error('Bulk template send failed', err);
      toast.error('Bulk template send failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBulkSending(false);
    }
  };

  // Toggle selection for a single lead in bulk mode
  const toggleSelectLead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered lists with "Replied" intelligence
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchSearch = 
        c.phone.includes(searchQuery) || 
        (c.clientName && c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.queryCode && c.queryCode.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchSearch) return false;

      const hasReplied = !!c.lastInboundAt;
      if (filterMode === 'replied') return hasReplied;
      if (filterMode === 'awaiting') return !hasReplied;
      return true;
    });
  }, [conversations, searchQuery, filterMode]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.queryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.destination && l.destination.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchSearch) return false;

      if (filterMode === 'replied') return !!l.hasReplied;
      if (filterMode === 'awaiting') return !l.hasReplied;
      return true;
    });
  }, [leads, searchQuery, filterMode]);

  const repliedConversationsCount = useMemo(() => {
    return conversations.filter(c => !!c.lastInboundAt).length;
  }, [conversations]);

  const repliedLeadsCount = useMemo(() => {
    return leads.filter(l => !!l.hasReplied).length;
  }, [leads]);

  // WhatsApp Web direct URL fallback
  const getWhatsAppWebUrl = () => {
    if (!selectedPhone) return '#';
    const clean = selectedPhone.replace(/\D/g, '');
    const full = clean.length === 10 ? `91${clean}` : clean;
    const greeting = replyText.trim() || `Hi ${activeConversation?.clientName || 'there'}, greetings from Imagica Holidays! We are ready with your travel details.`;
    return `https://api.whatsapp.com/send/?phone=${full}&text=${encodeURIComponent(greeting)}&type=phone_number&app_absent=0`;
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-sm font-sans">
      
      {/* MINIMALIST LUXURY HEADER BAR */}
      <div className="px-5 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">WhatsApp Live Hub</h1>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Meta Cloud API
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">Official Concierge & Direct Travel Desk (+91 62914 26647)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              fetchConversations();
              fetchLeads();
              if (selectedPhone) fetchChatHistory(selectedPhone, false);
              toast.success('Chats & leads refreshed');
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
            title="Refresh Chats & Leads"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline font-medium text-[11px]">Refresh</span>
          </button>
        </div>
      </div>

      {/* MAIN 2-COLUMN DESK */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: CONVERSATIONS & LEADS */}
        <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          
          {/* Top Switcher Tabs */}
          <div className="p-2.5 bg-slate-50/70 border-b border-slate-200/70 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSidebarTab('chats');
                setIsBulkMode(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'chats'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-700" />
              <span>Active Chats</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded-full">
                {conversations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab('leads')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'leads'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pipeline Leads</span>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/60 font-bold px-1.5 py-0.2 rounded-full">
                {leads.length}
              </span>
            </button>
          </div>

          {/* Search Bar & Multi-Select Action */}
          <div className="p-2.5 bg-white border-b border-slate-200/70 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder={sidebarTab === 'chats' ? "Search chats or query code..." : "Search leads by name, phone..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            {/* In Leads Tab: Multi-Select Toggle Button */}
            {sidebarTab === 'leads' && (
              <button
                type="button"
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  if (isBulkMode) setSelectedLeadIds(new Set());
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all cursor-pointer shadow-2xs ${
                  isBulkMode 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Select multiple leads to send broadcast template"
              >
                {isBulkMode ? <CheckSquare className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3 text-slate-400" />}
                <span>Select</span>
              </button>
            )}
          </div>

          {/* FILTER PILLS: ALL vs REPLIED vs AWAITING */}
          <div className="px-3 py-1.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 text-[10px] font-medium mr-1 uppercase tracking-wider">Filter:</span>
            
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterMode === 'all' 
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('replied')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                filterMode === 'replied' 
                  ? 'bg-emerald-700 text-white font-semibold shadow-2xs' 
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/50'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Replied ({sidebarTab === 'chats' ? repliedConversationsCount : repliedLeadsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('awaiting')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterMode === 'awaiting' 
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs' 
                  : 'text-slate-500 hover:bg-slate-200/60'
              }`}
            >
              Awaiting
            </button>

            {/* Quick Select All in Bulk Mode */}
            {sidebarTab === 'leads' && isBulkMode && (
              <button
                type="button"
                onClick={() => {
                  if (selectedLeadIds.size === filteredLeads.length) {
                    setSelectedLeadIds(new Set());
                  } else {
                    setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
                  }
                }}
                className="ml-auto text-[10px] font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer"
              >
                {selectedLeadIds.size === filteredLeads.length ? 'Deselect All' : `Select All (${filteredLeads.length})`}
              </button>
            )}
          </div>

          {/* LIST ITEMS */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {sidebarTab === 'chats' ? (
              // TAB 1: ACTIVE CONVERSATIONS
              loading ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {filterMode === 'replied' ? 'No customers have replied yet.' : 'No active chats found.'}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedPhone === conv.phone;
                  const hasReplied = !!conv.lastInboundAt;
                  return (
                    <button
                      key={conv.phone}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-3 text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-100/90 border-l-3 border-slate-900' 
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                        {conv.clientName ? conv.clientName[0].toUpperCase() : <User className="w-3.5 h-3.5 text-slate-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {conv.clientName || `+${conv.phone}`}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Query Code Pill & Replied Indicator */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {conv.queryCode && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                              {conv.queryCode}
                            </span>
                          )}
                          
                          {/* "Customer Replied" Luxury Banner Pill */}
                          {hasReplied && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Replied
                            </span>
                          )}

                          {conv.destination && (
                            <span className="text-[9px] text-slate-500 truncate max-w-[120px]">
                              {conv.destination}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate font-normal">
                          {conv.direction === 'OUTBOUND' && <span className="text-slate-700 font-medium">You: </span>}
                          {conv.lastMessage}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="bg-emerald-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-2xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )
            ) : (
              // TAB 2: PIPELINE LEADS (Yatendra Singh, etc.)
              loadingLeads ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  Loading pipeline leads...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {filterMode === 'replied' ? 'No leads have replied to marketing yet.' : 'No pipeline leads found.'}
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedPhone?.slice(-10) === lead.phone.slice(-10);
                  const isChecked = selectedLeadIds.has(lead.id);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => {
                        if (isBulkMode) toggleSelectLead(lead.id);
                        else handleSelectLead(lead);
                      }}
                      className={`w-full p-3 text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected && !isBulkMode
                          ? 'bg-slate-100/90 border-l-3 border-slate-900'
                          : isChecked
                          ? 'bg-amber-50/70 border-l-3 border-amber-500'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox in Bulk Mode */}
                      {isBulkMode ? (
                        <div 
                          className="pt-1 shrink-0" 
                          onClick={(e) => toggleSelectLead(lead.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                          {lead.name ? lead.name[0].toUpperCase() : <Sparkles className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {lead.name}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                            lead.status === 'new' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : lead.status === 'quoted' 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {lead.status}
                          </span>
                        </div>

                        {/* Customer Replied Banner Pill */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[9px] text-slate-500 font-mono">
                            {lead.queryCode}
                          </span>

                          {lead.hasReplied ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Replied: &ldquo;{lead.lastReply?.slice(0, 22)}...&rdquo;
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-medium">
                              +{lead.phone}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 truncate font-normal">
                          {lead.destination || 'General Inquiry'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>

          {/* FLOATING ACTION BAR IN BULK MODE */}
          {isBulkMode && selectedLeadIds.size > 0 && (
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between gap-2 shadow-lg border-t border-slate-800">
              <span className="text-xs font-semibold">
                {selectedLeadIds.size} Selected
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBulkTemplateMenu(!showBulkTemplateMenu)}
                  disabled={bulkSending}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{bulkSending ? 'Broadcasting...' : 'Send Meta Template'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Bulk Template Menu Popup */}
                {showBulkTemplateMenu && (
                  <div className="absolute bottom-full mb-2 right-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900">
                    <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Pick Broadcast Template</span>
                      <span className="text-[10px] text-slate-500">{selectedLeadIds.size} Leads</span>
                    </div>
                    <div className="p-1 space-y-1">
                      {APPROVED_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleBulkSendTemplate(tpl.id)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <div className="font-bold text-slate-900 text-xs">{tpl.name}</div>
                          <p className="text-[10px] text-slate-500 truncate">{tpl.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT DESK */}
        {selectedPhone ? (
          <div className="flex-1 flex flex-col bg-slate-50/50">
            
            {/* Minimalist Chat Header */}
            <div className="px-5 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {activeConversation?.clientName ? activeConversation.clientName[0].toUpperCase() : <Phone className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xs text-slate-900">
                      {activeConversation?.clientName || `Customer (+${selectedPhone})`}
                    </h2>
                    {activeConversation?.queryCode && (
                      <a
                        href={`/queries/${activeConversation.queryId || ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors"
                        title="Open Query in New Tab"
                      >
                        {activeConversation.queryCode}
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>+{selectedPhone}</span>
                    {activeConversation?.destination && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[220px] text-slate-600 font-medium">{activeConversation.destination}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 24-Hour Session Status Pill & WhatsApp Web Link */}
              <div className="flex items-center gap-2">
                {activeConversation?.isWindowOpen ? (
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.8 rounded-full font-semibold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    24h Free Chat Active ({Math.floor((activeConversation.remainingMinutes || 0) / 60)}h {(activeConversation.remainingMinutes || 0) % 60}m)
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.8 rounded-full font-medium flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3 h-3 text-amber-600" />
                    24h Window Closed
                  </span>
                )}

                <a
                  href={getWhatsAppWebUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  title="Direct WhatsApp Web Chat (100% bypass)"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  WA Web
                </a>
              </div>
            </div>

            {/* Chat Messages Canvas (Off-White, Luxury Cards) */}
            <div 
              ref={chatScrollContainerRef}
              onScroll={handleChatScroll}
              className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#fbfbfa]"
            >
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-12 text-xs bg-white rounded-xl p-8 border border-slate-200/80 max-w-md mx-auto shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2 font-bold border border-slate-200">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1">New Outreach to {activeConversation?.clientName || 'Customer'}</p>
                  <p className="text-slate-500 text-[11px] mb-4">
                    Send an approved Meta flyer or proposal template to open the conversation directly on their WhatsApp.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowTemplatePicker(true)}
                      className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                      Pick Approved Template
                    </button>
                    <a
                      href={getWhatsAppWebUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Open in WhatsApp Web
                    </a>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  const text = msg.message || '';
                  
                  const hasDoc = text.includes('📄') || text.toLowerCase().includes('.pdf');
                  const lines = text.split('\n');
                  const docLine = lines.find(l => l.includes('📄') || l.toLowerCase().endsWith('.pdf'));
                  const linkLine = lines.find(l => l.startsWith('🔗') || l.startsWith('http'));
                  const cleanLink = linkLine ? linkLine.replace('🔗', '').trim() : '';

                  const bodyLines = lines.filter(l => l !== docLine && l !== linkLine && !l.startsWith('🔘'));

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-xl text-xs leading-relaxed shadow-2xs overflow-hidden ${
                          isOutbound
                            ? 'bg-white text-slate-900 border border-slate-200 rounded-tr-none'
                            : 'bg-white text-slate-900 border-l-3 border-l-emerald-600 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {/* Minimalist Document Attachment Card */}
                        {hasDoc && docLine && (
                          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 font-bold text-[9px]">
                              <FileText className="w-4 h-4 mb-0.5 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate">
                                {docLine.replace('📄', '').trim() || 'Itinerary-Proposal.pdf'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">Bespoke Travel Document • PDF</p>
                            </div>
                          </div>
                        )}

                        {/* Message Text */}
                        <div className="px-3.5 py-2.5">
                          <p className="whitespace-pre-wrap font-normal text-slate-800 text-[13px] leading-relaxed">
                            {bodyLines.join('\n').trim()}
                          </p>

                          {/* Link Button */}
                          {cleanLink && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <a
                                href={cleanLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-200 shadow-2xs transition-all text-xs"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                View Details & Itinerary
                              </a>
                            </div>
                          )}

                          {/* Timestamp & Read Status */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOutbound && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* SEAMLESS LUXURY COMPOSER AREA */}
            <div className="p-3 bg-white border-t border-slate-200">
              
              {/* Sleek Action Bar for Templates & Web Fallback */}
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  {activeConversation?.isWindowOpen ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Direct 2-way chat active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <Clock className="w-3 h-3" />
                      Window closed: Send template or use WhatsApp Web
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{sendingTemplate ? 'Sending...' : 'Send Template'}</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                    </button>

                    {/* Template Picker Popup */}
                    {showTemplatePicker && (
                      <div className="absolute bottom-full mb-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900">
                        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">Approved Meta Templates</span>
                          <span className="text-[10px] text-slate-500">Delivers Outside 24h</span>
                        </div>
                        <div className="p-1 space-y-1 max-h-60 overflow-y-auto">
                          {APPROVED_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleSendTemplate(tpl.id)}
                              disabled={!!sendingTemplate}
                              className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold text-slate-900">{tpl.name}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  tpl.category === 'UTILITY' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {tpl.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{tpl.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <a
                    href={getWhatsAppWebUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    WA Web
                  </a>
                </div>
              </div>

              {/* Minimal Text Input */}
              <div className="flex items-center gap-2">
                <textarea
                  rows={1}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message or pick an approved template above..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white resize-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="w-8 h-8 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Send Message"
                >
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 bg-slate-50/40">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 border border-slate-200 shadow-2xs">
              <MessageSquare className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">WhatsApp Live Desk</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Select an active conversation on the left, or browse the <strong>Pipeline Leads</strong> tab to outreach to customers with approved flyers.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
