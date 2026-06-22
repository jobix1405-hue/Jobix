"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, CheckCheck, Loader2, MessageSquare, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface Conversation {
  id: string;
  job_seeker_id: string;
  job_id: string;
  job_seeker: { first_name: string; last_name: string; avatar_url: string };
  job: { title: string };
  updated_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function EmployerMessagesPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // واکشی لیست گفتگوهای کارفرما
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id, job_seeker_id, job_id, updated_at,
            job_seeker:profiles!conversations_job_seeker_id_fkey(first_name, last_name, avatar_url),
            job:jobs(title)
          `)
          .eq('employer_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formatted = data?.map((conv: any) => ({
          ...conv,
          job_seeker: Array.isArray(conv.job_seeker) ? conv.job_seeker[0] : conv.job_seeker,
          job: Array.isArray(conv.job) ? conv.job[0] : conv.job,
        })) || [];

        setConversations(formatted);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchConversations();
  }, [user?.id, supabase]);

  // واکشی پیام‌ها و اتصال زنده
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase.channel(`chat_${activeChat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${activeChat.id}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      
      {/* لیست کارجویان (سایدبار راست) */}
      <div className={`w-full lg:w-1/3 flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            گفتگو با متقاضیان
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoadingChats ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv)}
                className={`w-full text-right p-3 rounded-2xl flex items-center gap-3 transition-all ${
                  activeChat?.id === conv.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 overflow-hidden border border-slate-200">
                  {conv.job_seeker.avatar_url ? <img src={conv.job_seeker.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <User className="h-6 w-6" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-slate-900 truncate">
                    {conv.job_seeker.first_name ? `${conv.job_seeker.first_name} ${conv.job_seeker.last_name}` : 'کارجو بدون نام'}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-1 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {conv.job?.title || 'نامشخص'}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm px-4">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
              برای ایجاد چت جدید، در صفحه مدیریت رزومه‌ها (ATS) درخواست ارتباط را بزنید.
            </div>
          )}
        </div>
      </div>

      {/* محیط چت (سمت چپ) */}
      <div className={`w-full lg:w-2/3 flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* هدر چت */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
              <button onClick={() => setActiveChat(null)} className="lg:hidden text-slate-500 p-2">
                بازگشت
              </button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 overflow-hidden">
                {activeChat.job_seeker.avatar_url ? <img src={activeChat.job_seeker.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <User className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {activeChat.job_seeker.first_name ? `${activeChat.job_seeker.first_name} ${activeChat.job_seeker.last_name}` : 'کارجو'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">متقاضی موقعیت: {activeChat.job?.title}</p>
              </div>
            </div>

            {/* لیست پیام‌ها */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 px-4 ${
                      isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isMe ? 'text-primary-100 justify-end' : 'text-slate-400 justify-start'}`}>
                        {formatTime(msg.created_at)}
                        {isMe && <CheckCheck className="h-3 w-3 ml-1" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* فرم ارسال */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پیام خود را به کارجو بنویسید..."
                  className="flex-1 h-12 rounded-xl bg-slate-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button type="submit" disabled={!newMessage.trim() || isSending} className="h-12 w-12 rounded-xl shrink-0 p-0 flex items-center justify-center">
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 rotate-180" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="h-24 w-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <p>برای شروع چت، یک گفتگو را از لیست انتخاب کنید.</p>
          </div>
        )}
      </div>

    </div>
  );
}