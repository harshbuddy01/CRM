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
    const interval = setInterval(fetchConversations, 5000); // Auto-refresh conversation list every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchChatHistory(selectedPhone);
      const interval = setInterval(() => fetchChatHistory(selectedPhone), 3000); // Auto-refresh messages every 3s
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
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Bar Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              WhatsApp Live Inbox
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Meta Official Cloud API
              </span>
            </h1>
            <p className="text-xs text-slate-400">2-Way Realtime WhatsApp Chat with Customers & Drivers</p>
          </div>
        </div>
        <button 
          onClick={fetchConversations}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Refresh Conversations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main 2-Column Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversations List */}
        <div className="w-80 md:w-96 bg-slate-950/40 border-r border-slate-800 flex flex-col">
          {/* Search Input */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by client or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Conversations Scroll View */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No active WhatsApp chats found.</div>
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
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-500' 
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 shrink-0">
                      {conv.clientName ? conv.clientName[0].toUpperCase() : <User className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {conv.clientName || `+${conv.phone}`}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate font-normal">
                        {conv.direction === 'OUTBOUND' && <span className="text-emerald-400 font-medium">You: </span>}
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        {selectedPhone ? (
          <div className="flex-1 flex flex-col bg-slate-900/50">
            {/* Chat Top Info Bar */}
            <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {activeConversation?.clientName ? activeConversation.clientName[0].toUpperCase() : <Phone className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-100">
                    {activeConversation?.clientName || `Customer (+${selectedPhone})`}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> +{selectedPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                </span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-12 text-xs">
                  No previous chat history for this number. Start typing below to send a message!
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
                        className={`max-w-[75%] rounded-2xl px-4.5 py-3 text-xs leading-relaxed ${
                          isOutbound
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-lg shadow-emerald-950/40'
                            : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${isOutbound ? 'text-emerald-100/80' : 'text-slate-400'}`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOutbound && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Box */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply... (Press Enter to send)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="h-12 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-lg shadow-emerald-950/50"
                >
                  {sending ? 'Sending...' : (
                    <>
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
            <p className="text-sm font-medium text-slate-400">Select a conversation from the left to view chat history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
