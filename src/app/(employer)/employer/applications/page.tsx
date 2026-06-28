"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  GripVertical, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Loader2,
  AlertCircle,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronDown
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
}

const COLUMNS = [
  { id: "pending", title: "دریافت شده", icon: Clock, color: "border-orange-200 bg-orange-50 text-orange-700" },
  { id: "reviewed", title: "در حال بررسی", icon: Eye, color: "border-blue-200 bg-blue-50 text-blue-700" },
  { id: "interview", title: "دعوت به مصاحبه", icon: CheckCircle2, color: "border-green-200 bg-green-50 text-green-700" },
  { id: "rejected", title: "رد شده", icon: XCircle, color: "border-red-200 bg-red-50 text-red-700" },
];

const PAGE_SIZE = 50; // تعداد رزومه‌هایی که در هر مرحله لود می‌شوند

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
}) => (
  <div className={`group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all ${isOverlay ? 'shadow-2xl ring-2 ring-primary/50 rotate-2 cursor-grabbing' : 'hover:border-primary/30 hover:shadow-md cursor-grab'}`}>
    <div className="absolute left-3 top-4 text-slate-300 group-hover:text-slate-400">
      <GripVertical className="h-5 w-5" />
    </div>

    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <User className="h-5 w-5" />
      </div>
      <div className="pl-6">
        <h4 className="font-bold text-slate-900 line-clamp-1">{app.applicantName}</h4>
        <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">{app.jobTitle}</p>
      </div>
    </div>

    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
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
      <Link href={`/employer/applicant/${app.jobSeekerId}`} className="flex-1">
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
          profiles!applications_job_seeker_id_fkey (first_name, last_name, phone_number, job_title, skills)
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
            jobId: app.jobs?.id
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

  // واکشی اولیه در زمان لود کامپوننت
  useEffect(() => {
    fetchApplications(0, false);
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
        .select('id, is_deleted_by_employer')
        .eq('employer_id', user.id)
        .eq('job_seeker_id', app.jobSeekerId)
        .eq('job_id', app.jobId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingConv) {
        if (existingConv.is_deleted_by_employer) {
          await supabase
            .from('conversations')
            .update({ 
              is_deleted_by_employer: false, 
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

  const filteredApplications = applications.filter(app => 
    app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">در حال بارگذاری برد کانبان...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500 pb-10">
      
      <button 
        onClick={() => router.back()} 
        className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
      >
        <ChevronLeft className="h-4 w-4" /> بازگشت
      </button>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت رزومه‌ها (ATS)</h1>
          <p className="mt-2 text-sm text-slate-500">
            برای تغییر وضعیت، کارت‌ها را کشیده و رها کنید (پیامک به صورت خودکار ارسال می‌شود).
          </p>
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

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* DND Context Wrap */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 flex-col gap-6 overflow-x-auto pb-4 lg:flex-row">
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
      {hasMore && !searchTerm && (
        <div className="mt-8 flex justify-center">
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

      {searchTerm && hasMore && (
        <p className="text-center text-xs text-slate-400 mt-6">
          * جستجو در میان رزومه‌های لود شده انجام می‌شود. برای جستجوی رزومه‌های قدیمی‌تر، ابتدا فیلتر را پاک کرده و رزومه‌های بیشتری بارگذاری کنید.
        </p>
      )}
    </div>
  );
}