"use client";

import { useState, useEffect } from "react";
import { 
  Search, Users, User, Building2, 
  ShieldAlert, ShieldCheck, Loader2, CalendarClock, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal"; // 👈 ایمپورت مودال اضافه شد
import { createClient } from "@/lib/supabase";

interface UserProfile {
  id: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  phone_number: string | null;
  created_at: string;
  is_banned: boolean; 
}

export default function AdminUsersPage() {
  const supabase = createClient();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "job_seeker" | "employer">("all");
  
  // 👈 استیت‌های جدید برای مدیریت مودال مسدودسازی
  const [banModalState, setBanModalState] = useState<{
    isOpen: boolean;
    userId: string | null;
    isCurrentlyBanned: boolean;
  }>({
    isOpen: false,
    userId: null,
    isCurrentlyBanned: false
  });
  const [isProcessingBan, setIsProcessingBan] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name, company_name, phone_number, created_at, is_banned')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (user: UserProfile) => {
    if (user.role === 'employer' && user.company_name) {
      return user.company_name;
    }
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return "کاربر (تکمیل نشده)";
  };

  // 👈 باز کردن مودال به جای confirm()
  const confirmToggleBanStatus = (id: string, currentBanStatus: boolean) => {
    setBanModalState({
      isOpen: true,
      userId: id,
      isCurrentlyBanned: currentBanStatus
    });
  };

  // 👈 عملیات اصلی تغییر وضعیت داخل این تابع انجام میشه
  const executeToggleBan = async () => {
    const { userId, isCurrentlyBanned } = banModalState;
    if (!userId) return;

    setIsProcessingBan(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !isCurrentlyBanned })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !isCurrentlyBanned } : u));
      setBanModalState({ isOpen: false, userId: null, isCurrentlyBanned: false });
    } catch (err) {
      console.error("Error toggling ban status:", err);
      alert("خطا در ارتباط با سرور. تغییرات انجام نشد.");
    } finally {
      setIsProcessingBan(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const displayName = getDisplayName(user).toLowerCase();
    const phone = user.phone_number || "";
    const matchesSearch = displayName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);

    return matchesRole && matchesSearch;
  });

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          کاربران پلتفرم
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          لیست تمامی کاربران (کارجویان و کارفرمایان) ثبت‌نام شده در جابیکس.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center flex-1">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا شماره موبایل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-10 px-3 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              roleFilter === "all" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setRoleFilter("job_seeker")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              roleFilter === "job_seeker" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            کارجویان
          </button>
          <button
            onClick={() => setRoleFilter("employer")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              roleFilter === "employer" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            کارفرمایان
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">نام / برند</th>
                <th className="px-6 py-4 font-medium text-center">شماره موبایل</th>
                <th className="px-6 py-4 font-medium text-center">نقش کاربری</th>
                <th className="px-6 py-4 font-medium text-center">تاریخ عضویت</th>
                <th className="px-6 py-4 font-medium text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`transition-colors ${user.is_banned ? 'bg-red-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-bold ${
                          user.is_banned ? 'bg-red-100 text-red-500 border-red-200' :
                          user.role === 'employer' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {user.role === 'employer' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <span className={`font-bold ${user.is_banned ? 'text-red-700 line-through' : 'text-slate-900'}`}>
                            {getDisplayName(user)}
                          </span>
                          {user.is_banned && <span className="block text-[10px] text-red-500 font-bold mt-0.5">مسدود شده</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600" dir="ltr">
                      {user.phone_number || 'نامشخص'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.role === 'employer' ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">کارفرما</span>
                      ) : user.role === 'job_seeker' ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">کارجو</span>
                      ) : user.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">مدیر سیستم</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">نامشخص</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        {new Date(user.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      {user.role !== 'admin' && (
                        <button 
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            user.is_banned 
                              ? 'border-green-200 text-green-600 hover:bg-green-50' 
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                          onClick={() => confirmToggleBanStatus(user.id, user.is_banned)}
                        >
                          {user.is_banned ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldAlert className="h-4 w-4" />
                          )}
                          {user.is_banned ? 'رفع مسدودی' : 'مسدود کردن'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    کاربری با این مشخصات یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 👈 مودال جایگزین دیالوگ مرورگر */}
      <Modal 
        isOpen={banModalState.isOpen} 
        onClose={() => !isProcessingBan && setBanModalState({ ...banModalState, isOpen: false })}
        title={banModalState.isCurrentlyBanned ? "رفع مسدودی کاربر" : "مسدودسازی حساب کاربر"}
      >
        <div className="flex flex-col items-center text-center pb-4 pt-2">
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${banModalState.isCurrentlyBanned ? 'bg-green-100' : 'bg-red-100'}`}>
            {banModalState.isCurrentlyBanned ? (
              <ShieldCheck className="h-7 w-7 text-green-600" />
            ) : (
              <AlertCircle className="h-7 w-7 text-red-600" />
            )}
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {banModalState.isCurrentlyBanned 
              ? "آیا از رفع مسدودی این کاربر مطمئن هستید؟" 
              : "آیا از مسدود کردن این کاربر اطمینان دارید؟"
            }
          </h3>
          
          <p className="text-sm text-slate-500 leading-relaxed">
            {banModalState.isCurrentlyBanned 
              ? "با تایید این مورد، کاربر مجدداً می‌تواند وارد حساب خود شده و فعالیت کند." 
              : "با این کار، کاربر فوراً از سیستم اخراج شده و دیگر اجازه ورود به حساب کاربری خود را نخواهد داشت."
            }
          </p>

          <div className="mt-8 flex w-full gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => setBanModalState({ ...banModalState, isOpen: false })} 
              disabled={isProcessingBan}
            >
              انصراف
            </Button>
            <Button 
              className={`flex-1 h-12 border-none ${banModalState.isCurrentlyBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`} 
              onClick={executeToggleBan} 
              isLoading={isProcessingBan}
            >
              {banModalState.isCurrentlyBanned ? "بله، رفع مسدودی شود" : "بله، کاربر مسدود شود"}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}