'use client';

import { useState, useEffect, useRef } from 'react';
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
  Zap,
  ShieldCheck,
  ExternalLink,
  Briefcase,
  AlertCircle,
  ChevronDown,
  Check
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
  createdAt: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sidebar Tab: Active Chats vs CRM Leads & Pipeline
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'leads'>('chats');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Template Picker Dropdown state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    selectedPhoneRef.current = selectedPhone;
  }, [selectedPhone]);

  // Fetch all conversations without resetting current selection
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
          fetchChatHistory(first.phone);
        } else if (selectedPhoneRef.current) {
          // Keep active conversation metadata updated
          const current = list.find(c => c.phone === selectedPhoneRef.current);
          if (current) {
            setActiveConversation(prev => ({
              ...current,
              // preserve query info if available from lead
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
  const fetchChatHistory = async (phone: string) => {
    try {
      const res = await api.get(`/whatsapp-chat/conversations/${phone}`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    selectedPhoneRef.current = conv.phone;
    setSelectedPhone(conv.phone);
    setActiveConversation(conv);
    fetchChatHistory(conv.phone);
  };

  const handleSelectLead = (lead: LeadItem) => {
    selectedPhoneRef.current = lead.phone;
    setSelectedPhone(lead.phone);
    
    // Check if conversation already exists
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
      fetchChatHistory(existing.phone);
    } else {
      // Create temporary active conversation for this new lead
      const tempConv: Conversation = {
        phone: lead.phone,
        clientName: lead.name,
        lastMessage: 'Ready to start conversation',
        lastMessageAt: new Date().toISOString(),
        direction: 'OUTBOUND',
        status: 'READY',
        unreadCount: 0,
        isWindowOpen: false,
        remainingMinutes: 0,
        queryCode: lead.queryCode,
        destination: lead.destination,
        queryStatus: lead.status,
        queryId: lead.id,
      };
      setActiveConversation(tempConv);
      fetchChatHistory(lead.phone);
    }
  };

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
      fetchChatHistory(selectedPhone);
      const interval = setInterval(() => {
        if (!document.hidden && selectedPhoneRef.current) {
          fetchChatHistory(selectedPhoneRef.current);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        fetchChatHistory(selectedPhone);
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

  // Send an approved Meta template message
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
        fetchChatHistory(selectedPhone);
        fetchConversations();
      }
    } catch (err: any) {
      console.error('Failed to dispatch template', err);
      toast.error('Failed to dispatch template: ' + (err.response?.data?.error || err.message));
    } finally {
      setSendingTemplate(null);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.phone.includes(searchQuery) || 
    (c.clientName && c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.queryCode && c.queryCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery) ||
    l.queryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.destination && l.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Generate WhatsApp Web Direct Chat URL (bypasses Meta Cloud API completely)
  const getWhatsAppWebUrl = () => {
    if (!selectedPhone) return '#';
    const clean = selectedPhone.replace(/\D/g, '');
    const full = clean.length === 10 ? `91${clean}` : clean;
    const greeting = replyText.trim() || `Hi ${activeConversation?.clientName || 'there'}, greetings from Imagica Holidays! We are reviewing your travel inquiry.`;
    return `https://api.whatsapp.com/send/?phone=${full}&text=${encodeURIComponent(greeting)}&type=phone_number&app_absent=0`;
  };

  return (
    <div className="h-[calc(100vh-90px)] flex flex-col bg-[#f0f2f5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl font-sans">
      {/* Top Header Bar */}
      <div className="px-5 py-3 bg-[#00a884] text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              WhatsApp Live Inbox & Hub
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium flex items-center gap-1 border border-white/30">
                <ShieldCheck className="w-3 h-3" /> Meta Cloud API
              </span>
            </h1>
            <p className="text-[11px] text-emerald-100/90 font-medium">Realtime Customer Inquiries, Pipeline & Driver Messaging</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              fetchConversations();
              fetchLeads();
              if (selectedPhone) fetchChatHistory(selectedPhone);
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Refresh Chats & Leads"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversations & Leads Sidebar */}
        <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col">
          {/* Top Switcher Tabs: Active Chats vs CRM Leads */}
          <div className="p-2 bg-[#f0f2f5] border-b border-slate-200 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSidebarTab('chats')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'chats'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00a884]" />
              <span>Active Chats</span>
              {conversations.length > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
                  {conversations.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('leads')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'leads'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pipeline Leads</span>
              {leads.length > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                  {leads.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 bg-white border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={sidebarTab === 'chats' ? "Search chats or query code..." : "Search leads by name, phone, query..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f0f2f5] border border-transparent rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a884] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List Section: Either Active Chats or Pipeline Leads */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {sidebarTab === 'chats' ? (
              // TAB 1: ACTIVE CHATS
              loading ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00a884]" />
                  Loading chats...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active conversations found.
                  <div className="mt-2">
                    <button
                      onClick={() => setSidebarTab('leads')}
                      className="text-[#00a884] font-semibold hover:underline"
                    >
                      Browse Pipeline Leads &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedPhone === conv.phone;
                  return (
                    <button
                      key={conv.phone}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#f0f2f5] border-l-4 border-[#00a884]' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#00a884] font-bold border border-emerald-200 flex items-center justify-center shrink-0 text-sm">
                        {conv.clientName ? conv.clientName[0].toUpperCase() : <User className="w-4 h-4" />}
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
                        
                        {/* Query Code Pill if available */}
                        {conv.queryCode && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {conv.queryCode}
                            </span>
                            {conv.destination && (
                              <span className="text-[9px] text-slate-500 truncate max-w-[130px]">
                                {conv.destination}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs text-slate-500 truncate font-normal flex-1">
                            {conv.direction === 'OUTBOUND' && <span className="text-[#00a884] font-medium">You: </span>}
                            {conv.lastMessage}
                          </p>

                          {/* 24-Hour Window Dot Indicator */}
                          {conv.isWindowOpen ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="24h Free Chat Window Open" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="24h Window Closed" />
                          )}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#25d366] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0">
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
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  Loading CRM leads...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No pipeline leads found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedPhone?.slice(-10) === lead.phone.slice(-10);
                  return (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={`w-full p-3 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#f0f2f5] border-l-4 border-amber-500' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center justify-center shrink-0 text-xs">
                        {lead.name ? lead.name[0].toUpperCase() : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {lead.name}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            lead.status === 'new' 
                              ? 'bg-amber-100 text-amber-800' 
                              : lead.status === 'quoted' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mb-0.5">
                          {lead.queryCode} • +{lead.phone}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {lead.destination || 'General Inquiry'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Window */}
        {selectedPhone ? (
          <div className="flex-1 flex flex-col bg-[#efeae2]">
            {/* Active Chat Header */}
            <div className="px-5 py-2.5 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00a884] text-white font-bold flex items-center justify-center text-sm shadow-xs">
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
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-800 flex items-center gap-1 transition-colors"
                        title="Open Query Details"
                      >
                        {activeConversation.queryCode}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>+{selectedPhone}</span>
                    {activeConversation?.destination && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px] text-slate-600 font-medium">{activeConversation.destination}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 24-Hour Customer Care Window Badge */}
              <div className="flex items-center gap-2">
                {activeConversation?.isWindowOpen ? (
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    🟢 24h Free Chat Active ({Math.floor((activeConversation.remainingMinutes || 0) / 60)}h {(activeConversation.remainingMinutes || 0) % 60}m left)
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    🟡 24h Window Closed (Use Template / WhatsApp Web)
                  </span>
                )}

                {/* Direct WhatsApp Web Button in Header */}
                <a
                  href={getWhatsAppWebUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-[#00a884] rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  title="Open chat directly in WhatsApp Web"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  WA Web
                </a>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#efeae2]/90">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-xs bg-white/80 backdrop-blur-xs rounded-xl p-6 border border-slate-200/80 max-w-md mx-auto shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="font-bold text-slate-800 mb-1">New Outreach to {activeConversation?.clientName || 'Customer'}</p>
                  <p className="text-slate-500 text-[11px] mb-3">
                    No message history yet. Choose an approved template below or click &ldquo;Open in WhatsApp Web&rdquo; to send your initial greeting!
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowTemplatePicker(true)}
                      className="px-3 py-1.5 bg-[#00a884] text-white text-xs font-semibold rounded-lg hover:bg-[#008f70] transition-colors cursor-pointer"
                    >
                      📋 Pick Approved Template
                    </button>
                    <a
                      href={getWhatsAppWebUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      💬 Open in WhatsApp Web
                    </a>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  const text = msg.message || '';
                  
                  // Check if message has a document header or link
                  const hasDoc = text.includes('📄') || text.toLowerCase().includes('.pdf');
                  const lines = text.split('\n');
                  const docLine = lines.find(l => l.includes('📄') || l.toLowerCase().endsWith('.pdf'));
                  const linkLine = lines.find(l => l.startsWith('🔗') || l.startsWith('http'));
                  const cleanLink = linkLine ? linkLine.replace('🔗', '').trim() : '';

                  // Filter out doc and link lines from main body
                  const bodyLines = lines.filter(l => l !== docLine && l !== linkLine && !l.startsWith('🔘'));

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-xl text-xs leading-relaxed shadow-sm overflow-hidden ${
                          isOutbound
                            ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-[#bbf2b1]'
                            : 'bg-white text-[#111b21] rounded-tl-none border border-slate-200/80'
                        }`}
                      >
                        {/* WhatsApp Document Card Header (if attached) */}
                        {hasDoc && docLine && (
                          <div className="p-3 bg-[#e7fce3] border-b border-[#bbf2b1]/80 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex flex-col items-center justify-center shrink-0 shadow-xs font-black text-[10px] tracking-tighter">
                              <FileText className="w-4 h-4 mb-0.5" />
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate">
                                {docLine.replace('📄', '').trim() || 'Itinerary-Proposal.pdf'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">Official Document • PDF</p>
                            </div>
                          </div>
                        )}

                        {/* Message Body */}
                        <div className="px-3.5 py-2.5">
                          <p className="whitespace-pre-wrap font-normal text-slate-800 text-[13px] leading-relaxed">
                            {bodyLines.join('\n').trim()}
                          </p>

                          {/* Interactive WhatsApp Button (if present) */}
                          {cleanLink && (
                            <div className="mt-3 pt-2 border-t border-[#bbf2b1]/70">
                              <a
                                href={cleanLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-3 bg-white/90 hover:bg-white text-[#00a884] font-bold rounded-lg flex items-center justify-center gap-2 border border-[#00a884]/30 shadow-xs transition-all text-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Link
                              </a>
                            </div>
                          )}

                          {/* Timestamp & Read Receipt */}
                          <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${isOutbound ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOutbound && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Smart 24-Hour Helper Bar (Shown above input if window is closed) */}
            {!activeConversation?.isWindowOpen && (
              <div className="px-4 py-2 bg-amber-50/95 border-t border-amber-200/80 flex items-center justify-between gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-2 text-amber-900 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>24h Window Closed:</strong> Meta drops plain text. Use an approved template or WhatsApp Web to reach this customer.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{sendingTemplate ? 'Sending Template...' : 'Send Meta Template'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Template Picker Popup */}
                    {showTemplatePicker && (
                      <div className="absolute bottom-full mb-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">Approved Meta Templates</span>
                          <span className="text-[10px] text-slate-500">Delivers Outside 24h</span>
                        </div>
                        <div className="p-1.5 space-y-1 max-h-60 overflow-y-auto">
                          {APPROVED_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleSendTemplate(tpl.id)}
                              disabled={!!sendingTemplate}
                              className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/80 border border-transparent hover:border-amber-200 transition-all text-xs cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold text-slate-900">{tpl.name}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  tpl.category === 'UTILITY' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {tpl.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">{tpl.description}</p>
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
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open WhatsApp Web
                  </a>
                </div>
              </div>
            )}

            {/* Message Input Footer */}
            <div className="p-3 bg-[#f0f2f5] border-t border-slate-200">
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
                  placeholder={
                    activeConversation?.isWindowOpen 
                      ? "Type a message (24h free chat active)..." 
                      : "Type message or use 'Send Meta Template' above..."
                  }
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a884] resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="w-9 h-9 bg-[#00a884] hover:bg-[#008f70] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
                  title="Send Message"
                >
                  {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 bg-[#efeae2]/50">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00a884] flex items-center justify-center mb-3 border border-emerald-200">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm mb-1">WhatsApp Hub for TravelCRM</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Select an ongoing conversation on the left, or browse the <strong>Pipeline Leads</strong> tab to start messaging new travelers like Yatendra Singh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
