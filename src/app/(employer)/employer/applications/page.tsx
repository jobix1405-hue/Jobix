"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  GripVertical, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Loader2,
  AlertCircle,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronDown,
  Tag,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { calculateMatchScore } from "@/lib/matching";

// === DND-KIT Imports ===
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type ApplicationStatus = "pending" | "reviewed" | "interview" | "rejected";

interface ApplicationData {
  id: string;
  applicantName: string;
  applicantPhone: string;
  jobTitle: string;
  date: string;
  matchScore: number;
  status: ApplicationStatus;
  jobSeekerId: string;
  jobId: string; 
  avatarUrl: string;
  aboutMe: string;
  skills: string;
}

// 👈 تایپ ساده برای لیست آگهی‌های کارفرما (برای فیلتر)
interface EmployerJobOption {
  id: string;
  title: string;
}

// از روی نام و نام‌خانوادگی، حروف اول برای آواتار جایگزین می‌سازد
const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[1].charAt(0);
};

const COLUMNS = [
  { id: "pending", title: "دریافت شده", icon: Clock, color: "border-orange-200 bg-orange-50 text-orange-700" },
  { id: "reviewed", title: "در حال بررسی", icon: Eye, color: "border-blue-200 bg-blue-50 text-blue-700" },
  { id: "interview", title: "دعوت به مصاحبه", icon: CheckCircle2, color: "border-green-200 bg-green-50 text-green-700" },
  { id: "rejected", title: "رد شده", icon: XCircle, color: "border-red-200 bg-red-50 text-red-700" },
];

const PAGE_SIZE = 50; // تعداد رزومه‌هایی که در هر مرحله لود می‌شوند
const JOB_FILTER_ALL = "all"; // 👈 مقدار ثابت برای گزینه «همه آگهی‌ها» در فیلتر

// ==========================================
// 1. کامپوننت کارت رزومه
// ==========================================
const ApplicationCard = ({ 
  app, 
  handleStartChat, 
  isStartingChat, 
  isOverlay = false 
}: { 
  app: ApplicationData, 
  handleStartChat?: (app: ApplicationData) => void, 
  isStartingChat?: string | null,
  isOverlay?: boolean
}) => {
  const skillTags = app.skills ? app.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const visibleSkills = skillTags.slice(0, 3);
  const extraSkillsCount = skillTags.length - visibleSkills.length;

  return (
    <div className={`group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all ${isOverlay ? 'shadow-2xl ring-2 ring-primary/50 rotate-2 cursor-grabbing' : 'hover:border-primary/30 hover:shadow-md cursor-grab'}`}>
      <div className="absolute left-3 top-4 text-slate-300 group-hover:text-slate-400">
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/10">
          {app.avatarUrl ? (
            <img src={app.avatarUrl} alt={app.applicantName} className="h-full w-full object-cover" />
          ) : (
            getInitials(app.applicantName)
          )}
        </div>
        <div className="pl-6">
          <h4 className="font-bold text-slate-900 line-clamp-1">{app.applicantName}</h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">{app.jobTitle}</p>
        </div>
      </div>

      {/* خلاصه رزومه */}
      {app.aboutMe && (
        <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
          {app.aboutMe}
        </p>
      )}

      {/* تگ مهارت‌ها */}
      {visibleSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleSkills.map((skill, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <Tag className="h-3 w-3 text-slate-400" /> {skill}
            </span>
          ))}
          {extraSkillsCount > 0 && (
            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
              +{extraSkillsCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {app.date}
        </div>
        <div className={`flex items-center gap-1 rounded-md px-2 py-1 font-bold ${
          app.matchScore >= 75 ? "bg-green-100 text-green-700" :
          app.matchScore >= 50 ? "bg-blue-100 text-blue-700" :
          "bg-orange-100 text-orange-700"
        }`}>
          تطابق: {app.matchScore}٪
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Link href={`/employer/applications/${app.jobSeekerId}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700">
            مشاهده
          </Button>
        </Link>
        <Button 
          variant="primary" 
          size="sm" 
          className="flex-1 h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 flex items-center justify-center gap-1.5"
          onClick={() => handleStartChat && handleStartChat(app)}
          isLoading={isStartingChat === app.id}
        >
          {!isStartingChat && <MessageSquare className="h-3.5 w-3.5" />}
          پیام
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 2. کامپوننت قابل درگ شدن
// ==========================================
function DraggableItem({ app, handleStartChat, isStartingChat }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { app },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <ApplicationCard app={app} handleStartChat={handleStartChat} isStartingChat={isStartingChat} />
    </div>
  );
}

// ==========================================
// 3. کامپوننت ستون هدف
// ==========================================
function DroppableColumn({ column, apps, children }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex min-w-[300px] flex-1 flex-col rounded-2xl p-4 transition-colors ${
        isOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-slate-100/50"
      }`}
    >
      <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 ${column.color}`}>
        <div className="flex items-center gap-2 font-bold">
          <column.icon className="h-5 w-5" />
          {column.title}
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-xs font-bold text-inherit">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 min-h-[150px]">
        {children}
        {apps.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
            کارت را اینجا رها کنید
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// کامپوننت اصلی صفحه
// ==========================================
export default function EmployerApplicationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  const [activeDragApp, setActiveDragApp] = useState<ApplicationData | null>(null);

  // استیت‌های مربوط به جستجو و صفحه‌بندی
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 👈 استیت‌های مربوط به فیلتر بر اساس آگهی
  const [employerJobs, setEmployerJobs] = useState<EmployerJobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(JOB_FILTER_ALL);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  const fetchApplications = async (pageIndex: number, isAppend: boolean = false) => {
    if (!user?.id) return;
    
    if (isAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error: fetchError } = await supabase
        .from('applications')
        .select(`
          id, status, created_at, job_seeker_id,
          jobs!inner (id, title, description, employer_id),
          profiles!applications_job_seeker_id_fkey (first_name, last_name, phone_number, job_title, skills, avatar_url, about_me)
        `, { count: 'exact' })
        .eq('jobs.employer_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      if (data) {
        const formattedData: ApplicationData[] = data.map((app: any) => {
          const realMatchScore = calculateMatchScore(
            { job_title: app.profiles?.job_title, skills: app.profiles?.skills },
            { title: app.jobs?.title, description: app.jobs?.description }
          );

          return {
            id: app.id,
            applicantName: app.profiles?.first_name ? `${app.profiles.first_name} ${app.profiles.last_name}` : "کاربر بدون نام",
            applicantPhone: app.profiles?.phone_number || "", 
            jobTitle: app.jobs?.title || "نامشخص",
            date: new Date(app.created_at).toLocaleDateString('fa-IR'),
            matchScore: realMatchScore,
            status: app.status as ApplicationStatus,
            jobSeekerId: app.job_seeker_id,
            jobId: app.jobs?.id,
            avatarUrl: app.profiles?.avatar_url || "",
            aboutMe: app.profiles?.about_me || "",
            skills: app.profiles?.skills || ""
          };
        });

        if (isAppend) {
          setApplications(prev => [...prev, ...formattedData]);
        } else {
          setApplications(formattedData);
        }

        // بررسی اینکه آیا رکوردهای بیشتری در دیتابیس وجود دارد یا خیر
        if (count !== null && (pageIndex + 1) * PAGE_SIZE >= count) {
          setHasMore(false);
        } else if (data.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err: any) {
      console.error("خطا در دریافت رزومه‌ها:", err);
      setError("خطایی در دریافت رزومه‌ها رخ داد. لطفاً صفحه را رفرش کنید.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 👈 واکشی مستقل لیست کامل آگهی‌های کارفرما (برای پر کردن فیلتر)
  // این واکشی جدا از رزومه‌هاست تا حتی آگهی‌های بدون رزومه هم در فیلتر دیده شوند
  const fetchEmployerJobs = async () => {
    if (!user?.id) return;
    try {
      const { data, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setEmployerJobs(data || []);
    } catch (err) {
      console.error("خطا در دریافت لیست آگهی‌ها برای فیلتر:", err);
    }
  };

  // واکشی اولیه در زمان لود کامپوننت
  useEffect(() => {
    fetchApplications(0, false);
    fetchEmployerJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, supabase]);

  // هندلر دکمه بارگذاری بیشتر
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchApplications(nextPage, true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedApp = applications.find((app) => app.id === active.id);
    if (draggedApp) setActiveDragApp(draggedApp);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragApp(null);

    if (!over) return;

    const appId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    const targetApp = applications.find((app) => app.id === appId);
    if (!targetApp || targetApp.status === newStatus) return;

    const previousStatus = targetApp.status;

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (updateError) throw updateError;

      // ارسال پیامک
      if (targetApp.applicantPhone) {
        let statusFa = "";
        if (newStatus === "reviewed") statusFa = "دیده شده";
        else if (newStatus === "interview") statusFa = "دعوت به مصاحبه";
        else if (newStatus === "rejected") statusFa = "رد شده";

        if (statusFa) {
          const smsMessage = `کارجوی گرامی ${targetApp.applicantName}، وضعیت رزومه شما برای شغل "${targetApp.jobTitle}" به "${statusFa}" تغییر یافت. جابیکس`;
          
          fetch('/api/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: targetApp.applicantPhone,
              customMessage: smsMessage
            })
          }).catch(err => console.error("Error triggering SMS API:", err));
        }
      }

    } catch (err) {
      console.error("خطا در آپدیت وضعیت:", err);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: previousStatus } : app))
      );
      alert("خطا در تغییر وضعیت رزومه. لطفاً دوباره تلاش کنید.");
    }
  };

  const handleStartChat = async (app: ApplicationData) => {
    if (!user?.id) return;
    setIsStartingChat(app.id);

    try {
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id, is_deleted_by_employer, is_deleted_by_seeker')
        .eq('employer_id', user.id)
        .eq('job_seeker_id', app.jobSeekerId)
        .eq('job_id', app.jobId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingConv) {
        // اگر خود کارفرما قبلاً حذفش کرده بود یا کارجو رد/حذفش کرده بود، دوباره فعالش می‌کنیم
        if (existingConv.is_deleted_by_employer || existingConv.is_deleted_by_seeker) {
          await supabase
            .from('conversations')
            .update({ 
              is_deleted_by_employer: false, 
              is_deleted_by_seeker: false,
              status: 'pending_seeker', 
              requested_by: 'employer' 
            })
            .eq('id', existingConv.id);
        }
        router.push('/employer/messages');
        return;
      }

      const { error: insertError } = await supabase
        .from('conversations')
        .insert({
          employer_id: user.id,
          job_seeker_id: app.jobSeekerId,
          job_id: app.jobId,
          status: 'pending_seeker',
          requested_by: 'employer'
        });

      if (insertError) throw insertError;
      router.push('/employer/messages');
      
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("خطا در برقراری ارتباط با سرور چت.");
    } finally {
      setIsStartingChat(null);
    }
  };

  // 👈 گزینه‌های فیلتر آگهی: «همه آگهی‌ها» + لیست آگهی‌های کارفرما
  const jobFilterOptions = [
    { value: JOB_FILTER_ALL, label: "همه آگهی‌ها" },
    ...employerJobs.map((job) => ({ value: job.id, label: job.title })),
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // 👈 فیلتر بر اساس آگهی انتخاب شده (اگر «همه آگهی‌ها» نبود)
    const matchesJob = selectedJobId === JOB_FILTER_ALL || app.jobId === selectedJobId;

    return matchesSearch && matchesJob;
  });

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">در حال بارگذاری برد کانبان...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500 pb-6">
      
      <button 
        onClick={() => router.back()} 
        className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
      >
        <ChevronLeft className="h-4 w-4" /> بازگشت
      </button>

      <div className="mb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت رزومه‌ها (ATS)</h1>
          <p className="mt-2 text-sm text-slate-500">
            برای تغییر وضعیت، کارت‌ها را کشیده و رها کنید (پیامک به صورت خودکار ارسال می‌شود).
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* 👈 فیلتر بر اساس آگهی شغلی */}
          <div className="relative w-full sm:w-64">
            <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full h-10 pl-8 pr-9 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
            >
              {jobFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="جستجوی نام کارجو یا عنوان آگهی..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-10 pl-3 pr-9 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" 
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* پیام راهنما وقتی فیلتر آگهی فعال است */}
      {selectedJobId !== JOB_FILTER_ALL && (
        <p className="mb-4 text-xs text-slate-400">
          * فیلتر آگهی روی رزومه‌های لود شده اعمال می‌شود. اگر رزومه مورد نظر را ندیدید، «بارگذاری رزومه‌های قدیمی‌تر» را در پایین صفحه بزنید.
        </p>
      )}

      {/* DND Context Wrap */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-x-auto pb-4 lg:flex-row">
          {COLUMNS.map((column) => {
            const columnApps = filteredApplications.filter((app) => app.status === column.id);

            return (
              <DroppableColumn key={column.id} column={column} apps={columnApps}>
                {columnApps.map((app) => (
                  <DraggableItem 
                    key={app.id} 
                    app={app} 
                    handleStartChat={handleStartChat}
                    isStartingChat={isStartingChat} 
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragApp ? (
            <ApplicationCard app={activeDragApp} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* دکمه بارگذاری بیشتر رزومه‌ها */}
      {hasMore && !searchTerm && selectedJobId === JOB_FILTER_ALL && (
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore} 
            isLoading={isLoadingMore}
            className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-sm"
          >
            {!isLoadingMore && <ChevronDown className="ml-2 h-4 w-4" />}
            بارگذاری رزومه‌های قدیمی‌تر
          </Button>
        </div>
      )}

      {(searchTerm || selectedJobId !== JOB_FILTER_ALL) && hasMore && (
        <p className="text-center text-xs text-slate-400 mt-4">
          * جستجو/فیلتر در میان رزومه‌های لود شده انجام می‌شود. برای دیدن رزومه‌های قدیمی‌تر، ابتدا فیلترها را پاک کرده و رزومه‌های بیشتری بارگذاری کنید.
        </p>
      )}
    </div>
  );
}