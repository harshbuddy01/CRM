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
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';

interface Conversation {
  phone: string;
  clientName: string | null;
  lastMessage: string;
  lastMessageAt: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  phone: string;
  direction: 'INBOUND' | 'OUTBOUND';
  message: string;
  status: string;
  createdAt: string;
}

export default function WhatsAppChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/whatsapp-chat/conversations');
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
        if (!selectedPhone && res.data.conversations?.length > 0) {
          const first = res.data.conversations[0];
          setSelectedPhone(first.phone);
          setActiveConversation(first);
        }
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp conversations', err);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 2000); // 2s realtime sync
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchChatHistory(selectedPhone);
      const interval = setInterval(() => fetchChatHistory(selectedPhone), 2000); // 2s realtime sync
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
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send WhatsApp message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.phone.includes(searchQuery) || 
    (c.clientName && c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              WhatsApp Live Inbox
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium flex items-center gap-1 border border-white/30">
                <ShieldCheck className="w-3 h-3" /> Meta Cloud API
              </span>
            </h1>
            <p className="text-[11px] text-emerald-100/90 font-medium">Realtime Customer & Driver Messaging</p>
          </div>
        </div>
        <button 
          onClick={() => {
            fetchConversations();
            if (selectedPhone) fetchChatHistory(selectedPhone);
          }}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          title="Refresh Inbox Now"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main 2-Column Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversations List */}
        <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col">
          {/* Search Box */}
          <div className="p-3 bg-[#f0f2f5] border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search or start new chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No WhatsApp conversations yet.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedPhone === conv.phone;
                return (
                  <button
                    key={conv.phone}
                    onClick={() => {
                      setSelectedPhone(conv.phone);
                      setActiveConversation(conv);
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-all ${
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
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-normal">
                        {conv.direction === 'OUTBOUND' && <span className="text-[#00a884] font-medium">You: </span>}
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[#25d366] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Window */}
        {selectedPhone ? (
          <div className="flex-1 flex flex-col bg-[#efeae2]">
            {/* Active Chat Header */}
            <div className="px-5 py-2.5 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00a884] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {activeConversation?.clientName ? activeConversation.clientName[0].toUpperCase() : <Phone className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900">
                    {activeConversation?.clientName || `Customer (+${selectedPhone})`}
                  </h2>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    +{selectedPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#00a884] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse"></span> Active Online
                </span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#efeae2]/90">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-12 text-xs bg-white/70 backdrop-blur-xs rounded-xl p-6 border border-slate-200/60 max-w-md mx-auto shadow-xs">
                  No message history yet. Type below to send a WhatsApp message!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                          isOutbound
                            ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-[#bbf2b1]'
                            : 'bg-white text-[#111b21] rounded-tl-none border border-slate-200/80'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOutbound ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOutbound && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

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
                  placeholder="Type a message..."
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a884] resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="w-9 h-9 bg-[#00a884] hover:bg-[#008f70] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-sm shrink-0"
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
            <h3 className="font-bold text-slate-700 text-sm mb-1">WhatsApp Web for TravelCRM</h3>
            <p className="text-xs text-slate-500">Select a client conversation on the left to start chatting in real time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
