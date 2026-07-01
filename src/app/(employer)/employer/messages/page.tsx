"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, User, CheckCheck, Loader2, MessageSquare, 
  Briefcase, Check, BellRing, Trash2, ShieldAlert, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal"; // 👈 ایمپورت مودال اضافه شد
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface Conversation {
  id: string;
  job_seeker_id: string;
  job_id: string;
  job_seeker: { first_name: string; last_name: string; avatar_url: string };
  job: { title: string };
  updated_at: string;
  status: string;
  requested_by: string;
  is_deleted_by_employer: boolean;
  unread_count?: number; 
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
  
  // تب‌های بخش پیام‌ها
  const [activeTab, setActiveTab] = useState<"chats" | "requests">("chats");

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // 👈 استیت‌های مودال زیبای حذف چت
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ۱. واکشی لیست گفتگوها
  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, job_seeker_id, job_id, updated_at, status, requested_by, is_deleted_by_employer,
          job_seeker:profiles!conversations_job_seeker_id_fkey(first_name, last_name, avatar_url),
          job:jobs(title),
          messages (id, is_read, sender_id)
        `)
        .eq('employer_id', user.id)
        .eq('is_deleted_by_employer', false) 
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formatted = data?.map((conv: any) => {
        const unread = conv.messages?.filter((m: any) => !m.is_read && m.sender_id !== user.id).length || 0;
        return {
          ...conv,
          job_seeker: Array.isArray(conv.job_seeker) ? conv.job_seeker[0] : conv.job_seeker,
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

  useEffect(() => {
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
        if (status === 'SUBSCRIBED') await presenceChannel.track({ user_id: user.id });
      });

    return () => { supabase.removeChannel(presenceChannel); };
  }, [user?.id, supabase]);

  // ۳. مدیریت پیام‌های چت فعال
  useEffect(() => {
    if (!activeChat || !user?.id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);

      if (activeChat.status === 'active') {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', activeChat.id)
          .neq('sender_id', user.id)
          .eq('is_read', false);
          
        setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, unread_count: 0 } : c));
      }
    };

    fetchMessages();

    const channel = supabase.channel(`chat_${activeChat.id}`, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeChat.id}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
        
        if (newMsg.sender_id !== user.id && activeChat.status === 'active') {
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

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, user?.id, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !activeChat || activeChat.status !== 'active') return;

    setIsSending(true);
    const text = newMessage;
    setNewMessage(""); 

    try {
      const { error } = await supabase.from('messages').insert({
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
    if (channelRef.current && user?.id && activeChat?.status === 'active') {
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { user_id: user.id } });
    }
  };

  const handleAcceptRequest = async () => {
    if (!activeChat) return;
    try {
      await supabase.from('conversations').update({ status: 'active' }).eq('id', activeChat.id);
      setActiveChat({ ...activeChat, status: 'active' });
      fetchConversations();
    } catch (err) { alert("خطا در پذیرش چت"); }
  };

  // 👈 این تابع حالا به جای کادر زشت مرورگر، دیالوگ رو باز میکنه
  const confirmDeleteChat = () => {
    setIsDeleteModalOpen(true);
  };

  // 👈 این تابع عملیات اصلی پاک کردن رو انجام میده
  const executeDeleteChat = async () => {
    if (!activeChat) return;
    setIsDeletingChat(true);
    try {
      await supabase.from('conversations').update({ is_deleted_by_employer: true }).eq('id', activeChat.id);
      setActiveChat(null);
      fetchConversations();
      setIsDeleteModalOpen(false);
    } catch (err) { 
      alert("خطا در حذف چت"); 
    } finally {
      setIsDeletingChat(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  const pendingRequests = conversations.filter(c => c.status === 'pending_employer');
  const activeChats = conversations.filter(c => c.status === 'active' || c.status === 'pending_seeker');
  const displayList = activeTab === "requests" ? pendingRequests : activeChats;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      
      {/* سایدبار راست: لیست گفتگوها */}
      <div className={`w-full lg:w-1/3 flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
        
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            گفتگو با متقاضیان
          </h2>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "chats" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              پیام‌های من
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "requests" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              درخواست‌ها
              {pendingRequests.length > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoadingChats ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : displayList.length > 0 ? (
            displayList.map((conv) => {
              const isSeekerOnline = onlineUsers.includes(conv.job_seeker_id);

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full text-right p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    activeChat?.id === conv.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    {conv.job_seeker.avatar_url ? <img src={conv.job_seeker.avatar_url} className="w-full h-full object-cover rounded-full" alt="avatar" /> : <User className="h-6 w-6" />}
                    {isSeekerOnline && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 truncate">
                        {conv.job_seeker.first_name ? `${conv.job_seeker.first_name} ${conv.job_seeker.last_name}` : 'کارجو'}
                      </h4>
                      {(conv.unread_count || 0) > 0 && activeTab === "chats" && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {conv.job?.title || 'نامشخص'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm px-4">
              {activeTab === "requests" ? (
                <>
                  <BellRing className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  هیچ درخواست چت جدیدی ندارید.
                </>
              ) : (
                <>
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  هنوز گفتگوی فعالی ندارید.
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* محیط چت (سمت چپ) */}
      <div className={`w-full lg:w-2/3 flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChat(null)} className="lg:hidden text-slate-500 p-2">بازگشت</button>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500">
                  {activeChat.job_seeker.avatar_url ? <img src={activeChat.job_seeker.avatar_url} className="w-full h-full object-cover rounded-full" alt="avatar" /> : <User className="h-6 w-6" />}
                  {onlineUsers.includes(activeChat.job_seeker_id) && <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {activeChat.job_seeker.first_name ? `${activeChat.job_seeker.first_name} ${activeChat.job_seeker.last_name}` : 'کارجو'}
                  </h3>
                  <p className="text-xs mt-0.5 font-medium flex items-center gap-1 text-slate-500">
                    متقاضی موقعیت: {activeChat.job?.title}
                  </p>
                </div>
              </div>
              
              {/* 👈 دکمه قطع ارتباط با اتصال به Modal */}
              <button 
                onClick={confirmDeleteChat}
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100"
                title="حذف و قطع ارتباط"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              
              {activeChat.status === 'pending_employer' && (
                <div className="flex flex-col items-center justify-center py-6 my-6 bg-white border border-slate-200 rounded-3xl shadow-sm text-center p-4 mx-4">
                  <div className="h-16 w-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">درخواست شروع چت</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm">
                    این کارجو برای ارتباط با شما درخواست داده است. برای مشاهده پیام‌ها و پاسخگویی باید درخواست را بپذیرید.
                  </p>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-32 border-red-200 text-red-500 hover:bg-red-50" onClick={confirmDeleteChat}>
                      رد درخواست
                    </Button>
                    <Button className="w-full sm:w-40 bg-green-600 hover:bg-green-700 border-0" onClick={handleAcceptRequest}>
                      <CheckCircle2 className="h-4 w-4 ml-2" /> پذیرش چت
                    </Button>
                  </div>
                </div>
              )}

              {activeChat.status === 'pending_seeker' && (
                <div className="text-center py-4 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 mb-4 mx-4">
                  شما درخواست چت ارسال کرده‌اید. منتظر تایید از سمت کارجو بمانید...
                </div>
              )}

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
                        {isMe && (msg.is_read ? <CheckCheck className="h-3.5 w-3.5 text-blue-300 ml-1" /> : <Check className="h-3 w-3 ml-1" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isOtherTyping && activeChat.status === 'active' && (
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

            <div className="p-4 bg-white border-t border-slate-100">
              {activeChat.status === 'active' ? (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="پیام خود را به کارجو بنویسید..."
                    className="flex-1 h-12 rounded-xl bg-slate-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending} className="h-12 w-12 rounded-xl shrink-0 p-0 flex items-center justify-center shadow-md">
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 rotate-180" />}
                  </Button>
                </form>
              ) : (
                <div className="h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold border border-slate-100">
                  {activeChat.status === 'pending_employer' ? "ابتدا باید درخواست چت را بپذیرید" : "امکان ارسال پیام تا زمان تایید کارجو وجود ندارد"}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="h-24 w-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <p>برای شروع چت، یک گفتگو را از لیست انتخاب کنید.</p>
          </div>
        )}
      </div>

      {/* 👈 مودال جایگزین Alert مرورگر */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isDeletingChat && setIsDeleteModalOpen(false)}
        title="قطع ارتباط و حذف چت"
      >
        <div className="flex flex-col items-center text-center pb-4 pt-2">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">آیا از حذف این چت مطمئن هستید؟</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            با این کار ارتباط شما با این کارجو قطع شده و صفحه چت مخفی می‌شود. در صورت نیاز به ارتباط مجدد، باید دوباره درخواست ارسال کنید.
          </p>
          <div className="mt-6 flex w-full gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => setIsDeleteModalOpen(false)} 
              disabled={isDeletingChat}
            >
              انصراف
            </Button>
            <Button 
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-none" 
              onClick={executeDeleteChat} 
              isLoading={isDeletingChat}
            >
              بله، چت حذف شود
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}