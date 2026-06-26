"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Building2, User, CheckCheck, Loader2, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface Conversation {
  id: string;
  employer_id: string;
  job_id: string;
  employer: { company_name: string; logo_url: string };
  job: { title: string };
  updated_at: string;
  unread_count?: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function JobSeekerMessagesPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // 🔥 استیت برای کاربران آنلاین

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ۱. واکشی لیست گفتگوها
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id, employer_id, job_id, updated_at,
            employer:profiles!conversations_employer_id_fkey(company_name, logo_url),
            job:jobs(title),
            messages (id, is_read, sender_id)
          `)
          .eq('job_seeker_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formatted = data?.map((conv: any) => {
          const unread = conv.messages?.filter((m: any) => !m.is_read && m.sender_id !== user.id).length || 0;
          return {
            ...conv,
            employer: Array.isArray(conv.employer) ? conv.employer[0] : conv.employer,
            job: Array.isArray(conv.job) ? conv.job[0] : conv.job,
            unread_count: unread
          };
        }) || [];

        setConversations(formatted);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchConversations();
  }, [user?.id, supabase]);

  // ۲. مدیریت Presence (آنلاین بودن)
  useEffect(() => {
    if (!user?.id) return;

    const presenceChannel = supabase.channel('global_presence');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineIds = Object.values(state).flatMap((clients: any) => clients.map((c: any) => c.user_id));
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id, supabase]);

  // ۳. مدیریت پیام‌ها
  useEffect(() => {
    if (!activeChat || !user?.id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', activeChat.id)
        .neq('sender_id', user.id)
        .eq('is_read', false);
        
      setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, unread_count: 0 } : c));
    };

    fetchMessages();

    const channel = supabase.channel(`chat_${activeChat.id}`, {
      config: { broadcast: { self: false } }
    });
    channelRef.current = channel;

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChat.id}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
        
        if (newMsg.sender_id !== user.id) {
          supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id).then();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChat.id}` }, (payload) => {
        setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg));
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user.id) {
          setIsOtherTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, user?.id, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !activeChat) return;

    setIsSending(true);
    const text = newMessage;
    setNewMessage(""); 

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeChat.id,
          sender_id: user.id,
          content: text
        });

      if (error) throw error;
      
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeChat.id);
      
      setConversations(prev => {
        const chat = prev.find(c => c.id === activeChat.id);
        const others = prev.filter(c => c.id !== activeChat.id);
        if (chat) return [{ ...chat, updated_at: new Date().toISOString() }, ...others];
        return prev;
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(text); 
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (channelRef.current && user?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id }
      });
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      
      {/* لیست گفتگوها (سایدبار راست) */}
      <div className={`w-full lg:w-1/3 flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            پیام‌ها و گفتگوها
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoadingChats ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              // بررسی آنلاین بودن کارفرما
              const isEmployerOnline = onlineUsers.includes(conv.employer_id);

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full text-right p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    activeChat?.id === conv.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary font-bold overflow-hidden border border-slate-200">
                    {conv.employer.logo_url ? <img src={conv.employer.logo_url} className="w-full h-full object-cover" alt="logo" /> : <Building2 className="h-6 w-6" />}
                    {/* 🔥 نقطه سبز نشانگر آنلاین بودن */}
                    {isEmployerOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 truncate">{conv.employer.company_name || 'شرکت نامشخص'}</h4>
                      {(conv.unread_count || 0) > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">آگهی: {conv.job?.title || 'نامشخص'}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
              هنوز گفتگویی ندارید.
            </div>
          )}
        </div>
      </div>

      {/* محیط چت (سمت چپ) */}
      <div className={`w-full lg:w-2/3 flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* هدر چت */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-100 bg-slate-50/50 relative z-10 shadow-sm">
              <button onClick={() => setActiveChat(null)} className="lg:hidden text-slate-500 p-2">
                بازگشت
              </button>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-primary font-bold overflow-hidden border border-slate-200">
                {activeChat.employer.logo_url ? <img src={activeChat.employer.logo_url} className="w-full h-full object-cover" alt="logo" /> : <Building2 className="h-6 w-6" />}
                {/* 🔥 نقطه سبز هدر */}
                {onlineUsers.includes(activeChat.employer_id) && (
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{activeChat.employer.company_name || 'شرکت نامشخص'}</h3>
                <p className="text-xs mt-0.5 font-medium flex items-center gap-1">
                  {onlineUsers.includes(activeChat.employer_id) ? (
                    <span className="text-green-600">آنلاین</span>
                  ) : (
                    <span className="text-slate-400">آفلاین</span>
                  )}
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">مرتبط با آگهی: {activeChat.job?.title}</span>
                </p>
              </div>
            </div>

            {/* لیست پیام‌ها */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 px-4 ${
                      isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isMe ? 'text-primary-100 justify-end' : 'text-slate-400 justify-start'}`}>
                        {formatTime(msg.created_at)}
                        {isMe && (
                          msg.is_read ? <CheckCheck className="h-3.5 w-3.5 text-blue-300 ml-1" /> : <Check className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isOtherTyping && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 px-4 flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* فرم ارسال */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 h-12 rounded-xl bg-slate-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button type="submit" disabled={!newMessage.trim() || isSending} className="h-12 w-12 rounded-xl shrink-0 p-0 flex items-center justify-center shadow-md">
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 rotate-180" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <p>برای شروع چت، یک گفتگو را انتخاب کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
}